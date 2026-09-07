/**
 * Workspace orchestration: two vanilla-jsoneditor instances, status bars,
 * panel actions (New/Open/Save/Copy/Full screen/Format), mode tabs,
 * app shortcuts, theme sync and the splitter.
 *
 * Loaded once by Workspace.astro (`initWorkspace()`); markup and styles
 * stay in the component.
 */

import {
  createJSONEditor,
  Mode,
  type Content,
  type JSONEditorPropsOptional,
  type JSONEditorSelection,
  type TextSelection,
} from 'vanilla-jsoneditor';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';
import { isDarkAppearance, APPEARANCE_EVENT, SPLITTER_KEY } from './appearance';
import { registerShortcuts, type PanelSide } from './shortcuts';
import { toast } from './toast';
import { copyText } from './clipboard';
import { parseJson, formatJsonValue, compactJsonValue, repairJson } from './json';

interface EditorRef {
  get: () => Content;
  set: (content: Content) => void;
  updateProps: (props: JSONEditorPropsOptional) => void;
  refresh: () => Promise<void>;
}

// Initial document shown in the right panel (matches the product mockups).
const SAMPLE_JSON = JSON.stringify(
  {
    perLeadResults: [
      {
        operation: 'CREATE',
        reason: 'Required fields are missing: [Company] (Code: REQUIRED_FIELD_MISSING)',
        leadId: '0fe91c15-5483-4c92-9887-bf0d92bd47dd',
        provider: 'SALESFORCE',
        status: 'FAILURE',
      },
      {
        operation: 'CREATE',
        reason: 'Required fields are missing: [Company] (Code: REQUIRED_FIELD_MISSING)',
        leadId: '5e0b4e97-ba70-4143-86ec-4efeea8a8fe4',
        provider: 'SALESFORCE',
        status: 'FAILURE',
      },
      {
        operation: 'CREATE',
        reason: 'Required fields are missing: [Company] (Code: REQUIRED_FIELD_MISSING)',
        leadId: '8ee36102-b7e5-43d1-9f4f-6e53c8fc0f3e',
        provider: 'SALESFORCE',
        status: 'FAILURE',
      },
    ],
  },
  null,
  2
);

