/** Transient bottom-center feedback message (see `.toast` in global.css). */

let toastTimer: number | undefined;

export function toast(message: string): void {
  let el = document.querySelector<HTMLElement>('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  if (toastTimer !== undefined) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el?.classList.remove('show'), 2000);
}
