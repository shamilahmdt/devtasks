import { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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

// Resource Hub Imports
import ResourceHub from "./pages/ResourceHub/ResourceHub";
import AddResource from "./pages/ResourceHub/resourcehub/AddResource";
import ListResources from "./pages/ResourceHub/resourcehub/ListResources";
import DeleteHistoryResource from "./pages/ResourceHub/resourcehub/DeleteHistory";
import DataCenterResource from "./pages/ResourceHub/resourcehub/DataCenter";

// Dev Utilities Imports
import DevUtilities from "./pages/DevUtilities/DevUtilities";
import RegexTester from "./pages/DevUtilities/devutilities/RegexTester";
import JsonFormatter from "./pages/DevUtilities/devutilities/JsonFormatter";
import Base64Url from "./pages/DevUtilities/devutilities/Base64Url";
import TimestampConverter from "./pages/DevUtilities/devutilities/TimestampConverter";
import UuidGenerator from "./pages/DevUtilities/devutilities/UuidGenerator";

import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { CategoryProvider } from "./context/CategoryContext";
import ShortcutsHUD from "./components/ShortcutsHUD";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import Navbar from "./components/Navbar";
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
  const location = useLocation();
  const showNavbar = location.pathname !== "/";
  const { dark } = useTheme();

  return (
    <div
      className={`w-full ${
        showNavbar ? "h-screen overflow-hidden flex flex-col" : "min-h-screen"
      } transition-colors duration-300 ${
        dark ? "bg-zinc-950 text-white" : "bg-[#FDFDFD] text-black"
      }`}
    >
      <Toaster position="bottom-right" />
      {showNavbar && <Navbar />}
      <div className={showNavbar ? "flex-1 overflow-y-auto navbar-layout-content flex flex-col" : "w-full"}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Task Management */}
        <Route path="/taskmanage" element={<TaskManage />} />
        <Route path="/taskmanage/add-tasks" element={<AddTasks />} />
        <Route path="/taskmanage/list-tasks" element={<ListTasks />} />
        <Route path="/taskmanage/delete-history" element={<DeleteHistory />} />
        <Route path="/taskmanage/data-center" element={<DataCenter />} />
        
        {/* Snippet Vault */}
        <Route path="/snippetvault" element={<SnippetVault />} />
        <Route path="/snippetvault/add" element={<AddSnippet />} />
        <Route path="/snippetvault/edit/:id" element={<AddSnippet />} />
        <Route path="/snippetvault/list" element={<ListSnippets />} />
        <Route path="/snippetvault/edit/:snippetid" element={<AddSnippet />} />
        <Route path="/snippetvault/delete-history" element={<DeleteHistorySnippet />} />
        <Route path="/snippetvault/data-center" element={<DataCenterSnippet />} />
        
        {/* Resource Hub */}
        <Route path="/resourcehub" element={<ResourceHub />} />
        <Route path="/resourcehub/add" element={<AddResource />} />
        <Route path="/resourcehub/edit/:id" element={<AddResource />} />
        <Route path="/resourcehub/list" element={<ListResources />} />
        <Route path="/resourcehub/delete-history" element={<DeleteHistoryResource />} />
        <Route path="/resourcehub/data-center" element={<DataCenterResource />} />

        {/* Dev Utilities */}
        <Route path="/devutilities" element={<DevUtilities />} />
        <Route path="/devutilities/regex" element={<RegexTester />} />
        <Route path="/devutilities/json" element={<JsonFormatter />} />
        <Route path="/devutilities/base64" element={<Base64Url />} />
        <Route path="/devutilities/timestamp" element={<TimestampConverter />} />
        <Route path="/devutilities/uuid" element={<UuidGenerator />} />
      </Routes>
      </div>
    </div>
  );
}

export default App;
