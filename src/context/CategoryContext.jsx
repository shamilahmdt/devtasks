import { createContext, useContext, useState } from "react";
import { normalizeCategory } from "./categoryUtils";

const DEFAULT_CATEGORIES = ["FEATURE", "BUG", "REFACTOR"];

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("available_categories");
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const addCategories = (names) => {
    const normalized = names.map(normalizeCategory).filter(Boolean);
    const updated = [...new Set([...categories, ...normalized])];
    if (updated.length === categories.length) return;
    setCategories(updated);
    localStorage.setItem("available_categories", JSON.stringify(updated));
  };

  const addCategory = (name) => addCategories([name]);

  const deleteCategory = (name, tasks) => {
    const isInUse = tasks.some((task) => task.category === name);
    if (isInUse) return false;
    const updated = categories.filter((c) => c !== name);
    setCategories(updated);
    localStorage.setItem("available_categories", JSON.stringify(updated));
    return true;
  };

  return (
    <CategoryContext.Provider
      value={{ categories, addCategory, addCategories, deleteCategory }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => useContext(CategoryContext);