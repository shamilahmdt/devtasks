import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

const FILTERS = ["ALL", "ACTIVE", "COMPLETED"];

const ListTasks = () => {
  const { dark } = useTheme();
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [filter, setFilter] = useState("ALL");
  const[searchQuery,setSearchQuery]=useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const filteredTasks = tasks.filter((task) => {
    const matchFilter=
    filter==="ACTIVE"
    ? !task.completed
    : filter==="COMPLETED"
    ? task.completed
    : true;
   const matchSearch=task.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = (id) => {
    const trimmed = editingText.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, text: trimmed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setEditingId(null);
    toast.success("Task updated.", {
      style: { background: "#000000", color: "#ffffff" },
    });
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") saveEdit(id);
    if (e.key === "Escape") setEditingId(null);
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
    });
  };

  const toggleComplete = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task,
    );
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    const task = tasks.find((task) => task.id === id);
    if (task.completed) {
      toast.info("Task re-opened.", {
        style: { background: "#000000", color: "#ffffff" },
      });
    } else {
      toast.info("Task marked as complete.", {
        style: { background: "#000000", color: "#ffffff" },
      });
    }
  };

  return (
    <div className={`min-h-screen p-6 font-sans antialiased transition-colors duration-300 ${dark ? "bg-zinc-950" : "bg-[#FDFDFD]"}`}>
      <div className={`max-w-2xl mx-auto rounded-4xl shadow-lg p-8 border transition-colors duration-300 ${dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-black uppercase ${dark ? "text-white" : "text-black"}`}>
            Task List
          </h1>
          <ThemeToggle />
        </div>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
           className={`w-full mb-4 px-4 py-3 rounded-2xl border-2 outline-none font-black uppercase tracking-widest text-sm transition-all duration-200
    ${dark
      ? "bg-zinc-800 text-white border-zinc-700 focus:border-white placeholder-zinc-500"
      : "bg-neutral-50 text-black border-neutral-200 focus:border-black placeholder-neutral-400"
    }`}
/>

        {/* Filter Navigation */}
        <div className="flex justify-center mb-6">
          <div className={`flex gap-2 p-1 border rounded-full ${dark ? "border-zinc-700 bg-zinc-800" : "border-neutral-200 bg-neutral-50"}`}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  filter === f
                    ? dark ? "bg-white text-black" : "bg-black text-white"
                    : dark
                    ? "bg-transparent text-neutral-400 hover:text-white border border-transparent hover:border-zinc-600"
                    : "bg-transparent text-neutral-400 hover:text-black border border-transparent hover:border-neutral-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

    {filteredTasks.length === 0 ? (
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
          <ul className="space-y-4">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                className={`flex items-center justify-between rounded-2xl p-4 shadow-sm transition-colors duration-200 ${dark ? "bg-zinc-800" : "bg-neutral-50"}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    className={`w-5 h-5 cursor-pointer shrink-0 ${dark ? "accent-white" : "accent-black"}`}
                  />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {editingId === task.id ? (
                      <input
                        type="text"
                        value={editingText}
                        autoFocus
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => saveEdit(task.id)}
                        onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                        className={`flex-1 min-w-0 bg-transparent border-b-2 outline-none font-bold text-lg uppercase tracking-wide pb-0.5 transition-all duration-200 ${dark ? "border-white text-white" : "border-black text-black"}`}
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-semibold text-lg ${
                            task.completed
                              ? "line-through text-neutral-400"
                              : dark ? "text-white" : "text-black"
                          }`}
                        >
                          {task.text}
                        </span>
                        <span className={`text-[11px] font-black uppercase px-2 py-1 rounded-full ${dark ? "bg-zinc-700 text-neutral-300" : "bg-neutral-100 text-neutral-700"}`}>
                          {task.category ?? "TASK"}
                        </span>

                        {task.priority && (
                          <span
                            className={`text-[11px] font-black uppercase px-2 py-1 rounded-full shrink-0 ${
                              task.priority === "HIGH"
                                ? "bg-red-500/10 text-red-500"
                                : task.priority === "MEDIUM"
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

                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {!task.completed && editingId !== task.id && (
                    <button
                      onClick={() => startEditing(task)}
                      className={`px-4 py-2 rounded-xl border font-bold text-sm transition-all duration-300 ${dark ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white"}`}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 font-bold text-sm ${dark ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-neutral-800"}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link
          to="/dashboard"
          className={`mt-12 font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center space-x-2 ${dark ? "text-neutral-400 hover:text-white" : "text-neutral-400 hover:text-black"}`}
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default ListTasks;
