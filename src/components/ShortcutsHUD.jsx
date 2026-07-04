const shortcuts = [
  {
    keys: ["?"],
    desc: (
      <span>
        Toggle this shortcuts HUD (
        <kbd className="px-1.5 py-0.5 mx-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-mono font-semibold text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shadow-xs">
          Esc
        </kbd>{" "}
        to close)
      </span>
    ),
  },
  { keys: ["Alt", "H"], desc: "Go to Home" },
  { keys: ["Alt", "D"], desc: "Go to Dashboard" },
  { keys: ["Alt", "T"], desc: "Go to Task Workspace" },
  { keys: ["Alt", "V"], desc: "Go to Snippet Workspace" },
  { keys: ["Alt", "B"], desc: "Go to Resource Hub" },
  { keys: ["Alt", "U"], desc: "Go to Dev Utilities" },
  { keys: ["Alt", "L"], desc: "Toggle Theme (Light / Dark)" },
];

export default function ShortcutsHUD({ visible, onClose }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 w-full max-w-lg animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer active:scale-95 flex items-center justify-center"
          aria-label="Close shortcuts panel"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-lg font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-100">
            Keyboard Shortcuts
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs font-mono">?</kbd> anytime to toggle this panel.
          </p>
        </div>
        <div className="p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400 text-xs uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-800">
                <th className="pb-2 font-medium">Shortcut</th>
                <th className="pb-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map(({ keys, desc }) => (
                <tr
                  key={keys.join("+")}
                  className="border-b border-neutral-50 dark:border-neutral-800/50 last:border-0"
                >
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1.5">
                      {keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-mono font-semibold text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </td>
                  <td className="py-3 text-neutral-600 dark:text-neutral-400">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
