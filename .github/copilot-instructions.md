# TUSK Todo App - Copilot Instructions

This file provides context to GitHub Copilot for consistent AI-assisted development.

## Project Overview

TUSK is a vanilla JavaScript todo application with natural language processing capabilities. It features a glassmorphism UI design, duration tracking, Pomodoro timer, and analytics dashboard.

## Tech Stack

- **Frontend:** Pure HTML5, CSS3, JavaScript (ES6+)
- **Storage:** Browser localStorage
- **Icons:** Font Awesome 6.4.0
- **Fonts:** Plus Jakarta Sans, JetBrains Mono
- **No frameworks, no build tools, no dependencies**

## File Structure

```
index.html    - Main HTML structure (~430 lines)
styles.css    - Complete CSS styling (~2050 lines)
app.js        - TuskApp class with all logic (~1450 lines)
```

## Coding Conventions

### JavaScript

- Use ES6+ features (classes, arrow functions, template literals, destructuring)
- Single `TuskApp` class contains all application logic
- Methods use camelCase: `parseNaturalLanguage()`, `toggleComplete()`
- Store DOM references in `bindElements()` for performance
- Always call `saveToStorage()` after state changes
- Use `render()` to update the UI after data changes

### CSS

- Use CSS custom properties (variables) for all colors, spacing, shadows
- BEM-ish naming: `.task-card`, `.task-card__checkbox`, `.task-card--completed`
- Glassmorphism: `backdrop-filter: blur()` with semi-transparent backgrounds
- All colors defined in `:root` and `[data-theme="dark"]`
- Transitions use `var(--transition-base)` for consistency

### HTML

- Semantic elements: `<header>`, `<main>`, `<aside>`, `<section>`
- IDs for JavaScript hooks: `id="taskInput"`, `id="taskList"`
- Classes for styling: `class="task-card"`, `class="stat-circle"`
- Data attributes for state: `data-theme`, `data-filter`, `data-id`

## Design Tokens

### Colors

```css
/* Primary Palette */
--accent-primary: #0d9488;    /* Teal - buttons, links */
--accent-secondary: #f97316;  /* Coral - warnings, medium priority */
--accent-tertiary: #fbbf24;   /* Amber - highlights */

/* Priority */
--priority-high: #ef4444;     /* Red */
--priority-medium: #f97316;   /* Orange */
--priority-low: #10b981;      /* Green */

/* Categories */
--cat-work: #3b82f6;          /* Blue */
--cat-personal: #8b5cf6;      /* Purple */
--cat-health: #10b981;        /* Green */
--cat-learning: #f59e0b;      /* Amber */
--cat-finance: #ec4899;       /* Pink */
--cat-general: #6b7280;       /* Gray */
```

### Typography

- Primary font: `'Plus Jakarta Sans', sans-serif`
- Monospace: `'JetBrains Mono', monospace`
- Base size: 16px (1rem)

### Spacing

- Small: `0.5rem` (8px)
- Medium: `1rem` (16px)
- Large: `1.5rem` (24px)
- XL: `2rem` (32px)

## NLP Parsing Rules

When implementing or modifying the natural language parser:

### Priority Detection

```javascript
// High: !! or !!! or keywords
const highPriority = /!!+|urgent|asap|critical|immediately/i;

// Medium: single ! or keywords
const mediumPriority = /(?<![!])!(?![!])|important|medium/i;

// Low: explicit keywords (default otherwise)
const lowPriority = /low|whenever|someday|eventually/i;
```

### Category Keywords

```javascript
const categoryKeywords = {
  Work: ['work', 'office', 'meeting', 'project', 'deadline', 'client', 'presentation'],
  Personal: ['personal', 'home', 'family', 'friend', 'birthday', 'gift'],
  Health: ['health', 'gym', 'workout', 'doctor', 'yoga', 'fitness'],
  Learning: ['learn', 'study', 'course', 'tutorial', 'practice'],
  Finance: ['finance', 'pay', 'bill', 'bank', 'invest', 'budget']
};
```

### Date Patterns

```javascript
// today, tomorrow, next week
const datePatterns = {
  today: /\btoday\b/i,
  tomorrow: /\btomorrow\b/i,
  nextWeek: /\bnext\s+week\b/i
};
```

### Time Patterns

```javascript
// Single time: "3pm", "3:30pm", "@3pm", "at 3pm"
// Range: "3pm to 4pm", "3:00pm - 4:30pm"
const timePattern = /(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*(?:to|-)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i;
const singleTimePattern = /(?:@|at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i;
```

## Task Object Schema

```javascript
{
  id: string,           // Date.now().toString()
  name: string,         // Task description
  priority: string,     // "High" | "Medium" | "Low"
  category: string,     // "Work" | "Personal" | "Health" | "Learning" | "Finance" | "General"
  dueDate: string|null, // "YYYY-MM-DD"
  dueTime: string|null, // "HH:MM" (24-hour)
  endTime: string|null, // "HH:MM" (24-hour)
  completed: boolean,
  remembered: boolean,
  createdAt: string,    // ISO timestamp
  completedAt: string   // ISO timestamp (only when completed)
}
```

## Common Patterns

### Adding a Task

```javascript
addTask(name, priority, category, dueDate, dueTime, endTime) {
    const task = {
        id: Date.now().toString(),
        name,
        priority,
        category,
        dueDate,
        dueTime,
        endTime,
        completed: false,
        remembered: false,
        createdAt: new Date().toISOString()
    };
    this.tasks.push(task);
    this.saveToStorage();
    this.render();
    this.updateStats();
    this.playSound('add');
    this.showToast('Task added! 📝', 'success');
}
```

### Filtering Tasks

```javascript
filterTasks(tasks) {
    let filtered = tasks;
    
    switch (this.currentFilter) {
        case 'active':
            filtered = tasks.filter(t => !t.completed);
            break;
        case 'completed':
            filtered = tasks.filter(t => t.completed);
            break;
        case 'today':
            const today = new Date().toISOString().split('T')[0];
            filtered = tasks.filter(t => t.dueDate === today);
            break;
        // ... more filters
    }
    
    if (this.searchQuery) {
        filtered = filtered.filter(t => 
            t.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    }
    
    return filtered;
}
```

### Playing Sounds

```javascript
playSound(type) {
    if (!this.soundEnabled) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    const sounds = {
        add: { freq: 440, dur: 0.1 },
        complete: { freq: 880, dur: 0.15 },
        delete: { freq: 220, dur: 0.1 }
    };
    
    const { freq, dur } = sounds[type];
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
}
```

## Testing Guidance

When modifying features, test:

1. **CRUD Operations:** Add, complete, delete, remember tasks
2. **NLP Parsing:** Various input formats with priority, category, date, time
3. **Persistence:** Reload page, verify data persists
4. **Dark Mode:** Toggle theme, verify all elements styled correctly
5. **Responsive:** Test on mobile viewport (< 768px)

## Performance Tips

- Batch DOM updates with `innerHTML` instead of multiple `appendChild`
- Debounce search input (300ms delay)
- Use CSS transforms for animations (GPU accelerated)
- Keep task count reasonable for localStorage limits (~5MB)

## Accessibility Notes

- All interactive elements should be keyboard accessible
- Use semantic HTML elements
- Maintain color contrast ratios (WCAG AA)
- Include aria-labels on icon-only buttons
