import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TAG_BLACKLIST = new Set(["INPUT", "TEXTAREA", "SELECT"]);

// Mapping propre des shortcuts
const SHORTCUTS = {
  KeyH: "/",
  KeyD: "/dashboard",
  KeyA: "/add-tasks",
  KeyL: "/list-tasks",
  KeyC: "/data-center",
  KeyR: "/delete-history",
};

export default function useKeyboardShortcuts(onToggleHUD, hudVisible) {
  const navigate = useNavigate();

  useEffect(() => {
    function handler(e) {
      const tag = document.activeElement?.tagName;
      if (TAG_BLACKLIST.has(tag)) return;

      const isModifierPressed = e.ctrlKey || e.metaKey || e.shiftKey;

      // ❓ Toggle HUD
      if (e.code === "Slash" && !isModifierPressed && e.altKey === false) {
        e.preventDefault();
        onToggleHUD();
        return;
      }

      // ESC → fermer HUD
      if (e.code === "Escape") {
        if (hudVisible) {
          e.preventDefault();
          onToggleHUD();
        }
        return;
      }

      // Alt + navigation
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const path = SHORTCUTS[e.code];

        if (path) {
          e.preventDefault();
          navigate(path);
        }
      }
    }

    window.addEventListener("keydown", handler, { passive: false });

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [onToggleHUD, hudVisible, navigate]);
}
