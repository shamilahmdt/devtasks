import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isWithinDays = (deletedAt, days) => {
  const today = new Date();
  const cutoffDate = today.setDate(today.getDate() - days);
  return new Date(deletedAt).getTime() >= cutoffDate;
};

const getUniqueCategories = (resources) => {
  return [...new Set(resources.map((resource) => resource.category))];
};

const DeleteHistory = () => {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [ deletedResources, setDeletedResources ] = useState(() => {
    const storedDeletedResources = localStorage.getItem("deleted_resources");
    if (!storedDeletedResources) return [];
    try {
      return JSON.parse(storedDeletedResources);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("deleted_resources", JSON.stringify(deletedResources));
  }, [deletedResources]);

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

  const handleRestore = (resource) => {
    try {
      const activeResources = JSON.parse(localStorage.getItem("dev_resources") || "[]");
      localStorage.setItem(
        "dev_resources",
        JSON.stringify([...activeResources, {...resource, deletedAt: null}])
      );
      setDeletedResources((prev) => prev.filter((r) => r.id !== resource.id));
      
      toast("Resource restored successfully", {
        description: "Moved back to active resources",
        action: {
          label: "View Resources",
          onClick: () => navigate("/resourcehub/list"),
        },
        cancel: {
          label: "Undo",
          onClick: () => {
            const current = JSON.parse(localStorage.getItem("dev_resources") || "[]");
            const currentDeleted = JSON.parse(localStorage.getItem("deleted_resources") || "[]");
            localStorage.setItem(
              "dev_resources",
              JSON.stringify(current.filter((r) => r.id !== resource.id))
            );
            localStorage.setItem(
              "deleted_resources",
              JSON.stringify([...currentDeleted, resource])
            );
            setDeletedResources((prev) => [...prev, resource]);
          },
        },
      });
    } catch(error) {
      console.error("Failed to restore resource: " + error);
      toast("Failed to restore resource");
    }
  };

  const handlePermanentDelete = (id) => {
    toast("This action cannot be undone.", {
      action: {
        label: "Delete",
        onClick: () => {
          try {
            setDeletedResources((prev) => prev.filter((r) => r.id !== id));
            toast("Resource permanently deleted");
          } catch(error) {
            console.error("Failed to delete resource: " + error);
            toast("Failed to delete resource");
          }
        }
      },
      cancel: {
        label: "Cancel"
      }
    });
  };

  const stats = [
    { label: "Total Deleted", value: deletedResources.length },
    { label: "This Week", value: deletedResources.filter((resource) => isWithinDays(resource.deletedAt, 7)).length },
    { label: "Categories", value: getUniqueCategories(deletedResources).length },
  ];

  return (
    <div className={`min-h-screen ${t.wrapper} px-6 py-10`}>
      <title>Delete History | DevTasks</title>
      <meta
        name="description"
        content="View and restore deleted resources."
      />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/resourcehub"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
              dark
                ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350"
            }`}
            title="Back to Workspace"
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
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tight transition-colors duration-300 ${
              dark ? "text-white" : "text-black"
            }`}>
              Delete History
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              A log of all removed resources and bookmarks.
            </p>
          </div>
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
                {deletedResources.length} entries
              </span>
            </div>

            {/* Entries */}
            {deletedResources.length === 0
              ? (
                <div className="col-span-full py-12 text-center text-zinc-500">
                  Deleted resources will appear here.
                </div>
              ) : (
                <div className={`divide-y ${t.divider}`}>
                  {deletedResources.map((resource) => (
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
                            aria-label="Restore resource"
                            onClick={() => handleRestore(resource)}
                          >
                            Restore
                          </button>
                          <button
                            className={`text-xs px-3 py-1.5 rounded-xl ${t.deleteBtn}`}
                            aria-label="Permanently delete resource (not yet implemented)"
                            onClick={() => handlePermanentDelete(resource.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteHistory;
