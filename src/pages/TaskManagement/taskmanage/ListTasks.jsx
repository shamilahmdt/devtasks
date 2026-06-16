import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useCategory } from "../../../context/CategoryContext";
const FILTERS = ["ALL", "ACTIVE", "COMPLETED"];

const ListTasks = () => {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const { categories } = useCategory();
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [sortType, setSortType] = useState("date"); // tracks which sort is active
  const [sortOrder, setSortOrder] = useState("desc"); // tracks asc/desc direction

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const dropdownRef = useRef(null);
  const editInputRef = useRef(null);

  const filteredTasks = tasks.filter((task) => {
    const matchFilter =
      filter === "ACTIVE"
        ? !task.completed
        : filter === "COMPLETED"
        ? task.completed
        : true;
    const matchSearch = task.text
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const applySorting = (tasksToSort) => {
    const sorted = [...tasksToSort];

    if (sortType === "priority") {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      sorted.sort((a, b) => {
        const aP = priorityOrder[a.priority] ?? 999;
        const bP = priorityOrder[b.priority] ?? 999;
        return sortOrder === "asc" ? aP - bP : bP - aP;
      });
    } else if (sortType === "alphabetical") {
      sorted.sort((a, b) => {
        const cmp = (a.text || "")
          .toLowerCase()
          .localeCompare((b.text || "").toLowerCase());
        return sortOrder === "asc" ? cmp : -cmp;
      });
    } else {
      // 'date' (default)
      sorted.sort((a, b) => {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      });
    }

    return sorted;
  };

  const sortedAndFilteredTasks = applySorting(filteredTasks);

  const totalTasks = tasks.length;
  const activeTasks = tasks.filter((task) => !task.completed).length;
  const completedTasks = tasks.filter((task) => task.completed).length;

  const taskCounts = {
    ALL: totalTasks,
    ACTIVE: activeTasks,
    COMPLETED: completedTasks,
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = (id) => {
    const trimmed = editingText.trim();
    if (!trimmed) {
      cancelEditing();
      return;
    }

    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, text: trimmed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    cancelEditing();

    toast.success("Task updated.", {
      style: { background: "#000000", color: "#ffffff" },
    });
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") saveEdit(id);
    if (e.key === "Escape") cancelEditing();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        activeDropdownId &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setActiveDropdownId(null);
      }

      if (
        editingId &&
        editInputRef.current &&
        !editInputRef.current.contains(e.target)
      ) {
        saveEdit(editingId);
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        setActiveDropdownId(null);
        cancelEditing();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [activeDropdownId, editingId, editingText, tasks]);

  const restoreDeletedTask = (taskToRestore) => {
    let deletedTasks = localStorage.getItem("deleted_tasks");
    if (deletedTasks) {
      deletedTasks = JSON.parse(deletedTasks).filter(
        (t) => t.id !== taskToRestore.id
      );
      localStorage.setItem("deleted_tasks", JSON.stringify(deletedTasks));
    }

    setTasks((prevTasks) => {
      if (prevTasks.some((t) => t.id === taskToRestore.id)) return prevTasks;
      const updatedTasks = [...prevTasks, taskToRestore];
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      return updatedTasks;
    });

    toast.success("Action undone.", {
      style: { background: "#000000", color: "#ffffff" },
    });
  };

  const deleteTask = (id) => {
    let deletedTasks = localStorage.getItem("deleted_tasks");
    if (deletedTasks == null) deletedTasks = [];
    else deletedTasks = JSON.parse(deletedTasks);

    const deletedTask = tasks.filter((task) => task.id === id)[0];
    const taskWithTimestamp = {
      ...deletedTask,
      deletedAt: new Date().toISOString(),
    };

    deletedTasks.push(taskWithTimestamp);
    localStorage.setItem("deleted_tasks", JSON.stringify(deletedTasks));

    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    toast.warning("Task permanently removed.", {
      style: { background: "#000000", color: "#ffffff" },
      action: {
        label: "Undo",
        onClick: () => restoreDeletedTask(deletedTask),
      },
      duration: 4000,
    });
    setTimeout(() => {
      toast.info("Task deleted. Click 'View Logs' to see deletion history.", {
        id: `history-${id}`,
        style: { background: "#000000", color: "#ffffff" },
        action: {
          label: "View Logs",
          onClick: () => navigate("/taskmanage/delete-history"),
        },
        actionButtonStyle: {
          border: "1px solid #ffffff",
          borderRadius: "8px",
          backgroundColor: "transparent",
          color: "#ffffff",
          padding: "6px 16px",
          cursor: "pointer",
        },
        duration: 5000,
      });
    }, 4100);
  };

  const clearCompletedTasks = () => {
    const completedTasks = tasks.filter((task) => task.completed);
    if (completedTasks.length === 0) return;

    const savedDeletedTasks = localStorage.getItem("deleted_tasks");
    const deletedTasks = savedDeletedTasks ? JSON.parse(savedDeletedTasks) : [];
    const deletedAt = new Date().toISOString();
    const completedWithTimestamps = completedTasks.map((task) => ({
      ...task,
      deletedAt,
    }));
    const updatedTasks = tasks.filter((task) => !task.completed);

    localStorage.setItem(
      "deleted_tasks",
      JSON.stringify([...deletedTasks, ...completedWithTimestamps])
    );
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);

    toast.success(`${completedTasks.length} completed ${completedTasks.length === 1 ? 'task' : 'tasks'} moved`, {
      description: "Sent to delete history",
      style: { background: "#000000", color: "#ffffff" },
      action: {
        label: "View Logs",
        onClick: () => navigate("/taskmanage/delete-history"),
      },
      actionButtonStyle: {
        backgroundColor: "transparent",
        borderColor: "#ffffff",
        border: "1px solid #ffffff",
        color: "#ffffff",
        borderRadius: "8px",
        padding: "6px 16px",
        cursor: "pointer",
      },
    });
  };

  const toggleComplete = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    const task = tasks.find((task) => task.id === id);
    if (task.completed) {
      toast.info("Task re-opened.", {
        style: { background: "#000000", color: "#ffffff" },
      });
    } else {
      toast.success("Task completed ✅", {
        style: { background: "#000000", color: "#ffffff" },
        action: {
          label: "View Completed",
          onClick: () => setFilter("COMPLETED"),
        },
        actionButtonStyle: {
          backgroundColor: "transparent",
          borderColor: "#ffffff",
          border: "1px solid #ffffff",
          color: "#ffffff",
          borderRadius: "8px",
          padding: "6px 16px",
          cursor: "pointer",
        },
      });
    }
  };

  const updateCategory = (taskId, newCategory) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, category: newCategory } : t
    );
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setActiveDropdownId(null);

    toast.success("Category updated successfully.", {
      style: { background: "#000000", color: "#ffffff" },
    });
  };

  return (
    <div
      className={`min-h-screen overflow-y-auto p-4 sm:p-6 font-sans antialiased transition-colors duration-300 ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>Task List & Roadmaps — DevTasks</title>
      <meta
        name="description"
        content="View, search, filter, edit, and update active developer tasks and roadmaps. Manage bug tracking lists, refactor plans, and features."
      />
      <meta
        name="keywords"
        content="devtasks, dev tasks, list-tasks, add lists, engineering roadmaps, todo lists"
      />

      <div
        className={`w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto rounded-3xl sm:rounded-4xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${
          dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1
              className={`text-2xl sm:text-3xl font-black uppercase ${
                dark ? "text-white" : "text-black"
              }`}
            >
              Task List
            </h1>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          id="search-tasks-input"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full mb-4 px-4 py-3 rounded-2xl border-2 outline-none font-black uppercase tracking-widest text-sm transition-all duration-200 ${
            dark
              ? "bg-zinc-800 text-white border-zinc-700 focus:border-white placeholder-zinc-500"
              : "bg-neutral-50 text-black border-neutral-200 focus:border-black placeholder-neutral-400"
          }`}
        />

        {/* Sorting Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSortType("date")}
              className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                sortType === "date"
                  ? dark
                    ? "bg-white text-black border-white"
                    : "bg-black text-white border-black"
                  : dark
                    ? "border-zinc-600 text-neutral-300 hover:border-white hover:text-white"
                    : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
                  ? "border-zinc-600 text-neutral-300 hover:border-white hover:text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
              }`}
            >
              Date
            </button>

            <button
              onClick={() => setSortType("priority")}
              className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                sortType === "priority"
                  ? dark
                    ? "bg-white text-black border-white"
                    : "bg-black text-white border-black"
                  : dark
                    ? "border-zinc-600 text-neutral-300 hover:border-white hover:text-white"
                    : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
                  ? "border-zinc-600 text-neutral-300 hover:border-white hover:text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
              }`}
            >
              Priority
            </button>

            <button
              onClick={() => setSortType("alphabetical")}
              className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                sortType === "alphabetical"
                  ? dark
                    ? "bg-white text-black border-white"
                    : "bg-black text-white border-black"
                  : dark
                    ? "border-zinc-600 text-neutral-300 hover:border-white hover:text-white"
                    : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
                  ? "border-zinc-600 text-neutral-300 hover:border-white hover:text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
              }`}
            >
              A–Z
            </button>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className={`w-full sm:w-auto px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              dark
                ? "border-zinc-600 text-neutral-300 hover:border-white hover:text-white"
                : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
            }`}
          >
            {sortOrder === "asc" ? "↑ ASC" : "↓ DESC"}
          </button>
        </div>

        {/* Filter Navigation */}
        <div className="flex justify-center mb-6">
          <div
            className={`flex flex-wrap justify-center gap-2 p-1 border rounded-3xl ${
              dark
                ? "border-zinc-700 bg-zinc-800"
                : "border-neutral-200 bg-neutral-50"
            }`}
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  filter === f
                    ? dark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : dark
                      ? "bg-transparent text-neutral-400 hover:text-white border border-transparent hover:border-zinc-600"
                      : "bg-transparent text-neutral-400 hover:text-black border border-transparent hover:border-neutral-300"
                    ? "bg-transparent text-neutral-400 hover:text-white border border-transparent hover:border-zinc-600"
                    : "bg-transparent text-neutral-400 hover:text-black border border-transparent hover:border-neutral-300"
                }`}
              >
                {f} ({taskCounts[f]})
              </button>
            ))}
          </div>
        </div>

        {/* Clear Completed */}
        {taskCounts.COMPLETED > 0 && (
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={clearCompletedTasks}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                dark
                  ? "border-zinc-600 text-neutral-300 hover:border-white hover:text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
              }`}
            >
              Clear Completed
            </button>
          </div>
        )}

        {/* Empty State */}
        {sortedAndFilteredTasks.length === 0 ? (
          <p className="text-center text-neutral-400 font-medium py-8">
            {searchQuery
              ? "No tasks match your search."
              : filter === "ACTIVE"
              ? "No active tasks. You're all caught up!"
              : filter === "COMPLETED"
              ? "No completed tasks yet."
              : "No tasks added yet."}
          </p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredTasks.map((task) => (
              <li
                key={task.id}
                className={`flex flex-col justify-between gap-6 rounded-2xl p-5 shadow-sm border transition-all duration-300 ${
                  dark
                    ? "bg-zinc-800/40 border-zinc-700/50 hover:border-zinc-600 hover:shadow-md"
                    : "bg-neutral-50 border-neutral-200/60 hover:border-neutral-300 hover:shadow-md"
                }`}
              >
                {/* Left Content */}
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    className={`w-5 h-5 mt-1 sm:mt-0 cursor-pointer shrink-0 ${
                      dark ? "accent-white" : "accent-black"
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    {editingId === task.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingText}
                        autoFocus
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => saveEdit(task.id)}
                        onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                        className={`w-full bg-transparent border-b-2 outline-none font-bold text-base sm:text-lg uppercase tracking-wide pb-0.5 transition-all duration-200 ${
                          dark
                            ? "border-white text-white"
                            : "border-black text-black"
                        }`}
                      />
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          onDoubleClick={() => startEditing(task)}
                          className={`break-words font-semibold text-base sm:text-lg cursor-text transition-opacity duration-200 hover:opacity-80 ${
                            task.completed
                              ? "line-through text-neutral-400"
                              : dark
                                ? "text-white"
                                : "text-black"
                              ? "text-white"
                              : "text-black"
                          }`}
                        >
                          {task.text}
                        </span>

                        {/* Category */}
                        <div
                          className="relative"
                          ref={
                            activeDropdownId === task.id ? dropdownRef : null
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setActiveDropdownId(
                                activeDropdownId === task.id ? null : task.id,
                                activeDropdownId === task.id ? null : task.id
                              )
                            }
                            className={`text-[11px] font-black uppercase px-2 py-1 rounded-full cursor-pointer transition-all duration-200 ${
                              dark
                                ? "bg-zinc-700 text-neutral-300 hover:bg-zinc-600"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            }`}
                          >
                            {task.category ?? "TASK"}
                          </button>

                          {activeDropdownId === task.id && (
                            <div
                              className={`absolute top-7 left-0 z-10 rounded-xl shadow-lg border p-2 flex flex-col gap-1 min-w-[120px] transition-all duration-200 ${
                                dark
                                  ? "bg-zinc-800 border-zinc-700"
                                  : "bg-white border-neutral-200"
                              }`}
                            >
                              {categories.map((cat) => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => updateCategory(task.id, cat)}
                                  className={`text-[11px] font-black uppercase px-2 py-1 rounded-lg text-left transition-all duration-200 ${
                                    task.category === cat
                                      ? dark
                                        ? "bg-white text-black"
                                        : "bg-black text-white"
                                      : dark
                                        ? "text-neutral-300 hover:bg-zinc-700"
                                        : "text-neutral-700 hover:bg-neutral-100"
                                      ? "text-neutral-300 hover:bg-zinc-700"
                                      : "text-neutral-700 hover:bg-neutral-100"
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Priority */}
                        {task.priority && (
                          <span
                            className={`text-[11px] font-black uppercase px-2 py-1 rounded-full shrink-0 ${
                              task.priority === "HIGH"
                                ? "bg-red-500/10 text-red-500"
                                : task.priority === "MEDIUM"
                                  ? "bg-yellow-500/10 text-yellow-600"
                                  : "bg-blue-500/10 text-blue-500"
                                ? "bg-yellow-500/10 text-yellow-600"
                                : "bg-blue-500/10 text-blue-500"
                            }`}
                          >
                            {task.priority}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {!task.completed && editingId !== task.id && (
                    <button
                      onClick={() => startEditing(task)}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl border font-bold text-sm transition-all duration-300 ${
                        dark
                          ? "border-white text-white hover:bg-white hover:text-black"
                          : "border-black text-black hover:bg-black hover:text-white"
                      }`}
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => deleteTask(task.id)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl transition-all duration-300 font-bold text-sm ${
                      dark
                        ? "bg-white text-black hover:bg-gray-100"
                        : "bg-black text-white hover:bg-neutral-800"
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end items-center mt-12 border-t border-neutral-100 dark:border-zinc-800 pt-6">
          <div className="flex gap-4">
            <Link
              to="/taskmanage/delete-history"
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                dark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              <span>Deleted Tasks</span>
            </Link>
            <span className={dark ? "text-zinc-700" : "text-neutral-300"}>|</span>
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
  );
};

export default ListTasks;
