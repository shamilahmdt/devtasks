import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Styled ASCII Art and Info in Console
console.log(
  `%c  _____               _____              _   \n` +
  `%c |  __ \\             |_   _|            | |  \n` +
  `%c | |  | | ___ _   __   | |  __ _ ___  __| | __ ___\n` +
  `%c | |  | |/ _ \\ \\ / /   | | / _\` / __|/ _\` |/ / __/\n` +
  `%c | |__| |  __/\\ V /    | || (_| \\__ \\ (_|   <\\__ \\\n` +
  `%c |_____/ \\___| \\_/     |_| \\__,_|___/\\__,_|_\\_\\___/\n\n` +
  `%cWelcome to Dev Tasks! 🛠️\n` +
  `%cThis is a beginner-friendly open-source React project open for contributions. Feel free to fork the repo, pick any Good First Issue or Help Wanted task, and submit a pull request. UI improvements, features, bug fixes, and docs updates are welcome. Let’s build and learn 🚀\n\n` +
  `%c- Website:      %chttps://dev-tasks-beta.vercel.app/\n` +
  `%c- Repository:   %chttps://github.com/shamilahmdt/devtasks\n` +
  `%c- Contributing: %chttps://github.com/shamilahmdt/devtasks/blob/main/CONTRIBUTING.md\n` +
  `%c- License:      %cMIT\n`,
  'color: #a1a1aa; font-weight: bold;',
  'color: #a1a1aa; font-weight: bold;',
  'color: #a1a1aa; font-weight: bold;',
  'color: #a1a1aa; font-weight: bold;',
  'color: #a1a1aa; font-weight: bold;',
  'color: #a1a1aa; font-weight: bold;',
  'color: #e8e8ea; font-weight: bold; font-size: 13px;',
  'color: #94a3b8; line-height: 1.4;',
  'color: #a1a1aa;', 'color: #38bdf8; text-decoration: underline;',
  'color: #a1a1aa;', 'color: #38bdf8; text-decoration: underline;',
  'color: #a1a1aa;', 'color: #38bdf8; text-decoration: underline;',
  'color: #a1a1aa;', 'color: #e8e8ea; font-weight: bold;'
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
