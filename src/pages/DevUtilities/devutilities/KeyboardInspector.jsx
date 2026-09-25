import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

export default function KeyboardInspector() {
  const { dark } = useTheme();
  const [keyInfo, setKeyInfo] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      setKeyInfo({
        key: event.key,
        code: event.code,
        keyCode: event.keyCode,
        location: event.location,
        repeat: event.repeat,
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans ${
        dark ? "bg-zinc-950 text-white" : "bg-[#FDFDFD] text-black"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border ${
              dark
                ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-black"
            }`}
            title="Back to Workspace"
          >
            ←
          </Link>

          <div>
            <h1 className="text-2xl font-bold">
              Keyboard Keycode & Event Inspector
            </h1>

            <p
              className={`text-xs mt-1 ${
                dark ? "text-zinc-500" : "text-neutral-500"
              }`}
            >
              Press any keyboard key to inspect its event information.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div
          className={`rounded-3xl border p-6 ${
            dark
              ? "bg-zinc-900/50 border-zinc-800"
              : "bg-white border-zinc-200"
          }`}
        >
          {!keyInfo ? (
            <div className="py-20 text-center">
              <div className="text-5xl mb-5">⌨️</div>

              <h2 className="text-xl font-bold mb-2">
                Press any key
              </h2>

              <p
                className={
                  dark ? "text-zinc-500" : "text-neutral-500"
                }
              >
                Your keyboard event details will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Main Values */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  className={`rounded-2xl border p-5 ${
                    dark
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Key
                  </p>

                  <p className="text-2xl font-bold mt-3 break-all">
                    {keyInfo.key}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${
                    dark
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Code
                  </p>

                  <p className="text-2xl font-bold mt-3 break-all">
                    {keyInfo.code}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${
                    dark
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    KeyCode
                  </p>

                  <p className="text-2xl font-bold mt-3">
                    {keyInfo.keyCode}
                  </p>
                </div>
              </div>

              {/* Extra Event Information */}
              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">
                  Event Details
                </p>

                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-3`}
                >
                  <div
                    className={`p-4 rounded-2xl border ${
                      dark
                        ? "border-zinc-800 bg-zinc-950"
                        : "border-zinc-200 bg-zinc-50"
                    }`}
                  >
                    <span className="text-xs text-zinc-500">
                      Location
                    </span>

                    <p className="font-semibold mt-1">
                      {keyInfo.location}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border ${
                      dark
                        ? "border-zinc-800 bg-zinc-950"
                        : "border-zinc-200 bg-zinc-50"
                    }`}
                  >
                    <span className="text-xs text-zinc-500">
                      Repeat
                    </span>

                    <p className="font-semibold mt-1">
                      {keyInfo.repeat ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}