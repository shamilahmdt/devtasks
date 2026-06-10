import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

const sampleDeletedResources = [
  {
    id: "del-1",
    title: "React Documentation",
    category: "Frontend",
    url: "https://react.dev",
    deletedAt: "2025-06-08T10:30:00Z",
  },
  {
    id: "del-2",
    title: "Tailwind CSS Guide",
    category: "CSS",
    url: "https://tailwindcss.com",
    deletedAt: "2025-06-07T15:45:00Z",
  },
  {
    id: "del-3",
    title: "MDN Web Docs",
    category: "Web",
    url: "https://developer.mozilla.org",
    deletedAt: "2025-06-05T09:20:00Z",
  },
];

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const DeleteHistory = () => {
  const { dark } = useTheme();

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85",
      divider: "divide-zinc-100",
      tag: "bg-zinc-100 text-zinc-600 border border-zinc-200",
      url: "text-zinc-400",
      restoreBtn:
        "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 transition-colors",
      deleteBtn:
        "border border-zinc-200 text-zinc-400 hover:bg-zinc-50 transition-colors",
      statValue: "text-zinc-900",
      statLabel: "text-zinc-500",
      backLink: "text-zinc-500 hover:text-zinc-900 transition-colors",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85",
      divider: "divide-zinc-800",
      tag: "bg-zinc-800 text-zinc-400 border border-zinc-700",
      url: "text-zinc-600",
      restoreBtn:
        "border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors",
      deleteBtn:
        "border border-zinc-700 text-zinc-600 hover:bg-zinc-800/50 transition-colors",
      statValue: "text-zinc-100",
      statLabel: "text-zinc-500",
      backLink: "text-zinc-500 hover:text-zinc-100 transition-colors",
    },
  };

  const t = dark ? theme.dark : theme.light;

  const stats = [
    { label: "Total Deleted", value: sampleDeletedResources.length },
    { label: "This Week", value: 2 },
    { label: "Categories", value: 3 },
  ];

  return (
    <div className={`min-h-screen ${t.wrapper} px-6 py-10`}>
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          to="/resourcehub"
          className={`inline-flex items-center gap-1.5 text-sm mb-8 ${t.backLink}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Workspace
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <h1 className={`text-2xl font-semibold tracking-tight ${t.heading}`}>
            Delete History
          </h1>
          <p className={`mt-1 text-sm ${t.subtext}`}>
            A log of all removed resources and bookmarks.
          </p>
        </div>

        <div className="space-y-5">
          {/* Summary card */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <p
              className={`text-xs uppercase tracking-widest font-medium mb-5 ${t.subtext}`}
            >
              Deletion Summary
            </p>
            <div className="grid grid-cols-3 gap-6">
              {stats.map(({ label, value }) => (
                <div key={label}>
                  <p className={`text-3xl font-semibold ${t.statValue}`}>
                    {value}
                  </p>
                  <p className={`text-xs mt-1 ${t.statLabel}`}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* History list */}
          <div className={`rounded-3xl border ${t.card} overflow-hidden`}>
            {/* List header */}
            <div
              className={`px-6 py-4 border-b ${t.card.split(" ")[1]} flex items-center justify-between`}
            >
              <p
                className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}
              >
                Deleted Resources
              </p>
              <span className={`text-xs ${t.subtext}`}>
                {sampleDeletedResources.length} entries
              </span>
            </div>

            {/* Entries */}
            <div className={`divide-y ${t.divider}`}>
              {sampleDeletedResources.map((resource) => (
                <div key={resource.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Resource info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${t.tag}`}
                        >
                          {resource.category}
                        </span>
                        <span className={`text-xs ${t.subtext}`}>
                          {formatDate(resource.deletedAt)}
                        </span>
                      </div>
                      <p
                        className={`text-sm font-medium truncate ${t.heading}`}
                      >
                        {resource.title}
                      </p>
                      <p className={`text-xs truncate mt-0.5 ${t.url}`}>
                        {resource.url}
                      </p>
                    </div>

                    {/* Visual-only action buttons */}
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      <button
                        className={`text-xs px-3 py-1.5 rounded-xl ${t.restoreBtn}`}
                        disabled
                        aria-label="Restore resource (not yet implemented)"
                      >
                        Restore
                      </button>
                      <button
                        className={`text-xs px-3 py-1.5 rounded-xl ${t.deleteBtn}`}
                        disabled
                        aria-label="Permanently delete resource (not yet implemented)"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteHistory;
