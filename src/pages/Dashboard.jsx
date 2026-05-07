import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const cards = [
    {
      title: "Add Tasks",
      description: "Create new development tasks and assignments.",
      path: "/add-tasks",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      title: "Task List",
      description: "View and manage your current project roadmap.",
      path: "/list-tasks",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    },
    {
      title: "Delete History",
      description: "Clear completed tasks and system logs.",
      path: "/delete-history",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    }
  ];

  return (
    <div className={`h-screen w-full font-sans overflow-hidden flex flex-col p-8 bg-[var(--color-bg-primary)] text-[var(--color-text-base)] transition-colors duration-300 ${isDarkMode ? "theme-black" : ""}`}>
      <div className="max-w-6xl w-full mx-auto flex flex-col h-full relative">
        <button
          type="button"
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="absolute top-0 right-0 text-2xl leading-none text-[var(--color-text-base)] transition-opacity duration-300 hover:opacity-70"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        <header className="shrink-0 mb-12 flex justify-between items-end pt-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Dashboard</h1>
            <p className="font-medium text-[var(--color-text-base)]">Manage your engineering workflow</p>
          </div>
          <Link to="/" className="text-xs font-bold uppercase tracking-widest hover:underline pb-1 text-[var(--color-text-base)]">Exit to Site</Link>
        </header>

        <div className="grow flex items-center justify-center">
          <div className="grid md:grid-cols-3 gap-8 w-full">
            {cards.map((card) => (
              <Link 
                key={card.title} 
                to={card.path}
                className="group relative p-8 bg-[var(--color-bg-primary)] border border-[var(--color-text-base)] rounded-3xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between h-[320px] hover:bg-[var(--color-text-base)] hover:text-[var(--color-bg-primary)]"
              >
                <div>
                  <div className="mb-8 p-3 w-fit rounded-xl transition-colors duration-300 bg-[var(--color-text-base)] text-[var(--color-bg-primary)] group-hover:bg-[var(--color-bg-primary)] group-hover:text-[var(--color-text-base)]">
                    {card.icon}
                  </div>
                  <h2 className="text-xl font-black mb-3 uppercase tracking-tight">{card.title}</h2>
                  <p className="text-sm font-medium transition-colors duration-300 leading-relaxed text-[var(--color-text-base)] group-hover:text-[var(--color-bg-primary)]">
                    {card.description}
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Decorative element */}
        <div className="shrink-0 mt-8 pt-8 border-t border-[var(--color-text-base)] opacity-10">
          <h2 className="text-[12vw] font-black tracking-tighter leading-none select-none text-center">FLOW</h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