export function initWorkspace(): void {
  // ---------------------------------------------------------------- editors

  const hosts = document.querySelectorAll<HTMLElement>('[data-editor-host]');
  const editors = new Map<PanelSide, EditorRef>();
  const panelModes = new Map<PanelSide, Mode>([
    ['left', Mode.text],
    ['right', Mode.text],
  ]);

  function isTextMode(side: PanelSide): boolean {
    return (panelModes.get(side) ?? Mode.text) === Mode.text;
  }

  function contentText(content: Content): string {
    if ('text' in content && typeof content.text === 'string') return content.text;
    if ('json' in content && content.json !== undefined) {
      try {
        return formatJsonValue(content.json);
      } catch {
        return '';
      }
    }
    return '';
  }

  function getText(side: PanelSide): string {
    const editor = editors.get(side);
    return editor ? contentText(editor.get()) : '';
  }

  hosts.forEach((host) => {
    const side = host.dataset.editorHost;
    if (side !== 'left' && side !== 'right') return;

    const content: Content = side === 'right' ? { text: SAMPLE_JSON } : { text: '' };
    const editor = createJSONEditor({
      target: host,
      props: {
        content,
        mode: Mode.text,
        mainMenuBar: true,
        navigationBar: false,
        statusBar: false,
        onChange: () => scheduleSizeUpdate(side),
        onSelect: (selection: JSONEditorSelection | undefined) => updateCaret(side, selection),
        onChangeMode: (mode: Mode) => {
          panelModes.set(side, mode);
          syncModeTabs(side, mode);
        },
      } satisfies JSONEditorPropsOptional,
    }) as unknown as EditorRef;

    editors.set(side, editor);
    updateSize(side);
  });

  // ------------------------------------------------------------ status bar

  function statusEl(side: PanelSide, role: 'status-pos' | 'status-size'): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[data-panel="${side}"] [data-${role}]`);
  }

  function formatBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    const kb = n / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  const sizeTimers = new Map<PanelSide, number>();

  function scheduleSizeUpdate(side: PanelSide): void {
    const previous = sizeTimers.get(side);
    if (previous !== undefined) clearTimeout(previous);
    sizeTimers.set(
      side,
      window.setTimeout(() => {
        sizeTimers.delete(side);
        updateSize(side);
      }, 150)
    );
  }

  function updateSize(side: PanelSide): void {
    const el = statusEl(side, 'status-size');
    if (!el) return;
    const text = getText(side);
    el.textContent = text ? formatBytes(new Blob([text]).size) : '';
  }

  function updateCaret(side: PanelSide, selection: JSONEditorSelection | undefined): void {
    const el = statusEl(side, 'status-pos');
    if (!el) return;
    const textSelection = selection as Partial<TextSelection> | undefined;
    if (!textSelection?.ranges || textSelection.ranges.length === 0) return;
    const range = textSelection.ranges[textSelection.main ?? 0] ?? textSelection.ranges[0];
    const content = editors.get(side)?.get();
    const text = content && 'text' in content && typeof content.text === 'string' ? content.text : '';
    if (text.length > 2_000_000) return; // skip caret math on huge documents
    const upTo = text.slice(0, range.head);
    const line = (upTo.match(/\n/g)?.length ?? 0) + 1;
    const column = range.head - (upTo.lastIndexOf('\n') + 1) + 1;
    el.textContent = `Line: ${line}  Column: ${column}`;
  }

  // --------------------------------------------------------------- actions

  function parseOrNotify(raw: string): unknown | undefined {
    try {
      return parseJson(raw);
    } catch (error) {
      toast(`Invalid JSON: ${error instanceof Error ? error.message : 'parse error'}`);
      return undefined;
    }
  }

  async function copyToClipboard(text: string): Promise<void> {
    toast((await copyText(text)) ? 'Copied to clipboard' : 'Could not access the clipboard');
  }

  function copySmartFormatted(raw: string): void {
    let parsed: unknown;
    try {
      parsed = repairJson(raw);
    } catch {
      toast('Could not repair JSON');
      return;
    }
    void copyToClipboard(`${formatJsonValue(parsed)}\n`);
  }

  function copyVariant(side: PanelSide, action: string): void {
    const raw = getText(side);
    if (!raw.trim()) {
      toast('Nothing to copy');
      return;
    }
    if (action === 'copy-as-is') {
      void copyToClipboard(raw);
      return;
    }
    if (action === 'copy-escaped') {
      void copyToClipboard(JSON.stringify(raw));
      return;
    }
    if (action === 'copy-smart-formatted') {
      copySmartFormatted(raw);
      return;
    }
    const parsed = parseOrNotify(raw);
    if (parsed === undefined) return;
    if (action === 'copy-compacted') {
      void copyToClipboard(compactJsonValue(parsed));
      return;
    }
    const formatted = formatJsonValue(parsed);
    void copyToClipboard(action === 'copy-formatted' ? `${formatted}\n` : formatted);
  }

  function saveToDisk(side: PanelSide): void {
    const text = getText(side);
    const name =
      document.querySelector<HTMLInputElement>(`[data-panel="${side}"] .doc-name`)?.value.trim() ||
      'document';
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${name}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast(`Saved ${name}.json`);
  }

  function newDocument(side: PanelSide): void {
    if (getText(side).trim() && !window.confirm('Replace the current document?')) return;
    editors.get(side)?.set({ text: '' });
    updateSize(side);
  }

  function toggleFullscreen(side: PanelSide): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    const panel = document.querySelector(`[data-panel="${side}"]`);
    if (panel && typeof panel.requestFullscreen === 'function') void panel.requestFullscreen();
  }

  // Open-from-disk file input (created once, reused).
  let openTarget: PanelSide = 'left';
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json,.jsonc,.txt,application/json';
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    void file.text().then((text) => {
      editors.get(openTarget)?.set({ text });
      const nameInput = document.querySelector<HTMLInputElement>(
        `[data-panel="${openTarget}"] .doc-name`
      );
      if (nameInput) nameInput.value = file.name.replace(/\.(json|jsonc|txt)$/i, '');
      updateSize(openTarget);
      fileInput.value = '';
    });
  });

  function copyBetween(from: PanelSide, to: PanelSide): void {
    const text = getText(from);
    if (!text.trim()) {
      toast('Nothing to copy');
      return;
    }
    editors.get(to)?.set({ text });
    toast(`Copied to the ${to} panel`);
  }

  // -------------------------------------------------------------- mode tabs

  function syncModeTabs(side: PanelSide, mode: Mode): void {
    document.querySelectorAll(`[data-panel="${side}"] .mode-tab`).forEach((tab) => {
      const tabEl = tab as HTMLElement;
      const active = tabEl.dataset.mode === mode;
      tabEl.classList.toggle('is-active', active);
      tabEl.setAttribute('aria-selected', String(active));
    });
  }

  function setMode(side: PanelSide, mode: string): void {
    const editor = editors.get(side);
    if (!editor) return;
    if (mode !== 'text' && mode !== 'tree' && mode !== 'table') return;
    // panelModes + tab sync happen via onChangeMode.
    editor.updateProps({ mode: mode as Mode });
  }

  // -------------------------------------------------------------- shortcuts

  function panelOf(target: EventTarget | null): PanelSide | undefined {
    if (!(target instanceof Element)) return undefined;
    const side = target.closest('[data-panel]')?.getAttribute('data-panel');
    return side === 'left' || side === 'right' ? side : undefined;
  }

  function formatPanel(side: PanelSide): void {
    const editor = editors.get(side);
    if (!editor) return;
    const content = editor.get();
    let parsed: unknown;
    if ('json' in content && content.json !== undefined) {
      parsed = content.json;
    } else if ('text' in content && typeof content.text === 'string') {
      if (!content.text.trim()) {
        toast('Nothing to format');
        return;
      }
      const result = parseOrNotify(content.text);
      if (result === undefined) return;
      parsed = result;
    } else {
      toast('Nothing to format');
      return;
    }
    if (isTextMode(side)) editor.set({ text: formatJsonValue(parsed) });
    else editor.set({ json: parsed });
    updateSize(side);
    toast('Formatted');
  }

  function searchPanel(side: PanelSide): void {
    // Tree/table modes render their own Search button in the editor menu bar;
    // text mode already opened CodeMirror's search panel natively.
    const host = document.querySelector<HTMLElement>(`[data-editor-host="${side}"]`);
    host?.querySelector<HTMLButtonElement>('.jse-search')?.click();
  }

  registerShortcuts({ panelOf, isTextMode, formatPanel, searchPanel });

  // ------------------------------------------------------------- theme sync

  function syncEditorTheme(): void {
    const dark = isDarkAppearance();
    hosts.forEach((host) => host.classList.toggle('jse-theme-dark', dark));
    editors.forEach((editor) => {
      void editor.refresh();
    });
  }

  document.addEventListener(APPEARANCE_EVENT, syncEditorTheme);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!document.documentElement.dataset.theme) syncEditorTheme();
  });
  syncEditorTheme();

  // -------------------------------------------------------------- splitter

  const workspace = document.getElementById('workspace');
  const splitter = document.querySelector<HTMLElement>('[data-role="splitter"]');

  function clampSplitter(value: number): number {
    return Math.min(85, Math.max(15, value));
  }

  function loadSplitter(): number {
    try {
      const stored = Number.parseFloat(localStorage.getItem(SPLITTER_KEY) ?? '');
      if (Number.isFinite(stored)) return clampSplitter(stored);
    } catch {
      /* storage unavailable */
    }
    return 50;
  }

  let leftPct = loadSplitter();

  function applySplit(): void {
    if (!workspace) return;
    workspace.style.gridTemplateColumns = `${leftPct}fr var(--middle-width) ${100 - leftPct}fr`;
    splitter?.setAttribute('aria-valuenow', String(Math.round(leftPct)));
  }

  function persistSplit(): void {
    try {
      localStorage.setItem(SPLITTER_KEY, String(leftPct));
    } catch {
      /* storage unavailable */
    }
  }

  if (splitter && workspace) {
    let dragging = false;
    splitter.addEventListener('pointerdown', (event) => {
      if (window.innerWidth < 1024) return;
      dragging = true;
      splitter.setPointerCapture(event.pointerId);
    });
    splitter.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const rect = workspace.getBoundingClientRect();
      leftPct = clampSplitter(((event.clientX - rect.left) / rect.width) * 100);
      applySplit();
    });
    splitter.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      persistSplit();
    });
    splitter.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 10 : 2;
      let next: number | undefined;
      if (event.key === 'ArrowLeft') next = leftPct - step;
      else if (event.key === 'ArrowRight') next = leftPct + step;
      else if (event.key === 'Home') next = 15;
      else if (event.key === 'End') next = 85;
      else return;
      event.preventDefault();
      leftPct = clampSplitter(next);
      applySplit();
      persistSplit();
    });
    applySplit();
  }

  // ------------------------------------------------------- event delegation

  // Arrow keys move between a panel's mode tabs (automatic activation).
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const target = event.target as Element | null;
    const tab = target?.closest<HTMLElement>('.mode-tab');
    const panel = tab?.dataset.panel;
    if (!tab || (panel !== 'left' && panel !== 'right')) return;
    event.preventDefault();
    const tabs = [
      ...document.querySelectorAll<HTMLElement>(`[data-panel="${panel}"] .mode-tab`),
    ];
    const next =
      tabs[(tabs.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    next?.focus();
    if (next?.dataset.mode) setMode(panel, next.dataset.mode);
  });

  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (!target) return;

    const tab = target.closest<HTMLElement>('.mode-tab');
    if (tab?.dataset.panel && tab.dataset.mode) {
      setMode(tab.dataset.panel as PanelSide, tab.dataset.mode);
      return;
    }

    const trigger = target.closest<HTMLElement>('[data-action]');
    if (!trigger) return;

    const action = trigger.dataset.action;
    if (!action) return;
    const side = (trigger.dataset.panel ??
      trigger.closest('[data-panel]')?.getAttribute('data-panel')) as PanelSide | undefined;
    if (!side) return;

    switch (action) {
      case 'new':
        newDocument(side);
        break;
      case 'open-file':
        openTarget = side;
        fileInput.click();
        break;
      case 'save-disk':
        saveToDisk(side);
        break;
      case 'copy-formatted':
      case 'copy-smart-formatted':
      case 'copy-compacted':
      case 'copy-escaped':
      case 'copy-as-is':
        copyVariant(side, action);
        break;
      case 'fullscreen':
        toggleFullscreen(side);
        break;
      case 'copy-to-left':
        copyBetween('right', 'left');
        break;
      case 'copy-to-right':
        copyBetween('left', 'right');
        break;
    }
  });
}
