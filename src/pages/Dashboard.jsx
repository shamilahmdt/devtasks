import React from 'react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-4">
          DevTasks
        </h1>

        {/* Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add a task..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button className="bg-black text-white px-4 rounded-lg hover:bg-gray-800 transition-colors">
            Add
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-2">

          {/* Active Task */}
          <div className="flex justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
            <span>Learn React basics</span>
            <button className="text-red-500 hover:text-red-600 transition-colors">✕</button>
          </div>

          {/* Completed Task */}
          <div className="flex justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 opacity-60">
            <span className="line-through text-gray-400">
              Build UI design
            </span>
            <button className="text-red-500 hover:text-red-600 transition-colors">✕</button>
          </div>

        </div>

      </div>
    </div>
  );
}
