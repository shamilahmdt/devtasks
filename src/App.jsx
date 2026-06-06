import { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import TaskManage from "./pages/TaskManagement/TaskManage";
import AddTasks from "./pages/TaskManagement/taskmanage/AddTasks";
import ListTasks from "./pages/TaskManagement/taskmanage/ListTasks";
import DeleteHistory from "./pages/TaskManagement/taskmanage/DeleteHistory";
import DataCenter from "./pages/TaskManagement/taskmanage/DataCenter";
import SnippetVault from "./pages/SnippetVault/SnippetVault";
import AddSnippet from "./pages/SnippetVault/snippetvault/AddSnippet";
import ListSnippets from "./pages/SnippetVault/snippetvault/ListSnippets";
import DeleteHistorySnippet from "./pages/SnippetVault/snippetvault/DeleteHistory";
import DataCenterSnippet from "./pages/SnippetVault/snippetvault/DataCenter";
import { ThemeProvider } from "./context/ThemeContext";
import { CategoryProvider } from "./context/CategoryContext";
import ShortcutsHUD from "./components/ShortcutsHUD";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import "./index.css";

function App() {
  const [hudVisible, setHudVisible] = useState(false);
  const toggleHUD = useCallback(() => setHudVisible((v) => !v), []);

  return (
    <ThemeProvider>
      <CategoryProvider>
        <ShortcutsHUD visible={hudVisible} />
        <Router>
          <AppInner toggleHUD={toggleHUD} hudVisible={hudVisible} />
        </Router>
      </CategoryProvider>
    </ThemeProvider>
  );
}

function AppInner({ toggleHUD, hudVisible }) {
  useKeyboardShortcuts(toggleHUD, hudVisible);

  return (
    <>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/taskmanage" element={<TaskManage />} />
        <Route path="/taskmanage/add-tasks" element={<AddTasks />} />
        <Route path="/taskmanage/list-tasks" element={<ListTasks />} />
        <Route path="/taskmanage/delete-history" element={<DeleteHistory />} />
        <Route path="/taskmanage/data-center" element={<DataCenter />} />
        <Route path="/snippetvault" element={<SnippetVault />} />
        <Route path="/snippetvault/add" element={<AddSnippet />} />
        <Route path="/snippetvault/list" element={<ListSnippets />} />
        <Route path="/snippetvault/edit/:snippetid" element={<AddSnippet />} />
        <Route path="/snippetvault/delete-history" element={<DeleteHistorySnippet />} />
        <Route path="/snippetvault/data-center" element={<DataCenterSnippet />} />
      </Routes>
    </>
  );
}

export default App;
