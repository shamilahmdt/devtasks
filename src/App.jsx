import { useCallback, useEffect, useRef, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import SnippetVault from "./pages/SnippetVault/SnippetVault";
import AddSnippet from "./pages/SnippetVault/snippetvault/AddSnippet";
import DataCenterSnippet from "./pages/SnippetVault/snippetvault/DataCenter";
import DeleteHistorySnippet from "./pages/SnippetVault/snippetvault/DeleteHistory";
import ListSnippets from "./pages/SnippetVault/snippetvault/ListSnippets";
import TaskManage from "./pages/TaskManagement/TaskManage";
import AddTasks from "./pages/TaskManagement/taskmanage/AddTasks";
import DataCenter from "./pages/TaskManagement/taskmanage/DataCenter";
import DeleteHistory from "./pages/TaskManagement/taskmanage/DeleteHistory";
import ListTasks from "./pages/TaskManagement/taskmanage/ListTasks";
import JsonTypesConverter from "./pages/DevUtilities/devutilities/JsonTypesConverter";

// Resource Hub Imports
import ResourceHub from "./pages/ResourceHub/ResourceHub";
import AddResource from "./pages/ResourceHub/resourcehub/AddResource";
import DataCenterResource from "./pages/ResourceHub/resourcehub/DataCenter";
import DeleteHistoryResource from "./pages/ResourceHub/resourcehub/DeleteHistory";
import ListResources from "./pages/ResourceHub/resourcehub/ListResources";

// Dev Utilities Imports
import Base64Image from "./pages/DevUtilities/devutilities/Base64Image";
import Base64Url from "./pages/DevUtilities/devutilities/Base64Url";
import BcryptGenerator from "./pages/DevUtilities/devutilities/BcryptGenerator";
import ChmodCalculator from "./pages/DevUtilities/devutilities/ChmodCalculator";
import CodeSandbox from "./pages/DevUtilities/devutilities/CodeSandbox";
import ColorConverter from "./pages/DevUtilities/devutilities/ColorConverter";
import CronExpression from "./pages/DevUtilities/devutilities/CronExpression";
import CssAnimationGenerator from "./pages/DevUtilities/devutilities/CssAnimationGenerator";
import CssGlassmorphismPlayground from "./pages/DevUtilities/devutilities/CssGlassmorphismPlayground";
import CssGradientGenerator from "./pages/DevUtilities/devutilities/CssGradientGenerator";
import CssUnitConverter from "./pages/DevUtilities/devutilities/CssUnitConverter";
import DevUtilities from "./pages/DevUtilities/DevUtilities";
import DiffChecker from "./pages/DevUtilities/devutilities/DiffChecker";
import FlexboxGridGenerator from "./pages/DevUtilities/devutilities/FlexboxGridGenerator";
import HashGenerator from "./pages/DevUtilities/devutilities/HashGenerator";
import HtmlEntityConverter from "./pages/DevUtilities/devutilities/HtmlEntityConverter";
import HtmlMultiConverter from "./pages/DevUtilities/devutilities/HtmlMultiConverter";
import JsonFormatter from "./pages/DevUtilities/devutilities/JsonFormatter";
import JsonPathEvaluator from "./pages/DevUtilities/devutilities/JsonPathEvaluator";
import JsonSchemaValidator from "./pages/DevUtilities/devutilities/JsonSchemaValidator";
import JsonYamlCsvXmlConverter from "./pages/DevUtilities/devutilities/JsonYamlCsvXmlConverter";
import JwtDecoder from "./pages/DevUtilities/devutilities/JwtDecoder";
import JwtEncoder from "./pages/DevUtilities/devutilities/JwtEncoder";
import KeycodeInspector from "./pages/DevUtilities/devutilities/KeycodeInspector";
import LoremIpsumGenerator from "./pages/DevUtilities/devutilities/LoremIpsumGenerator";
import MarkdownPreviewer from "./pages/DevUtilities/devutilities/MarkdownPreviewer";
import MarkdownTableGenerator from "./pages/DevUtilities/devutilities/MarkdownTableGenerator";
import MockJsonGenerator from "./pages/DevUtilities/devutilities/MockJsonDataGenerator";
import NumberBaseConverter from "./pages/DevUtilities/devutilities/NumberBaseConverter";
import PasswordGenerator from "./pages/DevUtilities/devutilities/PasswordGenerator";
import QrCodeGenerator from "./pages/DevUtilities/devutilities/QrCodeGenerator";
import RegexTester from "./pages/DevUtilities/devutilities/RegexTester";
import SqlFormatter from "./pages/DevUtilities/devutilities/SqlFormatter";
import SqlSchemaConverter from "./pages/DevUtilities/devutilities/SqlSchemaConverter";
import StringInspector from "./pages/DevUtilities/devutilities/StringInspector";
import SubnetCalculator from "./pages/DevUtilities/devutilities/SubnetCalculator";
import SvgOptimizer from "./pages/DevUtilities/devutilities/SvgOptimizer";
import TextCaseConverter from "./pages/DevUtilities/devutilities/TextCaseConverter";
import TimestampConverter from "./pages/DevUtilities/devutilities/TimestampConverter";
import TokenGenerator from "./pages/DevUtilities/devutilities/TokenGenerator";
import UrlParserBuilder from "./pages/DevUtilities/devutilities/UrlParserBuilder";
import UserAgentParser from "./pages/DevUtilities/devutilities/UserAgentParser";
import UuidGenerator from "./pages/DevUtilities/devutilities/UuidGenerator";
import WordCounter from "./pages/DevUtilities/devutilities/WordCounter";
import GitCommandBuilder from "./pages/DevUtilities/devutilities/GitCommandBuilder";
import ImageOptimizer from "./pages/DevUtilities/devutilities/ImageOptimizer";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ShortcutsHUD from "./components/ShortcutsHUD";
import Sidebar from "./components/Sidebar";
import SplashScreen from "./components/SplashScreen";
import SIDEBAR_SECTIONS from "./config/sidebarSections";
import { CategoryProvider } from "./context/CategoryContext";
import { SidebarProvider } from "./context/SidebarContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import "./index.css";

function App() {
  const [hudVisible, setHudVisible] = useState(false);
  const toggleHUD = useCallback(() => setHudVisible((v) => !v), []);

  return (
    <ThemeProvider>
      <CategoryProvider>
        <SidebarProvider>
          <ShortcutsHUD visible={hudVisible} onClose={toggleHUD} />
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

  const showNavbar = location.pathname !== "/";
  const { dark } = useTheme();

  // Central SEO Metadata dynamic updating
  useEffect(() => {
    // Find active section and item
    const activeSection = SIDEBAR_SECTIONS.find((section) =>
      section.match(location.pathname),
    );
    let title =
      "DevTasks — Developer Workspace: Tasks, Snippets, Resources & DevUtilities";
    let description =
      "DevTasks is a unified developer workspace. Manage engineering task roadmaps, vault secure code snippets, reference curated bookmark links, and run offline dev utilities with ease.";
    let keywords =
      "devtasks, dev tasks, developer todo workspace, engineer task manager, roadmap builder, bug tracking checklist, code snippet manager, bookmarks manager, dev workflow optimizer";

    if (activeSection) {
      const activeItem = activeSection.items.find((item) => {
        if (item.exact) {
          return item.path === location.pathname;
        }
        return (
          location.pathname === item.path ||
          location.pathname.startsWith(`${item.path}/`)
        );
      });

      if (activeItem) {
        title = `${activeItem.label} — DevTasks`;
        description = `${activeItem.description}. Complete developer utility page.`;
        keywords = `${activeItem.label.toLowerCase()}, ${activeSection.title.toLowerCase()}, devtasks, developer tools, developer workspace`;
      } else if (activeSection.title) {
        title = `${activeSection.title} — DevTasks`;
        description = `${activeSection.description}. Manage tasks, snippets, resources, and dev utilities.`;
        keywords = `${activeSection.title.toLowerCase()}, devtasks, developer workspace`;
      }
    }

   
    document.title = title;

    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement("meta");
      descMeta.setAttribute("name", "description");
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute("content", description);

    let keysMeta = document.querySelector('meta[name="keywords"]');
    if (!keysMeta) {
      keysMeta = document.createElement("meta");
      keysMeta.setAttribute("name", "keywords");
      document.head.appendChild(keysMeta);
    }
    keysMeta.setAttribute("content", keywords);

    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);

    const twitterTitle = document.querySelector(
      'meta[property="twitter:title"]',
    );
    if (twitterTitle) twitterTitle.setAttribute("content", title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", description);

    const twitterDesc = document.querySelector(
      'meta[property="twitter:description"]',
    );
    if (twitterDesc) twitterDesc.setAttribute("content", description);

    // Canonical link
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const currentUrl = window.location.origin + location.pathname;
      canonical.setAttribute("href", currentUrl);
    }
  }, [location.pathname]);

  
  const isRestoringRef = useRef(false);

  useEffect(() => {
    const pathAtEffectStart = location.pathname;
    isRestoringRef.current = true;

    const scrollContainer = document.querySelector(".navbar-layout-content");
    if (!scrollContainer) return;

    const savedPosition = sessionStorage.getItem(`scroll_${location.pathname}`);
    const timers = [];
    if (savedPosition) {
      const targetScroll = parseInt(savedPosition, 10);

      scrollContainer.scrollTop = targetScroll;

      timers.push(
        setTimeout(() => {
          scrollContainer.scrollTop = targetScroll;
        }, 50),
      );
      timers.push(
        setTimeout(() => {
          scrollContainer.scrollTop = targetScroll;
        }, 150),
      );
      timers.push(
        setTimeout(() => {
          scrollContainer.scrollTop = targetScroll;
        }, 300),
      );
      timers.push(
        setTimeout(() => {
          scrollContainer.scrollTop = targetScroll;
        }, 500),
      );
    } else {
      scrollContainer.scrollTop = 0;
    }

   
    const safetyTimeout = setTimeout(() => {
      if (isRestoringRef.current) {
        isRestoringRef.current = false;
      }
    }, 800);

   
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
      if (pathAtEffectStart !== location.pathname) {
        return;
      }
      if (isRestoringRef.current) {
        return;
      }
      
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
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Task Management */}
              <Route path="/taskmanage" element={<TaskManage />} />
              <Route path="/taskmanage/add-tasks" element={<AddTasks />} />
              <Route path="/taskmanage/list-tasks" element={<ListTasks />} />
              <Route
                path="/taskmanage/delete-history"
                element={<DeleteHistory />}
              />
              <Route path="/taskmanage/data-center" element={<DataCenter />} />

              {/* Snippet Vault */}
              <Route path="/snippetvault" element={<SnippetVault />} />
              <Route path="/snippetvault/add" element={<AddSnippet />} />
              <Route path="/snippetvault/edit/:id" element={<AddSnippet />} />
              <Route path="/snippetvault/list" element={<ListSnippets />} />
              <Route
                path="/snippetvault/delete-history"
                element={<DeleteHistorySnippet />}
              />
              <Route
                path="/snippetvault/data-center"
                element={<DataCenterSnippet />}
              />

              {/* Resource Hub */}
              <Route path="/resourcehub" element={<ResourceHub />} />
              <Route path="/resourcehub/add" element={<AddResource />} />
              <Route path="/resourcehub/edit/:id" element={<AddResource />} />
              <Route path="/resourcehub/list" element={<ListResources />} />
              <Route
                path="/resourcehub/delete-history"
                element={<DeleteHistoryResource />}
              />
              <Route
                path="/resourcehub/data-center"
                element={<DataCenterResource />}
              />

              {/* Dev Utilities */}
              <Route path="/devutilities" element={<DevUtilities />} />
              <Route
                path="/devutilities/keycode-inspector"
                element={<KeycodeInspector />}
              />
              <Route
                path="/devutilities/css-animation"
                element={<CssAnimationGenerator />}
              />
              <Route path="/devutilities/regex" element={<RegexTester />} />
              <Route
                path="/devutilities/css-unit-converter"
                element={<CssUnitConverter />}
              />
              <Route path="/devutilities/json" element={<JsonFormatter />} />
              <Route
                path="/devutilities/json-yaml-csv-xml"
                element={<JsonYamlCsvXmlConverter />}
              />
              <Route
                path="/devutilities/json-csv-yaml"
                element={
                  <Navigate to="/devutilities/json-yaml-csv-xml" replace />
                }
              />
              <Route
                path="/devutilities/xml-json"
                element={
                  <Navigate to="/devutilities/json-yaml-csv-xml" replace />
                }
              />
              <Route
                path="/devutilities/json-yaml"
                element={
                  <Navigate to="/devutilities/json-yaml-csv-xml" replace />
                }
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
                path="/devutilities/base64-image"
                element={<Base64Image />}
              />
              <Route
  path="/devutilities/json-types-converter"
  element={<JsonTypesConverter />}
/>
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
              <Route
                path="/devutilities/qrcode"
                element={<QrCodeGenerator />}
              />
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
                path="/devutilities/markdown-table-generator"
                element={<MarkdownTableGenerator />}
              />
              <Route
                path="/devutilities/url-parser"
                element={<UrlParserBuilder />}
              />
              <Route
                path="/devutilities/user-agent"
                element={<UserAgentParser />}
              />
              <Route
                path="/devutilities/bcrypt"
                element={<BcryptGenerator />}
              />
              <Route path="/devutilities/sql" element={<SqlFormatter />} />
              <Route
                path="/devutilities/json-schema-validator"
                element={<JsonSchemaValidator />}
              />
              <Route path="/devutilities/cron" element={<CronExpression />} />
              <Route
                path="/devutilities/string-inspector"
                element={<StringInspector />}
              />
              <Route
                path="/devutilities/number-base-converter"
                element={<NumberBaseConverter />}
              />
              <Route
                path="/devutilities/subnet"
                element={<SubnetCalculator />}
              />

              <Route
                path="/devutilities/css-gradient"
                element={<CssGradientGenerator />}
              />
              <Route
                path="/devutilities/glassmorphism"
                element={<CssGlassmorphismPlayground />}
              />
              <Route
                path="/devutilities/lorem-ipsum"
                element={<LoremIpsumGenerator />}
              />
              <Route
                path="/devutilities/svg-optimizer"
                element={<SvgOptimizer />}
              />
              <Route
                path="/devutilities/password-generator"
                element={<PasswordGenerator />}
              />
              <Route
                path="/devutilities/html-multi-converter"
                element={<HtmlMultiConverter />}
              />
              <Route
                path="/devutilities/jsonpath-playground"
                element={<JsonPathEvaluator />}
              />
              <Route
                path="/devutilities/design-tokens"
                element={<TokenGenerator />}
              />
              <Route
                path="/devutilities/word-counter"
                element={<WordCounter />}
              />
              <Route
                path="/devutilities/sql-converter"
                element={<SqlSchemaConverter />}
              />
              <Route
                path="/devutilities/image-optimizer"
                element={<ImageOptimizer />}
              />
              <Route path="/devutilities/git-builder" element={<GitCommandBuilder />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          {showNavbar && <Footer />}
        </div>
      </div>
    </div>
  );
}

export default App;
