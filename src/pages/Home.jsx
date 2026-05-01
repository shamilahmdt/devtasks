import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="h-screen w-full bg-white text-black font-sans selection:bg-black selection:text-white overflow-hidden flex flex-col">
      <main className="grow flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl w-full mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Content */}
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-1000">
              <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] text-black uppercase">
                Dev <br />
                <span className="text-gray-400">Tasks</span>
              </h1>
              <p className="text-lg text-gray-500 max-w-md font-medium leading-relaxed">
                The high-performance task manager for engineering teams who value speed, precision, and minimalist design.
              </p>
              <div>
                <Link to="/dashboard">
                  <button className="px-8 py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all transform hover:-translate-y-1 shadow-2xl shadow-black/20">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Content - Visual Element */}
            <div className="relative group animate-in fade-in zoom-in duration-1000 hidden lg:block">
              <div className="absolute -inset-1 bg-linear-to-r from-gray-200 to-gray-100 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-gray-50 border border-gray-200 rounded-2xl p-10 shadow-sm">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="h-2 w-24 bg-gray-200 rounded-full"></div>
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 w-full bg-white rounded-lg border border-gray-100 shadow-sm flex items-center px-4">
                      <div className="w-4 h-4 rounded border-2 border-gray-200 mr-4"></div>
                      <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                    </div>
                    <div className="h-12 w-full bg-white rounded-lg border border-gray-100 shadow-sm flex items-center px-4">
                      <div className="w-4 h-4 rounded bg-black mr-4 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                    </div>
                    <div className="h-12 w-full bg-white rounded-lg border border-gray-100 shadow-sm flex items-center px-4 opacity-50">
                      <div className="w-4 h-4 rounded border-2 border-gray-100 mr-4"></div>
                      <div className="h-2 w-1/3 bg-gray-50 rounded"></div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Background Text */}
      <div className="fixed bottom-0 right-0 p-12 -z-10 opacity-[0.02] pointer-events-none select-none">
        <h2 className="text-[20vw] font-black leading-none tracking-tighter">TASK</h2>
      </div>
    </div>
  );
};

export default Home;
