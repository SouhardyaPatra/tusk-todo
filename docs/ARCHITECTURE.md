# 🏗️ TUSK Architecture

This document describes the architecture and codebase structure of TUSK.

---

## 📁 File Structure

```
tusk-todo/
├── index.html              # Main HTML document
├── styles.css              # Complete CSS styling
├── app.js                  # TuskApp class and all logic
├── .gitignore              # Git ignore rules
├── README.md               # Project documentation
├── FEATURES.md             # Feature checklist
├── docs/
│   ├── PROMPT.md           # Copilot build guide
│   ├── ARCHITECTURE.md     # This file
│   └── DEPLOY.md           # Deployment instructions
├── archive/
│   ├── app.py              # Original Streamlit version
│   └── requirements.txt    # Python dependencies
└── .github/
    └── copilot-instructions.md  # Copilot context
```

---

## 🧩 Component Overview

### index.html (~430 lines)

| Section | Description |
|---------|-------------|
| `<head>` | Meta tags, fonts (Plus Jakarta Sans, JetBrains Mono), Font Awesome, stylesheets |
| `.header` | Logo, stat circles (Total/Active/Done/Memory), theme & sound toggles |
| `.quick-add-section` | NLP task input, priority/category/date/time dropdowns, Add button |
| `.main-content` | Task list container with sort/search controls |
| `.sidebar` | Quick actions, Pomodoro timer, Analytics cards |
| `.gif-popup` | Modal for motivational GIF display |
| `.toast-container` | Container for toast notifications |

### styles.css (~2050 lines)

| Section | Lines | Description |
|---------|-------|-------------|
| CSS Variables | 1-80 | Design tokens for colors, spacing, typography |
| Reset & Base | 81-150 | Box-sizing, body styles, typography |
| Header | 151-350 | Logo, stat circles, toggle buttons |
| Quick Add | 351-550 | Modern floating input design |
| Task List | 551-850 | Task cards, checkboxes, badges |
| Sidebar | 851-1200 | Quick actions, Pomodoro, Analytics |
| Modals & Popups | 1201-1400 | GIF popup, command palette |
| Animations | 1401-1550 | Keyframes for all animations |
| Dark Mode | 1551-1750 | [data-theme="dark"] overrides |
| Responsive | 1751-2050 | Mobile and tablet breakpoints |

### app.js (~1450 lines)

The entire application is contained in a single `TuskApp` class:

```javascript
class TuskApp {
    constructor()           // Initialize state variables
    init()                  // Entry point - load data, bind events
    bindElements()          // Cache DOM references
    bindEvents()            // Attach all event listeners
    
    // Storage
    loadFromStorage()       // Load from localStorage
    saveToStorage()         // Persist to localStorage
    loadDemoData()          // Generate demo tasks for first visit
    
    // Task CRUD
    addTask()               // Create new task
    deleteTask(id)          // Remove task
    toggleComplete(id)      // Mark done/undone
    toggleRemember(id)      // Toggle memory flag
    
    // NLP
    parseNaturalLanguage()  // Extract metadata from input
    
    // Rendering
    render()                // Re-render task list
    createTaskCard(task)    // Generate task card HTML
    
    // Filtering & Sorting
    filterTasks(tasks)      // Apply current filter
    sortTasks(tasks)        // Apply current sort
    
    // Stats & Analytics
    updateStats()           // Update header stat circles
    updateProgress()        // Update progress bars
    updateAnalytics()       // Update sidebar charts
    updateDurationStats()   // Calculate duration metrics
    
    // Pomodoro
    startPomodoro()         // Start timer
    pausePomodoro()         // Pause timer
    resetPomodoro()         // Reset to initial time
    
    // Effects
    playSound(type)         // Web Audio API sounds
    triggerConfetti()       // Canvas confetti animation
    showGif()               // Random motivational GIF
    showToast(msg, type)    // Toast notifications
    
    // Import/Export
    exportTasks()           // Download JSON backup
    importTasks(event)      // Upload and merge tasks
    
    // Bulk Actions
    stampede()              // Complete all visible tasks
    clearCompleted()        // Remove done tasks
}
```

