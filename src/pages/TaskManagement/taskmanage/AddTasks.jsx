import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";
import { useCategory } from "../../../context/CategoryContext";

const AddTasks = () => {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const { categories, addCategory, deleteCategory } = useCategory();

  const [task, setTask] = useState("");
  const [category, setCategory] = useState("FEATURE");
  const [priority, setPriority] = useState("MEDIUM");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!task.trim()) {
      toast.error("Task cannot be empty.", {
        style: {
          background: "#000000",
          color: "#ffffff",
        },
      });
      return;
    }

    const newTask = {
      id: Date.now(),
      text: task,
      category,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks([...tasks, newTask]);

    toast.success("Task successfully added to roadmap.", {
      style: {
        background: "#000000",
        color: "#ffffff",
      },
      action: {
        label: "View List",
        onClick: () => navigate("/taskmanage/list-tasks"),
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

    setTask("");
  };

  const handleAddCategory = () => {
    if (!newCategoryInput.trim()) return;

    addCategory(newCategoryInput);

    setCategory(newCategoryInput.trim().toUpperCase());
    setNewCategoryInput("");
    setShowInput(false);

    toast.success("Category added.", {
      style: {
        background: "#000000",
        color: "#ffffff",
      },
    });
  };

  const handleDeleteCategory = (cat) => {
    const success = deleteCategory(cat, tasks);

    if (!success) {
      toast.error("Cannot delete — category is in use by a task.", {
        style: {
          background: "#000000",
          color: "#ffffff",
        },
      });
    } else {
      if (category === cat) setCategory(categories[0]);

      toast.success("Category removed.", {
        style: {
          background: "#000000",
          color: "#ffffff",
        },
      });
    }
  };

  return (
    <div
      className={`min-h-screen w-full px-4 sm:px-6 py-8 flex flex-col md:items-center md:justify-center transition-colors duration-300 relative ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>Add Tasks — DevTasks</title>

      {/* BACKGROUND */}
      <div
        className={`absolute top-[-120px] right-[-120px] w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] rounded-full blur-3xl opacity-40 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />

      <div
        className={`absolute bottom-[-120px] left-[-120px] w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] rounded-full blur-3xl opacity-40 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      {/* CARD */}
      <div
        className={`relative z-10 w-full max-w-4xl mx-auto rounded-[32px] border shadow-2xl overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        {/* TOP BAR */}
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        {/* HEADER */}
        <div className="flex flex-col gap-4 px-5 sm:px-8 pt-6 sm:pt-8">
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
          <div>
            <h1
              className={`text-2xl sm:text-4xl font-black uppercase tracking-tight ${
                dark ? "text-white" : "text-black"
              }`}
            >
              Add Task
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 mt-2">
              Create and organize your roadmap tasks
            </p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-5 sm:px-8 py-8 space-y-8">
          {/* TASK INPUT */}
          <div>
            <label
              htmlFor="task-input"
              className="block mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400"
            >
              Task Description
            </label>

            <input
              id="task-input"
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. Optimize database queries"
              autoFocus
              className={`w-full rounded-3xl px-5 sm:px-6 py-4 text-base sm:text-lg font-semibold outline-none border-2 transition-all duration-300 ${
                dark
                  ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-white"
                  : "bg-neutral-50 border-neutral-200 text-black placeholder:text-neutral-400 focus:border-black"
              }`}
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400">
              Category
            </label>

            <div className="flex flex-wrap gap-3">
              {categories.map((opt) => (
                <div key={opt} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCategory(opt)}
                    className={`px-4 py-2 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest border transition-all duration-300 ${
                      category === opt
                        ? dark
                          ? "bg-white text-black border-white"
                          : "bg-black text-white border-black"
                        : dark
                          ? "bg-zinc-800 border-zinc-700 text-neutral-300 hover:border-white hover:text-white"
                          : "bg-neutral-100 border-neutral-200 text-neutral-600 hover:border-black hover:text-black"
                    }`}
                  >
                    {opt}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(opt)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* ADD CATEGORY */}
              {showInput ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder="NEW..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    className={`w-28 rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-widest outline-none border-2 ${
                      dark
                        ? "bg-zinc-800 border-zinc-600 text-white focus:border-white"
                        : "bg-white border-neutral-300 text-black focus:border-black"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                      dark ? "bg-white text-black" : "bg-black text-white"
                    }`}
                  >
                    Add
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInput(false)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-neutral-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowInput(true)}
                  className={`px-4 py-2 rounded-full border-2 border-dashed text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                    dark
                      ? "border-zinc-600 text-zinc-400 hover:border-white hover:text-white"
                      : "border-neutral-300 text-neutral-500 hover:border-black hover:text-black"
                  }`}
                >
                  + Add
                </button>
              )}
            </div>
          </div>

          {/* PRIORITY */}
          <div>
            <label className="block mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400">
              Priority
            </label>

            <div className="flex flex-wrap gap-3">
              {[
                {
                  value: "HIGH",
                  active: "bg-red-500 border-red-500 text-white",
                  inactive:
                    "bg-red-500/10 border-red-200 text-red-500 hover:bg-red-500/20",
                },
                {
                  value: "MEDIUM",
                  active: "bg-yellow-500 border-yellow-500 text-white",
                  inactive:
                    "bg-yellow-500/10 border-yellow-200 text-yellow-600 hover:bg-yellow-500/20",
                },
                {
                  value: "LOW",
                  active: "bg-blue-500 border-blue-500 text-white",
                  inactive:
                    "bg-blue-500/10 border-blue-200 text-blue-500 hover:bg-blue-500/20",
                },
              ].map(({ value, active, inactive }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className={`px-4 py-2 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest border transition-all duration-300 ${
                    priority === value ? active : inactive
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            id="submit-task-button"
            className={`w-full rounded-3xl py-4 sm:py-5 font-black text-base sm:text-lg uppercase tracking-widest transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 ${
              dark
                ? "bg-white text-black hover:bg-neutral-200"
                : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            <span>Create Task</span>

            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </form>

        {/* FOOTER */}
        <div className="px-5 sm:px-8 pb-8 flex justify-end items-center">
          <Link
            to="/taskmanage/list-tasks"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
              dark
                ? "text-neutral-400 hover:text-white"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <span>Task List</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddTasks;
