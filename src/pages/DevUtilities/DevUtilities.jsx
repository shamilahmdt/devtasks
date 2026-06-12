import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const DevUtilities = () => {
  const { dark } = useTheme();

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      card: "bg-white border-zinc-200/85 hover:border-zinc-400 hover:shadow-md hover:-translate-y-1",
      icon: "bg-black text-white border border-black/10",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      card: "bg-zinc-900/50 border-zinc-800/85 hover:border-zinc-600 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1",
      icon: "bg-white text-black border border-white/10",
    },
  };
  const t = dark ? theme.dark : theme.light;

  const cards = [
    {
      title: "Regex Tester",
      description: "Test regular expressions with flags, highlights, matching text, and capturing groups.",
      path: "/devutilities/regex",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "JSON Formatter",
      description: "Validate JSON string formats, structure code outputs, beautify spacing, or minify data.",
      path: "/devutilities/json",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      title: "Base64 / URL",
      description: "Encode and decode binary string fragments, escape special URL query variables, and test strings.",
      path: "/devutilities/base64",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      title: "Timestamp",
      description: "Convert epoch/unix values to human-readable datetime formats and parse date strings.",
      path: "/devutilities/timestamp",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "UUID Generator",
      description: "Generate RFC4122-compliant v4 UUIDs offline with formatting options.",
      path: "/devutilities/uuid",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`${t.wrapper} min-h-screen md:h-screen w-full font-sans overflow-y-auto md:overflow-hidden overflow-x-hidden flex flex-col p-4 md:p-8 transition-colors duration-300`}
    >
      <title>Dev Utilities — Custom Tools Sandbox</title>
      <meta
        name="description"
        content="Quickly formatting, converting, validating, and checking regular expression statements."
      />

      <div className="w-[85%] max-w-none mx-auto flex flex-col h-full">
        <header className="shrink-0 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
              Dev Utilities
            </h1>
            <p className="text-gray-400 font-medium mb-6">
              Essential developer tools and offline code converters
            </p>

            <div className="w-full max-w-sm">
              <div className="text-xs font-black uppercase tracking-widest mb-2">
                Utility Status: 5 Active Utilities
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase truncate">
                REGEXP • JSON • BASE64/URL • TIMESTAMP • UUID
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-xs font-bold uppercase tracking-widest hover:underline pb-1"
            >
              Back to Dashboard
            </Link>
          </div>
        </header>

        <div className="grow flex items-center justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full">
            {cards.map((card) => (
              <Link
                key={card.title}
                to={card.path}
                id={`devutilities-card-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
                className={`group relative p-8 border rounded-3xl transition-all duration-300 flex flex-col justify-between h-[320px] ${t.card}`}
              >
                <div>
                  <div
                    className={`mb-8 p-3 w-fit rounded-xl transition-colors shadow-sm ${t.icon}`}
                  >
                    {card.icon}
                  </div>
                  <h2 className="text-xl font-black mb-3 uppercase tracking-tight">
                    {card.title}
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 group-hover:text-zinc-400 transition-colors leading-relaxed">
                    {card.description}
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Tool{" "}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="shrink-0 mt-8 pt-8 border-t border-gray-50 opacity-10 hidden md:block">
          <h2 className="text-[12vw] font-black tracking-tighter leading-none select-none text-center">
            TOOLS
          </h2>
        </div>
      </div>
    </div>
  );
};

export default DevUtilities;
