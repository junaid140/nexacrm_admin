import { useEffect, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
function Modal({ title, children, onClose, wide = false, drawer = false, busy = false }) {
  const ref = useRef(null);
  const titleId = useId();
  const busyRef = useRef(busy);
  busyRef.current = busy;
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = ref.current;
    const get = () =>
      [
        ...dialog.querySelectorAll(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ),
      ].filter(
        (node) =>
          node.getClientRects().length > 0 &&
          node.tabIndex !== -1 &&
          node.getAttribute("aria-hidden") !== "true",
      );
    if (!dialog.contains(document.activeElement))
      (get()[0] || dialog).focus({
        preventScroll: true,
      });
    const key = (e) => {
      const dialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      if (dialogs[dialogs.length - 1] !== dialog) return;
      if (e.key === "Escape") {
        e.preventDefault();
        if (!busyRef.current) closeRef.current();
      }
      if (e.key === "Tab") {
        const nodes = get();
        if (!nodes.length) return;
        if (!dialog.contains(document.activeElement)) {
          e.preventDefault();
          (e.shiftKey ? nodes.at(-1) : nodes[0]).focus();
        } else if (e.shiftKey && document.activeElement === nodes[0]) {
          e.preventDefault();
          nodes.at(-1).focus();
        } else if (!e.shiftKey && document.activeElement === nodes.at(-1)) {
          e.preventDefault();
          nodes[0].focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      if (previous?.isConnected)
        previous.focus({
          preventScroll: true,
        });
    };
  }, []);
  return createPortal(
    <div
      className={`overlay ${drawer ? "drawer-overlay" : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy || undefined}
        tabIndex={-1}
        className={`modal ${wide ? "wide" : ""} ${drawer ? "drawer" : ""}`}
      >
        <div className="modal-head">
          <div>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button
            className="icon-btn inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white p-0 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
export default Modal;
