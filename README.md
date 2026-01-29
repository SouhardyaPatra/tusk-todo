<div align="center">

# 🐘 Tusk Todo

### The Intelligent Todo App with Natural Language Processing

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=github&logoColor=white)](https://pages.github.com/)

*A beautiful, feature-rich task manager that understands natural language. Just type like you think.*

[Live Demo](#) · [Documentation](docs/) · [Deploy Your Own](docs/DEPLOY.md)

</div>

---

## ✨ Features

### 🧠 Natural Language Processing
Type tasks naturally and let TUSK understand:
```
"Meeting with John 3pm to 4pm tomorrow work !!"
```
TUSK automatically extracts:
- **Task name:** Meeting with John
- **Time range:** 3:00 PM - 4:00 PM (duration calculated)
- **Date:** Tomorrow
- **Category:** Work
- **Priority:** High (`!!`)

### 🎯 Smart Priority & Categories
| Priority | Syntax | Keywords |
|----------|--------|----------|
| 🔴 High | `!!` or `!!!` | urgent, asap, critical |
| 🟠 Medium | `!` | important |
| 🟢 Low | (default) | low, whenever, someday |

| Category | Auto-detected Keywords |
|----------|----------------------|
| 💼 Work | meeting, project, deadline, client, presentation |
| 👤 Personal | home, family, friend, birthday, gift |
| 💪 Health | gym, workout, doctor, yoga, fitness |
| 📚 Learning | study, course, tutorial, practice |
| 💰 Finance | pay, bill, bank, invest, budget |

### ⏱️ Duration Tracking
- Set start and end times for tasks
- Automatic duration calculation
- Analytics dashboard shows total time spent

### 📊 Analytics Dashboard
- Weekly activity visualization
- Priority breakdown with progress bars
- Productivity score ring
- Duration statistics (total, completed, pending, average)

### 🍅 Pomodoro Timer
- Built-in focus timer (5-60 minutes)
- Sound alerts and confetti celebration
- Seamless workflow integration

### 🎨 Beautiful UI
- Glassmorphism design with blur effects
- Dark/Light mode support
- Smooth animations and transitions
- Motivational GIF popups on task completion

### 🔧 Power Features
- **Stampede Mode:** Complete all visible tasks at once
- **Import/Export:** JSON backup and restore
- **Memory Feature:** Mark important tasks with 🧠
- **Advanced Filters:** By status, date, category, priority
- **Keyboard Shortcuts:** Quick navigation

---

## 🚀 Quick Start

### Option 1: Just Open It
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tusk-todo.git

# Open index.html in your browser
# That's it! No build step, no dependencies.
```

### Option 2: Local Server (for development)
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .

# Then open http://localhost:8080
```

---

## 📁 Project Structure

```
tusk-todo/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling (2000+ lines)
├── app.js              # TuskApp class & all logic (1400+ lines)
├── docs/
│   ├── PROMPT.md       # Build this app with Copilot
│   ├── ARCHITECTURE.md # Codebase documentation
│   └── DEPLOY.md       # GitHub Pages deployment guide
├── archive/
│   └── app.py          # Original Streamlit version (reference)
└── .github/
    └── copilot-instructions.md  # Copilot context file
```

---

## 🤖 Build It Yourself with GitHub Copilot

Want to recreate TUSK from scratch? Check out our comprehensive guide:

📖 **[docs/PROMPT.md](docs/PROMPT.md)** — Step-by-step prompts to build every feature

This guide includes:
- Complete NLP parsing rules
- CSS design system with all variables
- TuskApp class architecture
- Feature implementation order

---

## 🌐 Deploy to GitHub Pages

Deploy your own instance in 2 minutes:

1. Fork this repository
2. Go to **Settings** → **Pages**
3. Select **Source:** `main` branch, `/ (root)` folder
4. Click **Save**

Your app will be live at `https://YOUR_USERNAME.github.io/tusk-todo`

📖 **[Full deployment guide →](docs/DEPLOY.md)**

---

## 🎨 Design System

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| Background | `#f8fafc` | `#0f172a` |
| Accent Primary | `#0d9488` (Teal) | `#0d9488` |
| Accent Secondary | `#f97316` (Coral) | `#f97316` |
| Accent Tertiary | `#fbbf24` (Amber) | `#fbbf24` |

**Typography:** Plus Jakarta Sans (UI) + JetBrains Mono (code)

---

## 📄 License

MIT License - feel free to use this for your own projects!

---

<div align="center">

**Built with 🐘 and vanilla JavaScript**

*No frameworks. No build tools. Just clean code.*

</div>