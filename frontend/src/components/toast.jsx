import { useEffect, useState } from "react";
import { Check, CircleAlert, X } from "lucide-react";
import { ToastContext } from "./toast-context";

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function notify(message, type = "success") {
    setToast({ message, type, key: Date.now() });
  }

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {toast && (
        <div
          className={`toast toast-${toast.type}`}
          role="status"
          key={toast.key}
        >
          {toast.type === "error" ? (
            <CircleAlert size={18} />
          ) : (
            <Check size={18} />
          )}
          <span>{toast.message}</span>
          <button
            className="icon-button toast-close"
            onClick={() => setToast(null)}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}
