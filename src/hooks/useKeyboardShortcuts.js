import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const TAG_BLACKLIST = new Set(["INPUT", "TEXTAREA", "SELECT"]);

// Mapping propre des shortcuts
const SHORTCUTS = {
  KeyH: "/",
  KeyD: "/dashboard",
  KeyT: "/taskmanage",
  KeyV: "/snippetvault",
  KeyB: "/resourcehub",
  KeyU: "/devutilities",
};

export default function useKeyboardShortcuts(onToggleHUD, hudVisible) {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  useEffect(() => {
    function handler(e) {
      const tag = document.activeElement?.tagName;
      if (TAG_BLACKLIST.has(tag)) return;

      const isModifierPressed = e.ctrlKey || e.metaKey || e.shiftKey;

      // ❓ Toggle HUD (matches '?' or '/')
      if ((e.key === "?" || e.code === "Slash") && !e.ctrlKey && !e.metaKey && !e.altKey) {
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

      // Alt + navigation or action
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.code === "KeyL") {
          e.preventDefault();
          toggleTheme();
          return;
        }

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
  }, [onToggleHUD, hudVisible, navigate, toggleTheme]);
}
