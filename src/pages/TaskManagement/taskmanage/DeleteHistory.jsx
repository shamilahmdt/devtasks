import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const DeleteHistory = () => {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [deletedTasks, setDeletedTasks] = useState(() => {
    const stored = localStorage.getItem("deleted_tasks");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        console.error("Invalid deleted_tasks data");
        return [];
      }
    }
    return [];
  });

  const handleWipeOut = () => {
    toast("Are you sure you want to delete all history?", {
      description: "This action cannot be undone.",
      action: {
        label: "Yes, Delete",
        onClick: () => {
          localStorage.removeItem("deleted_tasks");
          setDeletedTasks([]);
          toast.success("All data wiped successfully.", {
            style: { background: "#000000", color: "#ffffff" },
          });
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast("Deletion cancelled", {
            style: { background: "#000000", color: "#ffffff" },
          });
        },
      },
    });
  };

  const restoreTask = (id) => {
    const deleted = JSON.parse(localStorage.getItem("deleted_tasks")) || [];
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const taskToRestore = deleted.find((task) => task.id === id);
    if (!taskToRestore) return;

    const updatedDeletedTasks = deleted.filter((task) => task.id !== id);
    const updatedTasks = [...tasks, taskToRestore];

    localStorage.setItem("deleted_tasks", JSON.stringify(updatedDeletedTasks));
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setDeletedTasks(updatedDeletedTasks);

    // Toast with navigation + undo
    toast("Task restored", {
      description: "Moved back to roadmap",
      action: {
        label: "View Tasks",
        onClick: () => navigate("/taskmanage/list-tasks"),
      },
      cancel: {
        label: "Undo",
        onClick: () => {
          const currentTasks = JSON.parse(localStorage.getItem("tasks")) || [];
          const currentDeleted = JSON.parse(localStorage.getItem("deleted_tasks")) || [];

          const revertedTasks = currentTasks.filter((t) => t.id !== id);
          const revertedDeleted = currentDeleted.some((t) => t.id === id)
            ? currentDeleted
            : [...currentDeleted, taskToRestore];

          localStorage.setItem("deleted_tasks", JSON.stringify(revertedDeleted));
          localStorage.setItem("tasks", JSON.stringify(revertedTasks));
          setDeletedTasks(revertedDeleted);
        },
      },
    });
  };

  const handleExport = () => {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const deletedTasks = JSON.parse(
      localStorage.getItem("deleted_tasks") || "[]",
      localStorage.getItem("deleted_tasks") || "[]"
    );
    let exportData = [...tasks, ...deletedTasks];
    exportData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "devtasks-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          const tasks = data.filter(
            (item) => item.text && item.id && !item.deletedAt
          );
          const deleted = data.filter(
            (item) => item.text && item.id && item.deletedAt
          );
          const existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];
          const existingDeleted =
            JSON.parse(localStorage.getItem("deleted_tasks")) || [];

          // Register custom categories
          const savedCategories = localStorage.getItem("available_categories");
          const currentCategories = savedCategories ? JSON.parse(savedCategories) : ["FEATURE", "BUG", "REFACTOR"];
          const importedCategories = [...new Set(data.filter(item => item.category).map(item => item.category.trim().toUpperCase()))];
          const updatedCategories = [...new Set([...currentCategories, ...importedCategories])];
          localStorage.setItem("available_categories", JSON.stringify(updatedCategories));

          localStorage.setItem(
            "tasks",
            JSON.stringify([...existingTasks, ...tasks])
          );
          localStorage.setItem(
            "deleted_tasks",
            JSON.stringify([...existingDeleted, ...deleted])
          );
          setDeletedTasks([...existingDeleted, ...deleted]);
          toast.success("Data imported successfully", {
            style: { background: "#000000", color: "#ffffff" },
          });
        } else {
          toast.error("Invalid file structure", {
            style: { background: "#000000", color: "#ffffff" },
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Invalid file format", {
          style: { background: "#000000", color: "#ffffff" },
        });
      }
    };
    input.click();
  };

  return (
    <div
      className={`min-h-screen md:h-screen w-full font-sans overflow-y-auto md:overflow-hidden flex flex-col p-4 md:p-8 transition-colors duration-300 ${
        dark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* React 19 Document Metadata Hoisting */}
      <title>System Logs & Purge History — DevTasks</title>
      <meta
        name="description"
        content="View deleted history items, restore removed items back to active roadmap lists, or clear cached task system logs."
      />
      <meta
        name="keywords"
        content="devtasks, delete-history, clear system cache, restore tasks, bug purge"
      />

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto flex flex-col h-full">
        {/* Header */}
        <header className="shrink-0 mb-12 flex flex-col gap-4">
          <Link
            to="/taskmanage"
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
                System Logs
              </h1>
              <p className="text-gray-400 font-medium">
                Clear history and reset environment
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grow flex items-center justify-center">
          <div className="max-w-xl w-full space-y-12 animate-in fade-in zoom-in duration-1000">
            {/* HISTORY LIST */}
            <div className="max-h-72 overflow-y-auto space-y-3 w-full pr-2">
              {deletedTasks.length === 0 ? (
                <div
                  className={`text-center font-medium py-10 border border-dashed rounded-2xl ${
                    dark ? "text-gray-500 border-gray-700" : "text-gray-400 border-gray-200"
                  }`}
                >
                  No deleted tasks found
                </div>
              ) : (
                deletedTasks.map((task) => (
                  <div
                    key={task.id}
                    /* CORRECTION 3 : flex-col sur mobile pour que le texte et les boutons s'empilent proprement */
                    className={`group border rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 cursor-default ${
                      dark
                        ? "border-white/10 bg-zinc-900 hover:bg-white hover:text-black"
                        : "border-black/10 bg-white hover:bg-black hover:text-white"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-black uppercase tracking-wide text-sm">
                        {task.text}
                      </span>
                      <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300 mt-1 tracking-wider uppercase">
                        Deleted Task
                      </span>
                    </div>

                    {/* Ajustement du conteneur d'action pour s'aligner sur mobile */}
                    <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-3">
                      <div>
                        <div className="text-xs font-medium text-gray-500 group-hover:text-gray-200 transition-colors duration-300">
                          {task.deletedAt
                            ? new Date(task.deletedAt).toLocaleDateString()
                            : ""}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-300 group-hover:text-gray-400 transition-colors duration-300 mt-1">
                          {task.deletedAt
                            ? new Date(task.deletedAt).toLocaleTimeString()
                            : ""}
                        </div>
                      </div>

                      <button
                        onClick={() => restoreTask(task.id)}
                        className="border border-black/20 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
                      >
                        Restore
                      </button>
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
                Beware!!!
              </h2>

              <p className="text-gray-500 font-medium leading-relaxed">
                Clearing history will permanently remove all completed tasks,
                system logs, and cached activity. This action cannot be undone.
              </p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={handleWipeOut}
                id="clear-history-button"
                className={`group relative w-full py-6 border-2 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center overflow-hidden ${
                  dark
                    ? "bg-black border-white text-white"
                    : "bg-white border-black text-black"
                } hover:text-white`}
              >
                <span className="relative z-10">Clear History</span>
                <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-6 border-t border-neutral-100 dark:border-zinc-800 pt-6">
                <Link
                  to="/taskmanage/list-tasks"
                  className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                    dark
                      ? "text-neutral-400 hover:text-white"
                      : "text-neutral-500 hover:text-black"
                  }`}
                >
                  <span>Task List</span>
                </Link>

                <Link
                  to="/taskmanage/data-center"
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
