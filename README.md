# RepoToPrompt 🚀

**RepoToPrompt** is a desktop tool designed for developers. It converts your entire project structure (files & folders) into a single, optimized text file ready for LLMs like **ChatGPT**, **Claude**, or **Gemini**.

## ✨ Features

* **Recursive Scanning:** Drag & drop folders to scan entire projects.
* **Smart Ignoring:** Automatically respects `.gitignore` and filters out `node_modules`, binary files, and system junk.
* **Token Counter:** Real-time token estimation (GPT-4 tokenizer) to fit context limits.
* **Security Scan:** Detects accidental API keys (OpenAI, AWS, etc.) before you copy.
* **LLM-Optimized Output:** Formats code with XML tags `<file path="...">` and generates an ASCII file tree.

## 📥 Download

[**Download for Windows (v1.1.0)**](https://github.com/XXXDoriXXX/RepoToPrompt/releases/tag/v1.1.0)

## 🛠 How to Use

1.  Download and install the app.
2.  Drag your project folder (e.g., `src`) into the drop zone.
3.  Review the file list, stats, and security warnings.
4.  Click **Copy to Clipboard** and paste it into ChatGPT!

## 🔧 Tech Stack

* Electron
* TypeScript
* Node.js
