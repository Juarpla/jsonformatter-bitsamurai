/**
 * App-level keyboard shortcuts (advertised in the Help menu).
 *
 * - Ctrl/⌘+Shift+F — format the panel under focus, in place.
 * - Ctrl/⌘+F — open the panel's own search UI (tree/table modes). In text
 *   mode CodeMirror already opens its native search panel, so we stay out.
 *
 * Undo/Redo need no handling: they are native to the focused editor.
 * Shortcuts only fire while focus is inside an editor panel, so the
 * browser's own Find etc. keep working everywhere else.
 */

export type PanelSide = 'left' | 'right';

export interface ShortcutHandlers {
  /** Panel (`[data-panel]`) containing the event target, if any. */
  panelOf: (target: EventTarget | null) => PanelSide | undefined;
  isTextMode: (side: PanelSide) => boolean;
  formatPanel: (side: PanelSide) => void;
  searchPanel: (side: PanelSide) => void;
}

export function isMacPlatform(): boolean {
  return typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);
}

export function registerShortcuts(handlers: ShortcutHandlers): () => void {
  function onKeydown(event: KeyboardEvent): void {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    if (event.key.toLowerCase() !== 'f') return;

    const side = handlers.panelOf(event.target);
    if (!side) return;

    if (event.shiftKey) {
      event.preventDefault();
      handlers.formatPanel(side);
      return;
    }

    // Plain Ctrl/⌘+F in text mode: let CodeMirror open its search panel.
    if (handlers.isTextMode(side)) return;
    event.preventDefault();
    handlers.searchPanel(side);
  }

  document.addEventListener('keydown', onKeydown);
  return () => document.removeEventListener('keydown', onKeydown);
}
