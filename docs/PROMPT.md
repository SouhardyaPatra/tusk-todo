# 🐘 Build TUSK with GitHub Copilot

This guide provides comprehensive prompts to recreate the TUSK todo app from scratch using GitHub Copilot. Follow the steps in order for the best results.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [HTML Structure](#2-html-structure)
3. [CSS Design System](#3-css-design-system)
4. [JavaScript Architecture](#4-javascript-architecture)
5. [NLP Task Parser](#5-nlp-task-parser)
6. [Core Features](#6-core-features)
7. [Advanced Features](#7-advanced-features)
8. [Animations & Effects](#8-animations--effects)

---

## 1. Project Setup

### Prompt 1.1: Initialize Project
```
Create a new vanilla JavaScript todo app called "TUSK" with:
- index.html (main structure)
- styles.css (all styling)  
- app.js (TuskApp class with all logic)

No frameworks, no build tools. Pure HTML/CSS/JS.
The app should have a glassmorphism design with teal (#0d9488) as the primary accent color.
```

### Prompt 1.2: HTML Boilerplate
```
Create index.html with:
- Meta tags for responsive viewport
- Google Fonts: Plus Jakarta Sans (weights 300-900) and JetBrains Mono (400, 500)
- Font Awesome 6.4.0 CDN for icons
- Link to styles.css and app.js
- Dark mode toggle in header
- Basic semantic structure: header, main, aside (sidebar)
```

---

## 2. HTML Structure

### Prompt 2.1: Header Component
```
Create the header section with:
- Logo: elephant emoji 🐘 with "TUSK" text
- Stat circles showing: Total tasks, Active tasks, Completed tasks, Remembered tasks
- Each stat circle should be clickable to filter tasks
- Dark mode toggle button (sun/moon icons)
- Sound toggle button (volume icons)
```

### Prompt 2.2: Quick Add Section
```
Create a modern floating task input section with:
- Gradient icon wrapper with plus sign
- Full-width text input with NLP placeholder: 'Try: "Meeting 3pm to 4pm tomorrow work !!"'
- "Add Task" button with arrow icon
- Pill-style dropdowns for: Priority (Low/Medium/High), Category (6 options), Date, Start Time, End Time
- Small NLP hint badge showing "! = medium, !! = high"
```

### Prompt 2.3: Task List Section
```
Create the task list container with:
- Sort dropdown (Newest, Oldest, Priority, Due Date, Alphabetical)
- Search input with magnifying glass icon
- Empty state with elephant icon and "No tasks yet" message
- Task cards container with id="taskList"
```

### Prompt 2.4: Sidebar Structure
```
Create a sidebar with collapsible sections:
1. Quick Actions: Stampede Mode, Clear Completed, Export, Import (hidden file input)
2. Pomodoro Timer: Time display, Start/Pause/Reset buttons, Duration slider (5-60 min)
3. Analytics Cards:
   - Weekly Activity (bar chart placeholder)
   - Priority Breakdown (progress bars for High/Medium/Low)
   - Productivity Score (circular ring showing percentage)
   - Duration Stats (total, completed, pending, average time)
```

### Prompt 2.5: Task Card Template
```
Create a task card structure with:
- Checkbox for completion (custom styled)
- Task name with strikethrough when completed
- Priority badge (color-coded)
- Category badge with icon
- Due date/time display
- Duration display (if start and end time exist)
- "Remember" button (brain icon, toggles remembered state)
- Delete button (trash icon)
- Hover effects and smooth transitions
```

---

## 3. CSS Design System

### Prompt 3.1: CSS Variables (Complete List)
```css
Create CSS custom properties for TUSK:

/* Color Palette */
--accent-primary: #0d9488;      /* Teal */
--accent-secondary: #f97316;    /* Coral/Orange */
--accent-tertiary: #fbbf24;     /* Amber */
--accent-glow: rgba(13, 148, 136, 0.3);

/* Priority Colors */
--priority-high: #ef4444;
--priority-medium: #f97316;
--priority-low: #10b981;

/* Category Colors */
--cat-work: #3b82f6;
--cat-personal: #8b5cf6;
--cat-health: #10b981;
--cat-learning: #f59e0b;
--cat-finance: #ec4899;
--cat-general: #6b7280;

/* Light Mode */
--bg-primary: #f8fafc;
--bg-secondary: #ffffff;
--bg-tertiary: #f1f5f9;
--text-primary: #0f172a;
--text-secondary: #475569;
--text-muted: #94a3b8;
--border-color: #e2e8f0;

/* Dark Mode (add [data-theme="dark"] selector) */
--bg-primary: #0f172a;
--bg-secondary: #1e293b;
--bg-tertiary: #334155;
--text-primary: #f1f5f9;
--text-secondary: #cbd5e1;
--text-muted: #64748b;
--border-color: #334155;

/* Glass Effect */
--glass-bg: rgba(255, 255, 255, 0.7);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-blur: 12px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
--shadow-glow: 0 0 20px var(--accent-glow);

/* Transitions */
--transition-fast: 0.15s ease;
--transition-base: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 0.5s ease;

/* Layout */
--sidebar-width: 280px;
--header-height: 72px;
```

### Prompt 3.2: Glassmorphism Effects
```
Add glassmorphism styling to cards and panels:
- Semi-transparent backgrounds using rgba
- backdrop-filter: blur(12px)
- Subtle borders with rgba white
- Soft shadows with glow effects
- Smooth hover transitions that increase blur and glow
```

### Prompt 3.3: Dark Mode Styles
```
Implement dark mode using [data-theme="dark"] selector:
- Invert background colors (light bg becomes dark)
- Adjust text colors for contrast
- Update glass effect for dark backgrounds
- Ensure all accent colors remain vibrant
- Add smooth transition when toggling themes
```

### Prompt 3.4: Responsive Design
```
Add responsive styles for:
- Mobile (max-width: 768px): Stack sidebar below main content, full-width cards
- Tablet (max-width: 1024px): Collapsible sidebar, adjusted padding
- Desktop: Side-by-side layout with fixed sidebar
```

---

## 4. JavaScript Architecture

### Prompt 4.1: TuskApp Class Structure
```javascript
Create a TuskApp class with:

Constructor:
- tasks array
- currentFilter (all/active/completed/today/overdue/remembered)
- currentSort (newest/oldest/priority/dueDate/alphabetical)
- searchQuery string
- soundEnabled boolean
- pomodoroTime, pomodoroRunning, pomodoroInterval

Methods to implement:
- init() - Initialize app, load data, bind events
- bindElements() - Cache all DOM references
- bindEvents() - Attach event listeners
- loadFromStorage() - Load tasks from localStorage
- saveToStorage() - Save tasks to localStorage
- render() - Re-render task list based on filters
- addTask(name, priority, category, dueDate, dueTime, endTime)
- deleteTask(id)
- toggleComplete(id)
- toggleRemember(id)
- filterTasks(tasks) - Apply current filter
- sortTasks(tasks) - Apply current sort
- updateStats() - Update header stat circles
- parseNaturalLanguage(input) - NLP parser
- showToast(message, type) - Toast notifications
- playSound(type) - Web Audio API sounds
- triggerConfetti() - Confetti animation
```

### Prompt 4.2: State Management
```
Implement localStorage persistence:
- Key: 'tuskApp'
- Store: { tasks: [], soundEnabled: boolean }
- Auto-save on every task change
- Load on app initialization
- Handle corrupted data gracefully with try/catch
```

### Prompt 4.3: Event Binding
```
Bind events for:
- Add task button and Enter key in input
- Task checkbox toggle
- Delete button on each task
- Remember button toggle
- Filter buttons (stat circles)
- Sort dropdown change
- Search input (debounced)
- Dark mode toggle
- Sound toggle
- Pomodoro controls
- Export/Import buttons
- Clear completed button
- Stampede mode button
```

---

## 5. NLP Task Parser

### Prompt 5.1: Priority Detection
```javascript
Implement priority detection in parseNaturalLanguage():

// High Priority
- !! or !!! anywhere in text
- Keywords: urgent, asap, critical, immediately, high priority, high

// Medium Priority  
- Single ! anywhere in text
- Keywords: important, medium priority, medium, soon

// Low Priority (default)
- Keywords: low, whenever, someday, eventually, low priority

Remove the priority markers from the final task name.
```

### Prompt 5.2: Category Detection
```javascript
Implement category detection with keyword matching:

const categoryKeywords = {
  Work: ['work', 'office', 'meeting', 'project', 'deadline', 'client', 
         'boss', 'presentation', 'standup', 'sync', 'review', 'sprint'],
  Personal: ['personal', 'home', 'family', 'friend', 'birthday', 
             'gift', 'party', 'dinner', 'lunch'],
  Health: ['health', 'gym', 'workout', 'exercise', 'doctor', 'medicine', 
           'diet', 'yoga', 'fitness', 'dentist', 'checkup'],
  Learning: ['learn', 'study', 'course', 'tutorial', 'practice', 
             'training', 'read', 'book', 'chapter'],
  Finance: ['finance', 'money', 'pay', 'bill', 'bank', 'invest', 
            'budget', 'tax', 'salary', 'expense']
};

Default to 'General' if no keywords match.
Use word boundary regex to avoid partial matches.
```

### Prompt 5.3: Date Detection
```javascript
Implement date parsing:

- "today" → current date
- "tomorrow" → current date + 1 day
- "next week" → current date + 7 days
- Optional: Parse specific dates like "Jan 30" or "1/30"

Return date in YYYY-MM-DD format for input[type="date"] compatibility.
```

### Prompt 5.4: Time Range Detection
```javascript
Implement time parsing for start and end times:

Patterns to match:
- "3pm" or "3:30pm" → Start time, end time = start + 30 minutes
- "3pm to 4pm" or "3:00pm - 4:30pm" → Full range
- "@3pm" or "at 3pm" → Start time

Convert to 24-hour format (HH:MM) for input[type="time"].
Handle both "pm"/"am" and 24-hour formats.
```

### Prompt 5.5: Complete NLP Function
```javascript
Create the full parseNaturalLanguage(input) function that:
1. Detects and removes priority markers (!, !!)
2. Detects and extracts category keywords
3. Detects and extracts date references
4. Detects and extracts time/time ranges
5. Returns cleaned task name and all extracted metadata
6. Sets default duration of 30 minutes if only start time given

Return object:
{
  name: "cleaned task name",
  priority: "High" | "Medium" | "Low",
  category: "Work" | "Personal" | "Health" | "Learning" | "Finance" | "General",
  dueDate: "YYYY-MM-DD" | null,
  dueTime: "HH:MM" | null,
  endTime: "HH:MM" | null
}
```

---

## 6. Core Features

### Prompt 6.1: Task CRUD Operations
```
Implement task operations:

addTask(name, priority, category, dueDate, dueTime, endTime):
- Generate unique ID using Date.now()
- Create task object with all properties
- Add completed: false, remembered: false, createdAt timestamp
- Push to tasks array, save, render, update stats
- Play add sound, show toast

deleteTask(id):
- Filter out task by ID
- Save, render, update stats
- Play delete sound

toggleComplete(id):
- Toggle completed boolean
- If completing: add completedAt timestamp, show GIF, trigger confetti
- Save, render, update stats
- Play complete sound
```

### Prompt 6.2: Filtering System
```
Implement filter logic:

filterTasks(tasks):
- 'all': return all tasks
- 'active': return tasks where completed === false
- 'completed': return tasks where completed === true  
- 'today': return tasks where dueDate === today's date
- 'overdue': return active tasks where dueDate < today
- 'remembered': return tasks where remembered === true

Apply search query filter on top of status filter.
```

### Prompt 6.3: Sorting System
```
Implement sort logic:

sortTasks(tasks):
- 'newest': sort by createdAt descending
- 'oldest': sort by createdAt ascending
- 'priority': High first, then Medium, then Low
- 'dueDate': earliest date first, null dates last
- 'alphabetical': sort by name A-Z
```

### Prompt 6.4: Stats Update
```
Implement updateStats():
- Count total tasks
- Count active (not completed) tasks
- Count completed tasks
- Count remembered tasks
- Update stat circle displays
- Update progress percentage
- Calculate productivity score
```

---

## 7. Advanced Features

### Prompt 7.1: Pomodoro Timer
```
Implement Pomodoro timer:
- Duration adjustable via slider (5-60 minutes)
- Start/Pause toggle button
- Reset button
- Display remaining time as MM:SS
- Use setInterval for countdown
- On completion: play sound, show confetti, show toast
- Optional: track pomodoro sessions completed
```

### Prompt 7.2: Export/Import
```
Implement JSON backup:

exportTasks():
- Convert tasks array to JSON string with pretty print
- Create Blob with application/json type
- Create download link and trigger click
- Filename: 'tusk-tasks.json'
- Show success toast

importTasks(event):
- Read file from input event
- Parse JSON
- Validate it's an array
- Merge with existing tasks (imported first)
- Save and render
- Show toast with count imported
```

### Prompt 7.3: Stampede Mode
```
Implement "complete all" feature:
- Get all visible (filtered) incomplete tasks
- Mark each as completed with timestamp
- Trigger one big confetti burst
- Play completion sound
- Show toast "🐘 Stampede! X tasks completed!"
- Save and render
```

### Prompt 7.4: Duration Tracking
```
Calculate and display task durations:

getDuration(dueTime, endTime):
- Parse both times to minutes since midnight
- Handle overnight tasks (end < start means next day)
- Return duration in minutes

formatDuration(minutes):
- Convert to "Xh Ym" format
- Show only minutes if < 60

Display duration badge on task cards.
Track total duration in analytics.
```

### Prompt 7.5: Demo Data Auto-Load
```
Add demo data for first-time users:

In loadFromStorage():
- Check if tasks array is empty AND no 'tuskDemoLoaded' flag
- If true, call loadDemoData()

loadDemoData():
- Create 20 sample tasks spanning 7 days
- Mix of priorities, categories, completion states
- Include tasks with time ranges for duration demo
- Set localStorage flag 'tuskDemoLoaded' = 'true'
- Save to storage
- Show welcome toast
```

---

## 8. Animations & Effects

### Prompt 8.1: Confetti Animation
```
Implement canvas-based confetti:
- Create full-screen canvas overlay
- Generate 100+ particles with random:
  - Colors from brand palette
  - X position across screen width
  - Y velocity (upward burst)
  - Rotation speed
- Apply gravity to particles
- Animate with requestAnimationFrame
- Remove canvas after 3 seconds
```

### Prompt 8.2: Sound Effects (Web Audio API)
```
Implement sounds without audio files:

playSound(type):
- Create AudioContext
- Create OscillatorNode
- Set frequency based on type:
  - 'add': 440Hz (A4), 0.1s duration
  - 'complete': 880Hz (A5), 0.15s
  - 'delete': 220Hz (A3), 0.1s  
  - 'pomodoro': 660Hz, 0.3s
- Apply gain envelope (fade in/out)
- Connect to destination and play
```

### Prompt 8.3: Motivational GIF Popup
```
Implement completion celebration:
- Array of Giphy URLs for motivational GIFs
- On task complete, show modal with random GIF
- Auto-close after 4 seconds
- Include close button
- Bounce-in animation
- Semi-transparent backdrop
```

### Prompt 8.4: Toast Notifications
```
Implement toast system:

showToast(message, type):
- Types: 'success', 'error', 'info'
- Create toast element with icon based on type
- Append to toast container (top-right)
- Slide-in animation
- Auto-remove after 3 seconds
- Fade-out animation on remove
```

### Prompt 8.5: CSS Animations
```css
Add keyframe animations:

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeOut {
  to { opacity: 0; transform: translateY(-10px); }
}

@keyframes popupBounce {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes brandPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

---

## 🎯 Implementation Order

For best results, implement in this order:

1. **HTML Structure** (Prompts 2.1-2.5)
2. **CSS Variables & Base Styles** (Prompts 3.1-3.2)
3. **TuskApp Class Skeleton** (Prompt 4.1)
4. **Local Storage** (Prompt 4.2)
5. **Basic CRUD** (Prompt 6.1)
6. **Render & Stats** (Prompts 6.4)
7. **Event Binding** (Prompt 4.3)
8. **NLP Parser** (Prompts 5.1-5.5)
9. **Filtering & Sorting** (Prompts 6.2-6.3)
10. **Animations** (Prompts 8.1-8.5)
11. **Advanced Features** (Prompts 7.1-7.5)
12. **Dark Mode & Responsive** (Prompts 3.3-3.4)

---

## 💡 Tips for Copilot

1. **Be Specific**: Include exact values (colors, sizes, timing)
2. **One Feature at a Time**: Don't combine unrelated features
3. **Test Incrementally**: Verify each feature before moving on
4. **Reference Previous Code**: Mention existing class names and methods
5. **Ask for Refinements**: "Make the animation smoother" or "Add hover effect"

---

Happy building! 🐘