---

## 🔄 Data Flow

### State Management

```
┌─────────────────────────────────────────────────────────────┐
│                       localStorage                           │
│  Key: 'tuskApp'                                             │
│  Value: { tasks: [], soundEnabled: boolean }                │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ loadFromStorage() / saveToStorage()
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      TuskApp Instance                        │
│  this.tasks = []                                            │
│  this.currentFilter = 'all'                                 │
│  this.currentSort = 'newest'                                │
│  this.searchQuery = ''                                      │
│  this.soundEnabled = true                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ render()
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         DOM                                  │
│  #taskList → Task cards                                     │
│  .stat-circle → Counts                                      │
│  .analytics-* → Charts                                      │
└─────────────────────────────────────────────────────────────┘
```

### Task Object Schema

```javascript
{
  id: "1706540400000",           // Date.now() string
  name: "Meeting with team",     // Task description
  priority: "High",              // "High" | "Medium" | "Low"
  category: "Work",              // "Work" | "Personal" | "Health" | "Learning" | "Finance" | "General"
  dueDate: "2026-01-30",         // YYYY-MM-DD or null
  dueTime: "14:00",              // HH:MM (24-hour) or null
  endTime: "15:30",              // HH:MM (24-hour) or null
  completed: false,              // boolean
  remembered: false,             // boolean (memory feature)
  createdAt: "2026-01-29T10:00:00.000Z",   // ISO string
  completedAt: "2026-01-29T15:30:00.000Z"  // ISO string or undefined
}
```

---

## 🎯 Event Flow

### Adding a Task

```
User types in #taskInput
         │
         ▼
User clicks Add or presses Enter
         │
         ▼
parseNaturalLanguage(input)
├── Extract priority (!, !!, keywords)
├── Extract category (keyword matching)
├── Extract date (today, tomorrow, next week)
├── Extract time range (3pm to 4pm)
└── Return cleaned name + metadata
         │
         ▼
addTask(name, priority, category, dueDate, dueTime, endTime)
├── Generate unique ID
├── Create task object
├── Push to this.tasks
├── saveToStorage()
├── render()
├── updateStats()
├── playSound('add')
└── showToast('Task added!')
```

### Completing a Task

```
User clicks checkbox on task card
         │
         ▼
toggleComplete(taskId)
├── Find task by ID
├── Toggle completed boolean
├── If now completed:
│   ├── Set completedAt timestamp
│   ├── playSound('complete')
│   ├── triggerConfetti()
│   └── showGif()
├── saveToStorage()
├── render()
└── updateStats()
```

### Filtering Tasks

```
User clicks stat circle (e.g., "Active")
         │
         ▼
Set this.currentFilter = 'active'
         │
         ▼
render()
├── filterTasks(this.tasks)
│   └── Return tasks where completed === false
├── sortTasks(filteredTasks)
├── For each task: createTaskCard(task)
└── Update DOM #taskList
```

---

## 🎨 Design System Reference

### Color Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--accent-primary` | #0d9488 | #0d9488 | Buttons, links, highlights |
| `--accent-secondary` | #f97316 | #f97316 | Warnings, medium priority |
| `--accent-tertiary` | #fbbf24 | #fbbf24 | Stars, badges |
| `--bg-primary` | #f8fafc | #0f172a | Page background |
| `--bg-secondary` | #ffffff | #1e293b | Card backgrounds |
| `--text-primary` | #0f172a | #f1f5f9 | Headings |
| `--text-secondary` | #475569 | #cbd5e1 | Body text |

### Priority Colors

| Priority | Color | Hex |
|----------|-------|-----|
| High | Red | #ef4444 |
| Medium | Orange | #f97316 |
| Low | Green | #10b981 |

