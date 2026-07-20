# DevTasks ✅

[![React 19](https://img.shields.io/badge/React-19.2.5-black?style=flat-square&logo=react)](https://react.dev)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4.2.4-black?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Vite 6](https://img.shields.io/badge/Vite-v6.0.1-black?style=flat-square&logo=vite)](https://vite.dev)
[![GitHub Stars](https://img.shields.io/github/stars/shamilahmdt/devtasks?style=flat-square&logo=github&color=black)](https://github.com/shamilahmdt/devtasks/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-black?style=flat-square)](LICENSE)

A high-performance, minimalist engineering command center designed for developer workflows. DevTasks provides a premium, clean monochrome workspace featuring live roadmap analytics, a snippet code registry, a project resources manager, offline developer utilities, and a global keyboard shortcuts HUD.

## 🚀 Live Demo

Experience DevTasks live at: **[https://dev-tasks-beta.vercel.app/](https://dev-tasks-beta.vercel.app/)**

---

## 🎮 Check Out My Other Project

**QuickPlay Zone** — [Live Demo](https://quickplay-zone.vercel.app/) · [Repository](https://github.com/shamilahmdt/quickplay-zone)

[![QuickPlay Zone](https://img.shields.io/badge/Check_Out-QuickPlay_Zone-black?style=flat-square&logo=vercel)](https://quickplay-zone.vercel.app/)

---

## ✨ Features

* 🎛️ **Developer Command Center (Dashboard)**: A unified engineering cockpit displaying dynamic status badges, active task counts, total snippets, saved links, and quick-access utility shortcuts.
* 🌓 **Premium Monochrome Aesthetics**: Seamless theme switching between pure light and high-contrast dark zinc modes.
* 📋 **Task Workspace**: Group roadmap tasks by `FEATURE`, `BUG`, or `REFACTOR` with custom priority weights (`HIGH`, `MEDIUM`, `LOW`), safety-net deletion logs, and JSON backups.
* 💾 **Snippet Workspace**: Fast search registries, double-click inline code updates, interactive click-to-copy clipboards, and category groupings.
* 🔗 **Resource Hub**: Maintain consolidated reference bookmarks for API endpoints, design mockups, specification sheets, and local environment links.
* 🛠️ **Dev Utilities Sandbox**: Offline helper tools including a **Regex Tester** (pattern validation), **JSON Formatter** (beautify/minify), **Base64/URL Converter**, and **Unix Timestamp Converter**.
* ⌨️ **Global Shortcuts HUD**: A system-wide hotkey dashboard for quick keyboard navigation.
* 🔔 **Polished micro-interactions**: Fluid transitions, hover states, and toast notifications powered by `sonner`.

---

## 🛠️ Tech Stack

* **Core**: [React 19](https://react.dev)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com) & Vanilla CSS
* **Bundler & Dev Server**: [Vite 6](https://vite.dev)
* **Routing**: [React Router v7](https://reactrouter.com)
* **Notifications**: [Sonner](https://emilkowalski.github.io/sonner/)
* **Icons**: [React Icons](https://react-icons.github.io/react-icons/)

## ☕ Support My Work

<a href="https://buymeachai.ezee.li/shamil_ahmd">
  <img
    src="https://buymeachai.ezee.li/assets/images/buymeachai-button.png"
    alt="Buy Me A Chai"
    width="180"
  />
</a>

---

## 📦 Installation & Quick Start

Get your local development environment running in under 2 minutes:

### 1. Clone the Repository
```bash
git clone https://github.com/shamilahmdt/devtasks.git
cd devtasks
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🤝 Contributing

We love open-source contributions! Whether you're a seasoned developer or looking to make your very first PR, you are welcome here.

⭐ **Support the Project**: If you find DevTasks helpful or are planning to contribute, please consider **giving us a star**! It helps others discover the project and shows your appreciation for our maintainers.

### 🌿 Contribution Pipeline
1. **Fork** the repository and clone your fork locally.
2. **Create a branch** for your feature:
   ```bash
   git checkout -b feat/your-awesome-feature
   ```
3. **Commit your changes** using clean, descriptive commit messages.
4. **Push to your fork** and submit a **Pull Request** targeting our `main` branch.

### 🟢 Good First Issue: Add a New Dev Utility to DevTasks (Issue #193)

If you are a first-time contributor, we have a featured open issue to help you get started:

> **[Good First Issue] Add a New Dev Utility to DevTasks**
> * **Status**: Open 🟢 (Issue #193)
> * **Difficulty**: Beginner / Intermediate
> * **Focus**: React Components & Routing
> * **Labels**: `good first issue` · `help wanted` · `enhancement` · `ui`
>
> Help expand the Dev Utilities Sandbox by creating a new offline developer tool (e.g., HTML Encoder, Markdown Previewer) and registering it in the application. Refer to existing utilities such as `JsonFormatter.jsx` for structure and theme styling.
>
> See full details and implementation guides in **[GitHub Issue #193](https://github.com/shamilahmdt/devtasks/issues/193)**.

---

## 💬 Discussions & Community

Got a feature idea, an architectural suggestion, or just want to chat about the roadmap?
* **Join the Conversations**: Head over to our **[GitHub Discussions](https://github.com/shamilahmdt/devtasks/discussions)** page.
* **Pitch New Features**: We love exploring new concepts! Start a discussion thread to discuss layout designs, icons, or state structures before writing code.

---

## 🚀 Architectural Milestones

DevTasks is fully operational to boost developer workflow speed. Here is the current completion status of our primary workspace modules:

* 📋 **Task Management Workspace (`/taskmanage`)** — *[COMPLETED]* ✅
  * A full-fledged developer roadmap planner with feature/bug/refactor classification, custom priority weighting, deleted history logs, and import/export backup controls.
* 📦 **Minimalist Snippet Vault (`/snippetvault`)** — *[COMPLETED]* ✅
  * A secure local snippet registry with sub-pages for creating, editing, search filtering, auditing deleted history, and JSON data backup/restores.
* 🔗 **Resource Hub (`/resourcehub`)** — *[COMPLETED]* ✅
  * A consolidated bookmarks manager for engineering reference links, design specs, APIs, and docs with category groupings and full backup utilities.
* 🛠️ **Dev Utilities Sandbox (`/devutilities`)** — *[IN PROGRESS]* 🏗️
  * A rich offline sandbox of developer utilities featuring a Regex Tester, JSON Formatter, Base64 & URL Encoder/Decoder, Timestamp Converter, UUID Generator, JWT Decoder, Diff Checker, Hash Generator, Color Converter, Code Sandbox, and QR Code Generator.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
