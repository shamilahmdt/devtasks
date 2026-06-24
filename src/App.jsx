import { useState, useCallback, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
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
import HtmlEntityConverter from "./pages/DevUtilities/devutilities/HtmlEntityConverter";

import TextCaseConverter from "./pages/DevUtilities/devutilities/TextCaseConverter";
//extra added
import UserAgentParser from "./pages/DevUtilities/devutilities/UserAgentParser";

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
import JsonYamlConverter from "./pages/DevUtilities/devutilities/JsonYamlConverter";
import MarkdownPreviewer from "./pages/DevUtilities/devutilities/MarkdownPreviewer";
import Base64Url from "./pages/DevUtilities/devutilities/Base64Url";
import TimestampConverter from "./pages/DevUtilities/devutilities/TimestampConverter";
import UuidGenerator from "./pages/DevUtilities/devutilities/UuidGenerator";
import JwtDecoder from "./pages/DevUtilities/devutilities/JwtDecoder";
import DiffChecker from "./pages/DevUtilities/devutilities/DiffChecker";
import CodeSandbox from "./pages/DevUtilities/devutilities/CodeSandbox";
import HashGenerator from "./pages/DevUtilities/devutilities/HashGenerator";
import ColorConverter from "./pages/DevUtilities/devutilities/ColorConverter";
import QrCodeGenerator from "./pages/DevUtilities/devutilities/QrCodeGenerator";
import UrlParserBuilder from "./pages/DevUtilities/devutilities/UrlParserBuilder";
import SqlFormatter from "./pages/DevUtilities/devutilities/SqlFormatter";
import JwtEncoder from "./pages/DevUtilities/devutilities/JwtEncoder";
import CssGradientGenerator from "./pages/DevUtilities/devutilities/CssGradientGenerator";

import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { CategoryProvider } from "./context/CategoryContext";
import { SidebarProvider } from "./context/SidebarContext";
import ShortcutsHUD from "./components/ShortcutsHUD";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "./index.css";
import SplashScreen from "./components/SplashScreen";
import MockJsonGenerator from "./pages/DevUtilities/devutilities/MockJsonDataGenerator";
import MarkdownTableGenerator from "./pages/DevUtilities/devutilities/MarkdownTableGenerator";
import JsonSchemaValidator from "./pages/DevUtilities/devutilities/JsonSchemaValidator";
import FlexboxGridGenerator from "./pages/DevUtilities/devutilities/FlexboxGridGenerator";
import ChmodCalculator from "./pages/DevUtilities/devutilities/ChmodCalculator";
import CronExpression from "./pages/DevUtilities/devutilities/CronExpression";
import StringInspector from "./pages/DevUtilities/devutilities/StringInspector";
import NumberBaseConverter from "./pages/DevUtilities/devutilities/NumberBaseConverter";

function App() {
  const [hudVisible, setHudVisible] = useState(false);
  const toggleHUD = useCallback(() => setHudVisible((v) => !v), []);

  return (
    <ThemeProvider>
      <CategoryProvider>
        <SidebarProvider>
          <ShortcutsHUD visible={hudVisible} />
          <Router>
            <AppInner toggleHUD={toggleHUD} hudVisible={hudVisible} />
          </Router>
        </SidebarProvider>
      </CategoryProvider>
    </ThemeProvider>
  );
}

function AppInner({ toggleHUD, hudVisible }) {
  useKeyboardShortcuts(toggleHUD, hudVisible);
  const location = useLocation();
  const currentPathRef = useRef(location.pathname);
  currentPathRef.current = location.pathname;

  const showNavbar = location.pathname !== "/";
  const { dark } = useTheme();

  // Flag to block scroll saving during route shifts and scroll restoration
  const isRestoringRef = useRef(false);


  // Scroll restoration logic for inner scrollable content wrapper
  useEffect(() => {
    isRestoringRef.current = true;

    const scrollContainer = document.querySelector(".navbar-layout-content");
    if (!scrollContainer) return;

    const savedPosition = sessionStorage.getItem(`scroll_${location.pathname}`);
    const timers = [];
    if (savedPosition) {
      const targetScroll = parseInt(savedPosition, 10);

      scrollContainer.scrollTop = targetScroll;

      timers.push(setTimeout(() => { scrollContainer.scrollTop = targetScroll; }, 50));
      timers.push(setTimeout(() => { scrollContainer.scrollTop = targetScroll; }, 150));
      timers.push(setTimeout(() => { scrollContainer.scrollTop = targetScroll; }, 300));
      timers.push(setTimeout(() => { scrollContainer.scrollTop = targetScroll; }, 500));

    } else {
      scrollContainer.scrollTop = 0;
    }

    // Safety fallback: allow scroll saving after 800ms
    const safetyTimeout = setTimeout(() => {
      if (isRestoringRef.current) {
        isRestoringRef.current = false;
      }
    }, 800);

    // End restoration immediately if the user interacts with the page
    const handleUserInteraction = () => {
      if (isRestoringRef.current) {
        isRestoringRef.current = false;
      }
    };

    scrollContainer.addEventListener("wheel", handleUserInteraction, {
      passive: true,
    });
    scrollContainer.addEventListener("touchmove", handleUserInteraction, {
      passive: true,
    });
    scrollContainer.addEventListener("keydown", handleUserInteraction, {
      passive: true,
    });
    scrollContainer.addEventListener("mousedown", handleUserInteraction, {
      passive: true,
    });

    let saveTimeout;
    const handleScroll = () => {
      if (currentPathRef.current !== location.pathname) {
        return;
      }
      if (isRestoringRef.current) {
        return;
      }
      // Capture the scrolled scrollTop value immediately to avoid unmount layout shifts
      const currentScrollTop = scrollContainer.scrollTop;

      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        sessionStorage.setItem(`scroll_${location.pathname}`, currentScrollTop);
      }, 50);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      scrollContainer.removeEventListener("wheel", handleUserInteraction);
      scrollContainer.removeEventListener("touchmove", handleUserInteraction);
      scrollContainer.removeEventListener("keydown", handleUserInteraction);
      scrollContainer.removeEventListener("mousedown", handleUserInteraction);
      if (saveTimeout) clearTimeout(saveTimeout);
      clearTimeout(safetyTimeout);
      timers.forEach(clearTimeout);
    };
  }, [location.pathname]);

  return (
    <div
      className={`w-full ${
        showNavbar ? "h-screen overflow-hidden flex flex-col" : "min-h-screen"
      } transition-colors duration-300 ${
        dark ? "bg-zinc-950 text-white" : "bg-[#FDFDFD] text-black"
      }`}
    >
      <SplashScreen />

      <Toaster position="bottom-right" />
      {showNavbar && <Navbar />}
      <div
        className={
          showNavbar
            ? "relative flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row"
            : "w-full"
        }
      >
        {showNavbar && <Sidebar />}
        <div
          className={
            showNavbar
              ? "flex-1 min-h-0 overflow-y-auto overflow-x-hidden navbar-layout-content flex flex-col"
              : "w-full overflow-x-hidden"
          }
        >
          <Routes>

            <Route path="/devutilities/user-agent" element={<UserAgentParser />} />

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
            <Route
              path="/devutilities/json-yaml"
              element={<JsonYamlConverter />}
            />
            <Route
              path="/devutilities/markdown"
              element={<MarkdownPreviewer />}
            />
            <Route
              path="/devutilities/html-entity"
              element={<HtmlEntityConverter />}
            />
            <Route path="/devutilities/base64" element={<Base64Url />} />
            <Route
              path="/devutilities/timestamp"
              element={<TimestampConverter />}
            />
            <Route path="/devutilities/uuid" element={<UuidGenerator />} />
            <Route path="/devutilities/jwt" element={<JwtDecoder />} />
            <Route path="/devutilities/jwt-encode" element={<JwtEncoder />} />
            <Route path="/devutilities/diff" element={<DiffChecker />} />
            <Route path="/devutilities/hash" element={<HashGenerator />} />
            <Route path="/devutilities/color" element={<ColorConverter />} />
            <Route path="/devutilities/code" element={<CodeSandbox />} />
            <Route path="/devutilities/qrcode" element={<QrCodeGenerator />} />
            <Route
              path="/devutilities/text-case"
              element={<TextCaseConverter />}
            />
            <Route path="/devutilities/chmod" element={<ChmodCalculator />} />
            <Route
              path="/devutilities/mock-json-generator"
              element={<MockJsonGenerator />}
            />
            <Route
              path="/devutilities/flexbox-grid-generator"
              element={<FlexboxGridGenerator />}
            />
            <Route
              path="/devutilities/markdown-table-genertaor"
              element={<MarkdownTableGenerator />}
            />
            <Route
              path="/devutilities/url-parser"
              element={<UrlParserBuilder />}
            />
            <Route path="/devutilities/sql" element={<SqlFormatter />} />
            <Route path="/devutilities/json-schema-validator" element={<JsonSchemaValidator />} />
            <Route path="/devutilities/cron" element={<CronExpression />} />
            <Route path="/devutilities/string-inspector" element={<StringInspector />} />
            <Route path="/devutilities/number-base-converter" element={<NumberBaseConverter />} />

            <Route
              path="/devutilities/css-gradient"
              element={<CssGradientGenerator />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;