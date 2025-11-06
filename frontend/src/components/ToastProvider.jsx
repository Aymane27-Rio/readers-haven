import React from "react";

const ToastCtx = React.createContext({ notify: () => {} });

export function useToast() {
  return React.useContext(ToastCtx);
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const notify = React.useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);
  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'grid', gap: 8, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} className="vintage-card" style={{ padding: '.6rem .8rem', minWidth: 220, borderLeft: `4px solid ${t.type === 'error' ? '#b91c1c' : '#166534'}` }}>
            <span className="form-meta" style={{ color: t.type === 'error' ? '#b91c1c' : 'inherit' }}>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
