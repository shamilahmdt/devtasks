import { useState } from 'react';
import { Link } from 'react-router-dom';

const DeleteHistory = () => {
  const [deletedTasks, setDeletedTasks] = useState(() => {
    const stored = localStorage.getItem('deleted_tasks');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        console.error('Invalid deleted_tasks data');
        return [];
      }
    }
    return [];
  });

  // Wipe out handler
  const handleWipeOut = () => {
    localStorage.removeItem('deleted_tasks');
    setDeletedTasks([]);
  };

  return (
    <div className="h-screen w-full bg-white text-black font-sans overflow-hidden flex flex-col p-8">
      <div className="max-w-6xl w-full mx-auto flex flex-col h-full">

        {/* Header */}
        <header className="shrink-0 mb-12 flex justify-between items-end">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
              System Logs
            </h1>
            <p className="text-gray-400 font-medium">
              Clear history and reset environment
            </p>
          </div>

          <Link
            to="/dashboard"
            className="text-xs font-bold uppercase tracking-widest hover:underline pb-1 flex items-center"
          >
            <span className="mr-2">←</span> Back to Dashboard
          </Link>
        </header>

        {/* Main Content */}
        <div className="grow flex items-center justify-center">
          <div className="max-w-xl w-full space-y-12 animate-in fade-in zoom-in duration-1000">

            {/* HISTORY LIST */}
            <div className="max-h-72 overflow-y-auto space-y-3 w-full pr-2">

              {deletedTasks.length === 0 ? (
                <div className="text-center text-gray-400 font-medium py-10 border border-dashed border-gray-200 rounded-2xl">
                  No deleted tasks found
                </div>
              ) : (
                deletedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group border border-black/10 rounded-2xl px-5 py-4 flex items-center justify-between bg-white hover:bg-black hover:text-white transition-all duration-300 cursor-default"
                  >
                    {/* Left Side */}
                    <div className="flex flex-col">
                      <span className="font-black uppercase tracking-wide text-sm">
                        {task.text}
                      </span>

                      <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300 mt-1 tracking-wider uppercase">
                        Deleted Task
                      </span>
                    </div>

                    {/* Right Side */}
                    <div className="text-right">
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
                  </div>
                ))
              )}

            </div>

            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 text-red-600 rounded-3xl mb-4">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <h2 className="text-3xl font-black uppercase tracking-tight">
                Danger Zone
              </h2>

              <p className="text-gray-500 font-medium leading-relaxed">
                Clearing history will permanently remove all completed tasks, system logs, and cached activity. This action cannot be undone.
              </p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={handleWipeOut}
                className="group relative w-full py-6 bg-white border-2 border-black rounded-2xl font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center overflow-hidden"
              >
                <span className="relative z-10">Wipe All Data</span>
                <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>

              <Link
                to="/dashboard"
                className="w-full py-4 text-center text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
              >
                Cancel Operation
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="shrink-0 mt-8 pt-8 border-t border-gray-50 opacity-10">
          <h2 className="text-[12vw] font-black tracking-tighter leading-none select-none text-center">
            PURGE
          </h2>
        </div>
      </div>
    </div>
  );
};

export default DeleteHistory;