import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const DeleteHistory = () => {
  const { dark } = useTheme();
  const navigate = useNavigate();

  const [deletedSnippets, setDeletedSnippets] = useState(() => {
    const stored = localStorage.getItem("deleted_snippets");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  const handleRestore = (snippet) => {
    const deleted = JSON.parse(localStorage.getItem("deleted_snippets") || "[]");
    const active = JSON.parse(localStorage.getItem("dev_snippets") || "[]");

    const { deletedAt, ...snippetToRestore } = snippet;

    const updatedDeleted = deleted.filter((s) => s.id !== snippet.id);
    const updatedActive = [...active, snippetToRestore];

    localStorage.setItem("deleted_snippets", JSON.stringify(updatedDeleted));
    localStorage.setItem("dev_snippets", JSON.stringify(updatedActive));
    setDeletedSnippets(updatedDeleted);

    toast("Snippet restored to vault", {
      description: "Moved back to active snippets",
      action: {
        label: "View Snippets",
        onClick: () => navigate("/snippetvault/list"),
      },
      cancel: {
        label: "Undo",
        onClick: () => {
          const current = JSON.parse(localStorage.getItem("dev_snippets") || "[]");
          const currentDeleted = JSON.parse(localStorage.getItem("deleted_snippets") || "[]");
          localStorage.setItem(
            "dev_snippets",
            JSON.stringify(current.filter((s) => s.id !== snippet.id))
          );
          localStorage.setItem(
            "deleted_snippets",
            JSON.stringify([...currentDeleted, snippet])
          );
          setDeletedSnippets((prev) => [...prev, snippet]);
        },
      },
    });
  };

  const handlePurge = (id) => {
    toast("Permanently delete this snippet?", {
      description: "This action cannot be undone.",
      action: {
        label: "Yes, Purge",
        onClick: () => {
          const updated = deletedSnippets.filter((s) => s.id !== id);
          localStorage.setItem("deleted_snippets", JSON.stringify(updated));
          setDeletedSnippets(updated);
          toast.success("Snippet permanently purged.", {
            style: { background: "#000000", color: "#ffffff" },
          });
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast("Purge cancelled.", {
            style: { background: "#000000", color: "#ffffff" },
          });
        },
      },
    });
  };

  const handleClearHistory = () => {
    toast("Clear all deleted snippet history?", {
      description: "This action cannot be undone.",
      action: {
        label: "Yes, Clear All",
        onClick: () => {
          localStorage.removeItem("deleted_snippets");
          setDeletedSnippets([]);
          toast.success("All history cleared.", {
            style: { background: "#000000", color: "#ffffff" },
          });
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast("Cancelled.", {
            style: { background: "#000000", color: "#ffffff" },
          });
        },
      },
    });
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] w-full font-sans overflow-y-auto overflow-x-hidden md:overflow-hidden flex flex-col p-4 md:p-8 transition-colors duration-300 ${
        dark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <title>System Logs & Purge History — DevTasks</title>
      <meta
        name="description"
        content="View deleted snippets history, restore snippets, or permanently clear logs."
      />

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto flex flex-col h-full">
        <header className="shrink-0 mb-12 flex flex-col gap-4">
          <Link
            to="/snippetvault"
            className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all duration-300 w-fit ${
              dark
                ? "text-neutral-400 hover:text-white"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <span>← Back to Workspace</span>
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
                Snippet Logs
              </h1>
              <p className="text-gray-400 font-medium">
                Restore deleted snippets or purge records permanently
              </p>
            </div>
          </div>
        </header>

        <div className="grow flex items-center justify-center">
          <div className="max-w-xl w-full space-y-12 animate-in fade-in zoom-in duration-1000">
            <div className="max-h-72 overflow-y-auto space-y-3 w-full pr-2">
              {deletedSnippets.length === 0 ? (
                <div
                  className={`text-center font-medium py-10 border border-dashed rounded-2xl ${
                    dark
                      ? "text-gray-500 border-gray-700"
                      : "text-gray-400 border-gray-200"
                  }`}
                >
                  No deleted snippets found
                </div>
              ) : (
                deletedSnippets.map((sn) => (
                  <div
                    key={sn.id}
                    className={`group border rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 cursor-default ${
                      dark
                        ? "border-white/10 bg-zinc-900 hover:bg-white hover:text-black"
                        : "border-black/10 bg-white hover:bg-black hover:text-white"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-black uppercase tracking-wide text-sm truncate">
                        {sn.title}
                      </span>
                      <span
                        className={`text-xs font-mono truncate mt-1 ${
                          dark ? "text-zinc-400" : "text-neutral-500"
                        } group-hover:text-gray-300 transition-colors`}
                      >
                        {sn.code || sn.cmd}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-400 transition-colors duration-300 mt-1">
                        {sn.category}
                      </span>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                      <div>
                        <div className="text-xs font-medium text-gray-500 group-hover:text-gray-200 transition-colors duration-300">
                          {sn.deletedAt
                            ? new Date(sn.deletedAt).toLocaleDateString()
                            : ""}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-400 transition-colors duration-300 mt-0.5">
                          {sn.deletedAt
                            ? new Date(sn.deletedAt).toLocaleTimeString()
                            : ""}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestore(sn)}
                          className="border border-black/20 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handlePurge(sn.id)}
                          className="border border-red-400/40 text-red-500 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                        >
                          Purge
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 text-red-600 rounded-3xl mb-4">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight">
                Danger Zone
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Clearing history will permanently remove all deleted snippet
                records. Individual snippets can be restored or purged above.
              </p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={handleClearHistory}
                className={`group relative w-full py-6 border-2 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center overflow-hidden ${
                  dark
                    ? "bg-black border-white text-white"
                    : "bg-white border-black text-black"
                } hover:text-white`}
              >
                <span className="relative z-10">Clear All History</span>
                <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-6 border-t border-neutral-100 dark:border-zinc-800 pt-6">
                <Link
                  to="/snippetvault/list"
                  className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                    dark
                      ? "text-neutral-400 hover:text-white"
                      : "text-neutral-500 hover:text-black"
                  }`}
                >
                  Snippet List
                </Link>
                <Link
                  to="/snippetvault/data-center"
                  className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                    dark
                      ? "text-neutral-400 hover:text-white"
                      : "text-neutral-500 hover:text-black"
                  }`}
                >
                  <span>Data Center</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteHistory;
