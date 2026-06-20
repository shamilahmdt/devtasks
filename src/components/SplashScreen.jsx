import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const SplashScreen = () => {
  const { dark } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [splashFade, setSplashFade] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setSplashFade(true);
    }, 1500);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!showSplash) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
        dark ? "bg-[#090A0F]" : "bg-[#F8F9FA]"
      } ${splashFade ? "opacity-0 pointer-events-none scale-105" : "opacity-100 scale-100"}`}
    >
      <div className="relative flex flex-col items-center gap-6">
        <img
          src="/devtasks-logo.png"
          alt="DevTasks Logo"
          className="w-24 h-24 sm:w-32 sm:h-32 object-contain animate-logo-zoom"
        />
        <div className="flex flex-col items-center">
          <h1
            className={`text-2xl sm:text-3xl font-black uppercase tracking-[0.3em] font-sans transition-colors duration-300 ${
              dark ? "text-white" : "text-black"
                }`}
              >
                DevTasks
              </h1>
              <p
                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.5em] mt-1 transition-colors duration-300 ${
                  dark ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                Engineering Cockpit
              </p>
            </div>
          </div>
        </div>
      );
    };

export default SplashScreen;