### Category Colors

| Category | Color | Hex |
|----------|-------|-----|
| Work | Blue | #3b82f6 |
| Personal | Purple | #8b5cf6 |
| Health | Green | #10b981 |
| Learning | Amber | #f59e0b |
| Finance | Pink | #ec4899 |
| General | Gray | #6b7280 |

### Typography

- **Primary Font:** Plus Jakarta Sans (300, 400, 500, 600, 700, 800, 900)
- **Monospace:** JetBrains Mono (400, 500)
- **Base Size:** 16px
- **Scale:** 0.75rem, 0.85rem, 0.9rem, 1rem, 1.1rem, 1.25rem, 1.5rem, 2rem

### Spacing

- `0.25rem` (4px) - Tiny gaps
- `0.5rem` (8px) - Small gaps
- `0.75rem` (12px) - Medium gaps
- `1rem` (16px) - Standard gaps
- `1.5rem` (24px) - Section spacing
- `2rem` (32px) - Large sections

### Effects

| Effect | CSS |
|--------|-----|
| Glass Background | `background: rgba(255,255,255,0.7); backdrop-filter: blur(12px);` |
| Shadow Small | `box-shadow: 0 1px 2px rgba(0,0,0,0.05);` |
| Shadow Medium | `box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);` |
| Glow | `box-shadow: 0 0 20px rgba(13,148,136,0.3);` |

---

## 🔌 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Plus Jakarta Sans | Google Fonts | Primary UI font |
| JetBrains Mono | Google Fonts | Monospace/code font |
| Font Awesome | 6.4.0 | Icons throughout UI |

**CDN Links:**
```html
<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

<!-- Icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

---

## 🧪 Testing Checklist

### Core Features
- [ ] Add task via input
- [ ] Add task via NLP ("Meeting 3pm tomorrow work !!")
- [ ] Complete task (checkbox)
- [ ] Delete task
- [ ] Toggle remember/memory

### Filtering
- [ ] Filter: All
- [ ] Filter: Active
- [ ] Filter: Completed
- [ ] Filter: Today
- [ ] Filter: Overdue
- [ ] Filter: Remembered

### Sorting
- [ ] Sort: Newest
- [ ] Sort: Oldest
- [ ] Sort: Priority
- [ ] Sort: Due Date
- [ ] Sort: Alphabetical

### Features
- [ ] Pomodoro timer start/pause/reset
- [ ] Export tasks to JSON
- [ ] Import tasks from JSON
- [ ] Stampede mode (complete all)
- [ ] Clear completed tasks
- [ ] Dark mode toggle
- [ ] Sound toggle

### Persistence
- [ ] Tasks persist after page reload
- [ ] Sound preference persists
- [ ] Theme preference persists

---

## 📊 Performance Considerations

1. **DOM Updates**: Use `innerHTML` for batch updates rather than individual `appendChild` calls
2. **Event Delegation**: Consider delegating task card events to parent container
3. **Debouncing**: Search input is debounced to avoid excessive re-renders
4. **LocalStorage**: Keep task count reasonable (< 1000) for performance
5. **Animations**: Use CSS transforms and opacity for GPU acceleration

---

## 🔐 Security Notes

1. **No Server**: All data stored client-side in localStorage
2. **No External API**: GIF URLs are hardcoded, no API calls
3. **No User Auth**: Single-user, local-only application
4. **XSS Prevention**: Task names are rendered as text content, not HTML

---

## 🚀 Future Improvements

1. **IndexedDB**: For larger data storage with better performance
2. **Service Worker**: Enable offline functionality (PWA)
3. **Cloud Sync**: Optional backend for cross-device sync
4. **Recurring Tasks**: Support for daily/weekly/monthly repeats
5. **Subtasks**: Nested task support
6. **Tags**: Custom tagging beyond categories
7. **Drag & Drop**: Reorder tasks manually
