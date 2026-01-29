/**
 * TUSK - The Elephant Never Forgets
 * Premium Todo Application
 */

class TuskApp {
    constructor() {
        // State
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.sortBy = 'newest';
        this.editingTaskId = null;
        this.selectedTasks = new Set();
        this.soundEnabled = true;
        this.streak = 0;
        this.lastCompletionDate = null;
        
        // Track manual dropdown changes
        this.priorityManuallySelected = false;
        this.categoryManuallySelected = false;
        this.dateManuallySelected = false;
        this.timeManuallySelected = false;
        this.endTimeManuallySelected = false;
        
        // Pomodoro State
        this.pomodoroTime = 25;
        this.pomodoroRemaining = 25 * 60;
        this.pomodoroRunning = false;
        this.pomodoroInterval = null;
        
        // Funny Motivational GIFs
        this.gifs = [
            { url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', caption: '🐘 An elephant never forgets... and neither should you!' },
            { url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', caption: '💪 You got this! One task at a time!' },
            { url: 'https://media.giphy.com/media/DhstvI3zZ598Nb1rFf/giphy.gif', caption: '🎉 Productivity mode: ACTIVATED!' },
            { url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', caption: '🚀 Launch your tasks into completion!' },
            { url: 'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif', caption: '⚡ Feel the productivity energy!' },
            { url: 'https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/giphy.gif', caption: '🔥 On fire today!' },
            { url: 'https://media.giphy.com/media/l4q8cJzGdR9J8w3hS/giphy.gif', caption: '🌟 Star performer alert!' },
            { url: 'https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif', caption: '👏 Give yourself a round of applause!' },
            { url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif', caption: '🎯 Bullseye! Target those tasks!' },
            { url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif', caption: '💃 Dance through your to-do list!' },
            { url: 'https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif', caption: '🤓 Big brain time!' },
            { url: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif', caption: '✨ Making magic happen!' }
        ];
        
        // Completion GIFs
        this.completionGifs = [
            { url: 'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif', caption: '🎉 NAILED IT!' },
            { url: 'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif', caption: '🏆 Champion move!' },
            { url: 'https://media.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif', caption: '💪 Beast mode!' },
            { url: 'https://media.giphy.com/media/fdyZ3qI0GVZC0/giphy.gif', caption: '👊 Crushed it!' },
            { url: 'https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif', caption: '🎊 Celebration time!' },
            { url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif', caption: '🌈 Pure excellence!' },
            { url: 'https://media.giphy.com/media/QMkPpxPDYY0fu/giphy.gif', caption: '🐘 The elephant approves!' }
        ];
        
        // Sound Effects
        this.sounds = {
            add: { frequency: 440, duration: 0.1 },
            complete: { frequency: 880, duration: 0.15 },
            delete: { frequency: 220, duration: 0.1 },
            pomodoro: { frequency: 660, duration: 0.3 }
        };
        
        // Audio Context (will be initialized on first user interaction)
        this.audioContext = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.bindElements();
        this.bindEvents();
        this.render();
        this.updateStats();
        this.updateProgress();
        this.updateStreak();
        this.updatePomodoroDisplay();
        this.initAudioContext();
        this.updateAnalytics();
    }
    
    bindElements() {
        // Main elements - matching HTML IDs
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.categorySelect = document.getElementById('categorySelect');
        this.dueDateInput = document.getElementById('dueDateInput');
        this.dueTimeInput = document.getElementById('timeInput');
        this.endTimeInput = document.getElementById('endTimeInput');
        this.addBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        
        // Stats - matching HTML IDs
        this.totalCount = document.getElementById('statTotal');
        this.activeCount = document.getElementById('statActive');
        this.completedCount = document.getElementById('statCompleted');
        this.memoryCount = document.getElementById('statMemory');
        this.streakCount = document.getElementById('streakCount');
        
        // Progress - matching HTML IDs
        this.progressFill = document.getElementById('progressRing');
        this.progressValue = document.getElementById('progressPercent');
        
        // Sidebar
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        
        // Filters - stat circles in header
        this.filterBtns = document.querySelectorAll('.stat-circle[data-filter]');
        this.categoryItems = document.querySelectorAll('.category-item');
        
        // Search & Sort
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.sortSelect = document.getElementById('sortSelect');
        
        // Pomodoro - matching HTML IDs
        this.pomodoroDisplay = document.getElementById('pomodoroDisplay');
        this.pomodoroSlider = document.getElementById('pomoDuration');
        this.pomoStartBtn = document.getElementById('pomoStart');
        this.pomoPauseBtn = document.getElementById('pomoPause');
        this.pomoResetBtn = document.getElementById('pomoReset');
        
        // GIF Elements
        this.motivationGif = document.getElementById('motivationGif');
        this.gifCaption = document.getElementById('gifCaption');
        this.gifPopup = document.getElementById('gifPopup');
        
        // Modals
        this.editModal = document.getElementById('editModal');
    }
    
    bindEvents() {
        // Add task
        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => this.addTask());
        }
        if (this.taskInput) {
            this.taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTask();
            });
        }
        
        // Track manual dropdown changes
        if (this.prioritySelect) {
            this.prioritySelect.addEventListener('change', () => {
                this.priorityManuallySelected = true;
            });
        }
        if (this.categorySelect) {
            this.categorySelect.addEventListener('change', () => {
                this.categoryManuallySelected = true;
            });
        }
        if (this.dueDateInput) {
            this.dueDateInput.addEventListener('change', () => {
                this.dateManuallySelected = true;
            });
        }
        if (this.dueTimeInput) {
            this.dueTimeInput.addEventListener('change', () => {
                this.timeManuallySelected = true;
            });
        }
        if (this.endTimeInput) {
            this.endTimeInput.addEventListener('change', () => {
                this.endTimeManuallySelected = true;
            });
        }
        
        // Sidebar toggle - now outside sidebar
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => {
                this.sidebar.classList.toggle('collapsed');
                // Update toggle position
                this.updateTogglePosition();
            });
        }
        
        // Sort dropdown
        const sortSelect = document.getElementById('sortSelect');
        const sortLabel = document.getElementById('sortLabel');
        if (sortSelect && sortLabel) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                const selectedOption = sortSelect.options[sortSelect.selectedIndex];
                sortLabel.textContent = selectedOption.text.split(' ')[0];
                this.render();
            });
        }
        
        // Filters
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });
        
        // Categories
        this.categoryItems.forEach(item => {
            item.addEventListener('click', () => this.setCategory(item.dataset.category));
        });
        
        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.clearSearchBtn.style.display = this.searchQuery ? 'flex' : 'none';
                this.render();
            });
        }
        if (this.clearSearchBtn) {
            this.clearSearchBtn.addEventListener('click', () => {
                this.searchInput.value = '';
                this.searchQuery = '';
                this.clearSearchBtn.style.display = 'none';
                this.render();
            });
        }
        
        // Sort
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.render();
            });
        }
        
        // Pomodoro
        if (this.pomoStartBtn) {
            this.pomoStartBtn.addEventListener('click', () => this.startPomodoro());
        }
        if (this.pomoPauseBtn) {
            this.pomoPauseBtn.addEventListener('click', () => this.pausePomodoro());
        }
        if (this.pomoResetBtn) {
            this.pomoResetBtn.addEventListener('click', () => this.resetPomodoro());
        }
        if (this.pomodoroSlider) {
            this.pomodoroSlider.addEventListener('input', (e) => {
                this.pomodoroTime = parseInt(e.target.value);
                this.pomodoroRemaining = this.pomodoroTime * 60;
                this.updatePomodoroDisplay();
                const pomoMinutes = document.getElementById('pomoMinutes');
                if (pomoMinutes) pomoMinutes.textContent = this.pomodoroTime;
            });
        }
        
        // Quick actions - matching HTML IDs
        const stampedeBtn = document.getElementById('stampedeModeBtn');
        if (stampedeBtn) stampedeBtn.addEventListener('click', () => this.stampede());
        
        const clearCompletedBtn = document.getElementById('clearCompletedBtn');
        if (clearCompletedBtn) clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportTasks());
        
        const importBtn = document.getElementById('importBtn');
        if (importBtn) importBtn.addEventListener('click', () => document.getElementById('importFile').click());
        
        const importFile = document.getElementById('importFile');
        if (importFile) importFile.addEventListener('change', (e) => this.importTasks(e));
        
        // Bulk actions - matching HTML IDs
        const selectAllBtn = document.getElementById('selectAllBtn');
        if (selectAllBtn) selectAllBtn.addEventListener('click', () => this.selectAll());
        
        const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        if (deleteSelectedBtn) deleteSelectedBtn.addEventListener('click', () => this.deleteSelected());
        
        // Modals
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeModals();
            });
        });
        
        // Edit form
        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEdit();
            });
        }
        const cancelEdit = document.getElementById('cancelEdit');
        if (cancelEdit) cancelEdit.addEventListener('click', () => this.closeModals());
        
        // GIF Popup close
        const closeGifPopup = document.getElementById('closeGifPopup');
        if (closeGifPopup) closeGifPopup.addEventListener('click', () => this.closeGifPopup());
        
        // Click on GIF popup overlay to close
        if (this.gifPopup) {
            this.gifPopup.addEventListener('click', (e) => {
                if (e.target === this.gifPopup) this.closeGifPopup();
            });
        }
    }
    
    // Task Management
    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) {
            this.showToast('Please enter a task!', 'warning');
            return;
        }
        
        // NLP-style parsing
        const parsed = this.parseTaskText(text);
        
        const task = {
            id: Date.now().toString(),
            name: parsed.name,
            priority: this.priorityManuallySelected ? this.prioritySelect.value : parsed.priority,
            category: this.categoryManuallySelected ? this.categorySelect.value : parsed.category,
            dueDate: this.dateManuallySelected ? this.dueDateInput.value : parsed.dueDate,
            dueTime: this.timeManuallySelected ? (this.dueTimeInput && this.dueTimeInput.value) : parsed.dueTime,
            endTime: this.endTimeManuallySelected ? (this.endTimeInput && this.endTimeInput.value) : (parsed.endTime || ''),
            completed: false,
            remembered: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.saveToStorage();
        this.render();
        this.updateStats();
        this.updateProgress();
        this.clearInputs();
        this.playSound('add');
        this.showToast('Task added! 🐘', 'success');
    }
    
    parseTaskText(text) {
        let name = text;
        let priority = 'Low';  // Default is Low (no exclamation)
        let category = 'General';
        let dueDate = '';
        let dueTime = '';
        let endTime = '';
        
        // Priority detection: !! or !!! = High, ! = Medium, no ! = Low
        if (/!{2,}|\b(urgent|asap|critical|high)\b/i.test(text)) {
            priority = 'High';
        } else if (/!{1}|\b(important|medium)\b/i.test(text)) {
            priority = 'Medium';
        } else if (/\b(low|whenever|someday)\b/i.test(text)) {
            priority = 'Low';
        }
        // If no priority indicator found, stays as 'Low' (default)
        
        // Category detection with word boundaries
        const categories = {
            'Work': /\b(work|office|meeting|project|deadline|client|boss|presentation|standup|sync|review)\b/i,
            'Personal': /\b(personal|home|family|friend|birthday|gift|party)\b/i,
            'Health': /\b(health|gym|workout|exercise|doctor|medicine|diet|yoga|fitness)\b/i,
            'Learning': /\b(learn|study|course|tutorial|practice|training)\b/i,
            'Finance': /\b(finance|money|pay|bill|bank|invest|budget|tax|salary)\b/i
        };
        
        for (const [cat, regex] of Object.entries(categories)) {
            if (regex.test(text)) {
                category = cat;
                break;
            }
        }
        
        // Date detection
        const today = new Date();
        if (/\btoday\b/i.test(text)) {
            dueDate = today.toISOString().split('T')[0];
        } else if (/\btomorrow\b/i.test(text)) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dueDate = tomorrow.toISOString().split('T')[0];
        } else if (/\bnext\s+week\b/i.test(text)) {
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            dueDate = nextWeek.toISOString().split('T')[0];
        }
        
        // Time range detection: "3pm to 4pm" or "3:00pm - 4:30pm" or "at 3pm to 4pm"
        const timeRangeRegex = /(?:@|at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|-)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
        const rangeMatch = text.match(timeRangeRegex);
        
        if (rangeMatch) {
            // Start time
            let startHours = parseInt(rangeMatch[1]);
            const startMinutes = rangeMatch[2] ? parseInt(rangeMatch[2]) : 0;
            const startPeriod = rangeMatch[3];
            
            // End time
            let endHours = parseInt(rangeMatch[4]);
            const endMinutes = rangeMatch[5] ? parseInt(rangeMatch[5]) : 0;
            const endPeriod = rangeMatch[6];
            
            // Infer AM/PM if only end has it (e.g., "3 to 4pm" means 3pm to 4pm)
            const inferredPeriod = endPeriod || startPeriod;
            
            if (startPeriod) {
                if (startPeriod.toLowerCase() === 'pm' && startHours !== 12) startHours += 12;
                if (startPeriod.toLowerCase() === 'am' && startHours === 12) startHours = 0;
            } else if (inferredPeriod) {
                if (inferredPeriod.toLowerCase() === 'pm' && startHours !== 12) startHours += 12;
                if (inferredPeriod.toLowerCase() === 'am' && startHours === 12) startHours = 0;
            }
            
            if (endPeriod) {
                if (endPeriod.toLowerCase() === 'pm' && endHours !== 12) endHours += 12;
                if (endPeriod.toLowerCase() === 'am' && endHours === 12) endHours = 0;
            } else if (inferredPeriod) {
                if (inferredPeriod.toLowerCase() === 'pm' && endHours !== 12) endHours += 12;
                if (inferredPeriod.toLowerCase() === 'am' && endHours === 12) endHours = 0;
            }
            
            dueTime = `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
            endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        } else {
            // Single time detection
            const singleTimeRegex = /(?:@|at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
            const singleMatch = text.match(singleTimeRegex);
            
            if (singleMatch) {
                let hours = parseInt(singleMatch[1]);
                const minutes = singleMatch[2] ? parseInt(singleMatch[2]) : 0;
                const period = singleMatch[3];
                
                if (period.toLowerCase() === 'pm' && hours !== 12) hours += 12;
                if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
                
                dueTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                
                // Default: add 30 minutes for end time
                const startDate = new Date();
                startDate.setHours(hours, minutes, 0, 0);
                startDate.setMinutes(startDate.getMinutes() + 30);
                endTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
            }
        }
        
        // Clean up name: remove detected patterns
        name = name.replace(/!{1,3}/g, '');
        name = name.replace(/\b(urgent|asap|critical|important|high|medium|low|whenever|someday)\b/gi, '');
        name = name.replace(/\b(work|office|meeting|project|deadline|client|boss|presentation|standup|sync|review)\b/gi, '');
        name = name.replace(/\b(personal|home|family|friend|birthday|gift|party)\b/gi, '');
        name = name.replace(/\b(health|gym|workout|exercise|doctor|medicine|diet|yoga|fitness)\b/gi, '');
        name = name.replace(/\b(learn|study|course|tutorial|practice|training)\b/gi, '');
        name = name.replace(/\b(finance|money|pay|bill|bank|invest|budget|tax|salary)\b/gi, '');
        name = name.replace(/\b(today|tomorrow|next\s+week)\b/gi, '');
        // Remove time patterns including ranges
        name = name.replace(/(?:@|at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*(?:to|-)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi, '');
        name = name.replace(/(?:@|at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi, '');
        name = name.replace(/\b(general)\b/gi, '');
        name = name.replace(/\s+/g, ' ').trim();
        
        // Capitalize first letter
        if (name) {
            name = name.charAt(0).toUpperCase() + name.slice(1);
        }
        
        return { name, priority, category, dueDate, dueTime, endTime };
    }
    
    toggleComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            if (task.completed) {
                task.completedAt = new Date().toISOString();
                this.playSound('complete');
                this.fireConfetti();
                this.updateGif(true);
                this.updateStreak();
                this.showToast('Great job! Task completed! 🎉', 'success');
            }
            this.saveToStorage();
            this.render();
            this.updateStats();
            this.updateProgress();
        }
    }
    
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveToStorage();
        this.render();
        this.updateStats();
        this.updateProgress();
        this.playSound('delete');
        this.showToast('Task deleted', 'info');
    }
    
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editingTaskId = id;
            document.getElementById('editTaskId').value = id;
            document.getElementById('editTaskName').value = task.name;
            document.getElementById('editPriority').value = task.priority;
            document.getElementById('editCategory').value = task.category;
            document.getElementById('editDueDate').value = task.dueDate || '';
            document.getElementById('editTime').value = task.dueTime || '';
            const editEndTime = document.getElementById('editEndTime');
            if (editEndTime) editEndTime.value = task.endTime || '';
            this.openModal(this.editModal);
        }
    }
    
    saveEdit() {
        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.name = document.getElementById('editTaskName').value.trim();
            task.priority = document.getElementById('editPriority').value;
            task.category = document.getElementById('editCategory').value;
            task.dueDate = document.getElementById('editDueDate').value;
            task.dueTime = document.getElementById('editTime').value;
            const editEndTime = document.getElementById('editEndTime');
            if (editEndTime) task.endTime = editEndTime.value;
            this.saveToStorage();
            this.render();
            this.closeModals();
            this.showToast('Task updated! 📝', 'success');
        }
    }
    
    toggleRemember(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.remembered = !task.remembered;
            this.saveToStorage();
            this.render();
            this.updateStats();
            this.showToast(task.remembered ? 'Elephant will remember! 🐘' : 'Memory cleared', 'info');
        }
    }
    
    // Filtering & Sorting
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }
    
    setCategory(category) {
        this.currentCategory = category;
        this.categoryItems.forEach(item => {
            item.classList.toggle('active', item.dataset.category === category);
        });
        this.render();
    }
    
    getFilteredTasks() {
        let filtered = [...this.tasks];
        
        // Status filter
        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
            case 'today':
                const today = new Date().toISOString().split('T')[0];
                filtered = filtered.filter(t => t.dueDate === today);
                break;
            case 'overdue':
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];
                filtered = filtered.filter(t => {
                    if (!t.dueDate || t.completed) return false;
                    if (t.dueDate < todayStr) return true;
                    if (t.dueDate === todayStr) {
                        if (t.endTime) {
                            const [endHours, endMinutes] = t.endTime.split(':').map(Number);
                            const endDateTime = new Date(now);
                            endDateTime.setHours(endHours, endMinutes, 0, 0);
                            return now > endDateTime;
                        } else if (t.dueTime) {
                            const [dueHours, dueMinutes] = t.dueTime.split(':').map(Number);
                            const dueDateTime = new Date(now);
                            dueDateTime.setHours(dueHours, dueMinutes, 0, 0);
                            return now > dueDateTime;
                        }
                    }
                    return false;
                });
                break;
            case 'remembered':
                filtered = filtered.filter(t => t.remembered);
                break;
        }
        
        // Category filter
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(t => t.category === this.currentCategory);
        }
        
        // Search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(t => 
                t.name.toLowerCase().includes(query) ||
                t.category.toLowerCase().includes(query)
            );
        }
        
        // Sort
        filtered.sort((a, b) => {
            switch (this.sortBy) {
                case 'priority':
                    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'dueDate':
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'alphabetical':
                    return a.name.localeCompare(b.name);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                default: // newest
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
        
        return filtered;
    }
    
    // Rendering
    render() {
        const tasks = this.getFilteredTasks();
        
        if (tasks.length === 0) {
            this.taskList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🐘</div>
                    <h3>No tasks found</h3>
                    <p>${this.tasks.length === 0 ? 'Start by adding your first task!' : 'Try adjusting your filters'}</p>
                </div>
            `;
            return;
        }
        
        this.taskList.innerHTML = tasks.map(task => this.renderTask(task)).join('');
        
        // Bind task events
        this.taskList.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleComplete(checkbox.closest('.task-item').dataset.id);
            });
        });
        
        this.taskList.querySelectorAll('.task-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editTask(btn.closest('.task-item').dataset.id);
            });
        });
        
        this.taskList.querySelectorAll('.task-action-btn.remember').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleRemember(btn.closest('.task-item').dataset.id);
            });
        });
        
        this.taskList.querySelectorAll('.task-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTask(btn.closest('.task-item').dataset.id);
            });
        });
        
        this.taskList.querySelectorAll('.task-select').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = checkbox.closest('.task-item').dataset.id;
                if (e.target.checked) {
                    this.selectedTasks.add(id);
                } else {
                    this.selectedTasks.delete(id);
                }
            });
        });
        
        // Update filter counts
        this.updateFilterCounts();
        
        // Update analytics
        this.updateAnalytics();
    }
    
    renderTask(task) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Check overdue considering both date and time
        let isOverdue = false;
        if (task.dueDate && !task.completed) {
            if (task.dueDate < today) {
                isOverdue = true;
            } else if (task.dueDate === today && task.endTime) {
                // If it's today, check if end time has passed
                const [endHours, endMinutes] = task.endTime.split(':').map(Number);
                const endDateTime = new Date(now);
                endDateTime.setHours(endHours, endMinutes, 0, 0);
                if (now > endDateTime) {
                    isOverdue = true;
                }
            } else if (task.dueDate === today && task.dueTime && !task.endTime) {
                // If only start time, check if it has passed
                const [dueHours, dueMinutes] = task.dueTime.split(':').map(Number);
                const dueDateTime = new Date(now);
                dueDateTime.setHours(dueHours, dueMinutes, 0, 0);
                if (now > dueDateTime) {
                    isOverdue = true;
                }
            }
        }
        const isToday = task.dueDate === today;
        
        let dueBadge = '';
        if (task.dueDate) {
            const dueClass = isOverdue ? 'overdue' : (isToday ? 'today' : '');
            const dueText = isOverdue ? 'Overdue' : (isToday ? 'Today' : this.formatDate(task.dueDate));
            dueBadge = `<span class="task-badge due ${dueClass}"><i class="fas fa-calendar"></i> ${dueText}</span>`;
        }
        
        // Time and duration badge
        let timeBadge = '';
        if (task.dueTime) {
            if (task.endTime) {
                const duration = this.calculateDuration(task.dueTime, task.endTime);
                timeBadge = `<span class="task-badge time"><i class="fas fa-clock"></i> ${this.formatTime12h(task.dueTime)} - ${this.formatTime12h(task.endTime)}</span>
                             <span class="task-badge duration"><i class="fas fa-hourglass-half"></i> ${duration}</span>`;
            } else {
                timeBadge = `<span class="task-badge time"><i class="fas fa-clock"></i> ${this.formatTime12h(task.dueTime)}</span>`;
            }
        }

        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}" data-priority="${task.priority}">
                <input type="checkbox" class="task-select" ${this.selectedTasks.has(task.id) ? 'checked' : ''}>
                <div class="task-checkbox ${task.completed ? 'checked' : ''}">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <div class="task-name">${this.escapeHtml(task.name)}</div>
                    <div class="task-meta">
                        <span class="task-badge category" data-category="${task.category}">${task.category}</span>
                        <span class="task-badge priority">${task.priority}</span>
                        ${dueBadge}
                        ${timeBadge}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="task-action-btn remember ${task.remembered ? 'active' : ''}" title="Remember"><i class="fas fa-brain"></i></button>
                    <button class="task-action-btn delete" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }
    
    // Statistics
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        const remembered = this.tasks.filter(t => t.remembered).length;
        
        if (this.totalCount) this.totalCount.textContent = total;
        if (this.activeCount) this.activeCount.textContent = active;
        if (this.completedCount) this.completedCount.textContent = completed;
        if (this.memoryCount) this.memoryCount.textContent = remembered;
    }
    
    updateProgress() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Update ring
        if (this.progressFill) {
            const circumference = 2 * Math.PI * 52;
            const offset = circumference - (percentage / 100) * circumference;
            this.progressFill.style.strokeDashoffset = offset;
        }
        
        // Update text
        if (this.progressValue) this.progressValue.textContent = `${percentage}%`;
    }
    
    updateFilterCounts() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        const setCount = (selector, count) => {
            const el = document.querySelector(selector);
            if (el) el.textContent = count;
        };
        
        // Helper to check if task is overdue (considering time)
        const isTaskOverdue = (task) => {
            if (!task.dueDate || task.completed) return false;
            if (task.dueDate < today) return true;
            if (task.dueDate === today) {
                if (task.endTime) {
                    const [endHours, endMinutes] = task.endTime.split(':').map(Number);
                    const endDateTime = new Date(now);
                    endDateTime.setHours(endHours, endMinutes, 0, 0);
                    return now > endDateTime;
                } else if (task.dueTime) {
                    const [dueHours, dueMinutes] = task.dueTime.split(':').map(Number);
                    const dueDateTime = new Date(now);
                    dueDateTime.setHours(dueHours, dueMinutes, 0, 0);
                    return now > dueDateTime;
                }
            }
            return false;
        };
        
        setCount('[data-filter="all"] .filter-count', this.tasks.length);
        setCount('[data-filter="active"] .filter-count', this.tasks.filter(t => !t.completed).length);
        setCount('[data-filter="completed"] .filter-count', this.tasks.filter(t => t.completed).length);
        setCount('[data-filter="today"] .filter-count', this.tasks.filter(t => t.dueDate === today).length);
        setCount('[data-filter="overdue"] .filter-count', this.tasks.filter(t => isTaskOverdue(t)).length);
        setCount('[data-filter="remembered"] .filter-count', this.tasks.filter(t => t.remembered).length);
        
        // Category counts
        const categories = ['Work', 'Personal', 'Health', 'Learning', 'Finance'];
        categories.forEach(cat => {
            const count = this.tasks.filter(t => t.category === cat).length;
            setCount(`[data-category="${cat}"] .category-count`, count);
        });
        
        // All category count
        setCount('[data-category="all"] .category-count', this.tasks.length);
    }
    
    // Analytics - Jira Style
    updateAnalytics() {
        // Priority breakdown
        const highCount = this.tasks.filter(t => t.priority === 'High' && !t.completed).length;
        const mediumCount = this.tasks.filter(t => t.priority === 'Medium' && !t.completed).length;
        const lowCount = this.tasks.filter(t => t.priority === 'Low' && !t.completed).length;
        const totalActive = highCount + mediumCount + lowCount || 1;
        
        const setBar = (id, count, total) => {
            const el = document.getElementById(id);
            if (el) el.style.width = `${(count / total) * 100}%`;
        };
        
        setBar('priorityHigh', highCount, totalActive);
        setBar('priorityMedium', mediumCount, totalActive);
        setBar('priorityLow', lowCount, totalActive);
        
        // Update counts
        const setCount = (id, count) => {
            const el = document.getElementById(id);
            if (el) el.textContent = count;
        };
        
        setCount('priorityHighCount', highCount);
        setCount('priorityMediumCount', mediumCount);
        setCount('priorityLowCount', lowCount);
        
        // Weekly activity (simulated based on completed tasks)
        this.updateWeeklyChart();
        
        // Productivity score
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const productivityRing = document.getElementById('productivityRing');
        if (productivityRing) {
            productivityRing.setAttribute('stroke-dasharray', `${productivity}, 100`);
        }
        
        const productivityScore = document.getElementById('productivityScore');
        if (productivityScore) {
            productivityScore.textContent = `${productivity}%`;
        }
        
        // Update duration stats
        this.updateDurationStats();
    }
    
    updateDurationStats() {
        // Calculate duration for each task with start and end time
        const calculateTaskDuration = (task) => {
            if (!task.dueTime || !task.endTime) return 0;
            
            const [startH, startM] = task.dueTime.split(':').map(Number);
            const [endH, endM] = task.endTime.split(':').map(Number);
            
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            
            // Handle overnight tasks
            let duration = endMinutes - startMinutes;
            if (duration < 0) duration += 24 * 60;
            
            return duration;
        };
        
        // Format minutes to hours and minutes
        const formatDuration = (minutes) => {
            if (minutes === 0) return '0m';
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            if (hours === 0) return `${mins}m`;
            if (mins === 0) return `${hours}h`;
            return `${hours}h ${mins}m`;
        };
        
        // Calculate totals
        let totalMinutes = 0;
        let completedMinutes = 0;
        let pendingMinutes = 0;
        let tasksWithDuration = 0;
        
        this.tasks.forEach(task => {
            const duration = calculateTaskDuration(task);
            if (duration > 0) {
                totalMinutes += duration;
                tasksWithDuration++;
                if (task.completed) {
                    completedMinutes += duration;
                } else {
                    pendingMinutes += duration;
                }
            }
        });
        
        const avgMinutes = tasksWithDuration > 0 ? Math.round(totalMinutes / tasksWithDuration) : 0;
        
        // Update DOM
        const totalEl = document.getElementById('totalDuration');
        const completedEl = document.getElementById('completedDuration');
        const pendingEl = document.getElementById('pendingDuration');
        const avgEl = document.getElementById('avgDuration');
        
        if (totalEl) totalEl.textContent = formatDuration(totalMinutes);
        if (completedEl) completedEl.textContent = formatDuration(completedMinutes);
        if (pendingEl) pendingEl.textContent = formatDuration(pendingMinutes);
        if (avgEl) avgEl.textContent = formatDuration(avgMinutes);
    }
    
    updateWeeklyChart() {
        // Get completion data for the last 7 days
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const weekData = {};
        
        // Initialize all days with 0
        dayNames.forEach(d => weekData[d] = 0);
        
        // Calculate completions for each day in last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = dayNames[date.getDay()];
            
            const completedOnDay = this.tasks.filter(t => 
                t.completed && t.completedAt && t.completedAt.split('T')[0] === dateStr
            ).length;
            
            weekData[dayName] = completedOnDay;
        }
        
        // Find max for scaling
        const maxCount = Math.max(...Object.values(weekData), 1);
        
        // Update bars by data-day attribute
        const bars = document.querySelectorAll('.bar-chart .bar');
        bars.forEach(bar => {
            const day = bar.dataset.day;
            if (day && weekData[day] !== undefined) {
                const height = (weekData[day] / maxCount) * 100;
                bar.style.setProperty('--height', `${Math.max(height, 5)}%`);
            }
        });
    }
    
    updateTogglePosition() {
        // This is handled by CSS now with :has() selector
        // But for browsers without :has() support, we can add a class
        const toggle = document.getElementById('sidebarToggle');
        if (toggle && this.sidebar) {
            if (this.sidebar.classList.contains('collapsed')) {
                toggle.classList.add('sidebar-collapsed');
            } else {
                toggle.classList.remove('sidebar-collapsed');
            }
        }
    }
    
    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const completedToday = this.tasks.some(t => 
            t.completed && t.completedAt && t.completedAt.split('T')[0] === today
        );
        
        if (completedToday) {
            if (this.lastCompletionDate !== today) {
                if (this.lastCompletionDate === this.getYesterday()) {
                    this.streak++;
                } else if (!this.lastCompletionDate) {
                    this.streak = 1;
                }
                this.lastCompletionDate = today;
                this.saveStreakData();
            }
        }
        
        if (this.streakCount) this.streakCount.textContent = this.streak;
    }
    
    getYesterday() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }
    
    // GIF Management - Shows as popup on completion
    updateGif(isCompletion = false) {
        const gifArray = isCompletion ? this.completionGifs : this.gifs;
        const randomGif = gifArray[Math.floor(Math.random() * gifArray.length)];
        
        if (this.motivationGif) {
            this.motivationGif.src = randomGif.url;
        }
        if (this.gifCaption) {
            this.gifCaption.textContent = randomGif.caption;
        }
        
        // Show popup only on task completion
        if (isCompletion && this.gifPopup) {
            this.gifPopup.classList.add('active');
            
            // Auto-close after 4 seconds
            setTimeout(() => {
                this.closeGifPopup();
            }, 4000);
        }
    }
    
    closeGifPopup() {
        if (this.gifPopup) {
            this.gifPopup.classList.remove('active');
        }
    }
    
    // Pomodoro Timer
    startPomodoro() {
        if (this.pomodoroRunning) return;
        this.pomodoroRunning = true;
        
        // Toggle button visibility
        if (this.pomoStartBtn) this.pomoStartBtn.style.display = 'none';
        if (this.pomoPauseBtn) this.pomoPauseBtn.style.display = 'flex';
        
        this.pomodoroInterval = setInterval(() => {
            this.pomodoroRemaining--;
            this.updatePomodoroDisplay();
            
            if (this.pomodoroRemaining <= 0) {
                this.pausePomodoro();
                this.playSound('pomodoro');
                this.fireConfetti();
                this.showToast('Pomodoro complete! Take a break! 🍅', 'success');
                this.resetPomodoro();
            }
        }, 1000);
    }
    
    pausePomodoro() {
        this.pomodoroRunning = false;
        
        // Toggle button visibility
        if (this.pomoStartBtn) this.pomoStartBtn.style.display = 'flex';
        if (this.pomoPauseBtn) this.pomoPauseBtn.style.display = 'none';
        
        if (this.pomodoroInterval) {
            clearInterval(this.pomodoroInterval);
            this.pomodoroInterval = null;
        }
    }
    
    resetPomodoro() {
        this.pausePomodoro();
        this.pomodoroRemaining = this.pomodoroTime * 60;
        this.updatePomodoroDisplay();
    }
    
    updatePomodoroDisplay() {
        const minutes = Math.floor(this.pomodoroRemaining / 60);
        const seconds = this.pomodoroRemaining % 60;
        if (this.pomodoroDisplay) {
            this.pomodoroDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    // Quick Actions
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showToast('No completed tasks to clear', 'warning');
            return;
        }
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveToStorage();
        this.render();
        this.updateStats();
        this.updateProgress();
        this.showToast(`Cleared ${completedCount} completed tasks! 🧹`, 'success');
    }
    
    stampede() {
        const activeTasks = this.tasks.filter(t => !t.completed);
        if (activeTasks.length === 0) {
            this.showToast('No active tasks for stampede!', 'warning');
            return;
        }
        
        activeTasks.forEach(task => {
            task.completed = true;
            task.completedAt = new Date().toISOString();
        });
        
        this.saveToStorage();
        this.render();
        this.updateStats();
        this.updateProgress();
        this.updateStreak();
        
        // Epic celebration
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.fireConfetti(), i * 200);
        }
        
        this.playSound('complete');
        this.updateGif(true);
        this.showToast(`🐘💨 STAMPEDE! ${activeTasks.length} tasks crushed!`, 'success');
    }
    
    exportTasks() {
        const data = JSON.stringify(this.tasks, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tusk-tasks.json';
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Tasks exported! 📦', 'success');
    }
    
    importTasks(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    this.tasks = [...imported, ...this.tasks];
                    this.saveToStorage();
                    this.render();
                    this.updateStats();
                    this.updateProgress();
                    this.showToast(`Imported ${imported.length} tasks! 📥`, 'success');
                }
            } catch (err) {
                this.showToast('Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }
    
    // Bulk Actions
    selectAll() {
        const tasks = this.getFilteredTasks();
        const allSelected = tasks.every(t => this.selectedTasks.has(t.id));
        
        if (allSelected) {
            this.selectedTasks.clear();
        } else {
            tasks.forEach(t => this.selectedTasks.add(t.id));
        }
        
        this.render();
    }
    
    deleteSelected() {
        if (this.selectedTasks.size === 0) {
            this.showToast('No tasks selected', 'warning');
            return;
        }
        
        const count = this.selectedTasks.size;
        this.tasks = this.tasks.filter(t => !this.selectedTasks.has(t.id));
        this.selectedTasks.clear();
        this.saveToStorage();
        this.render();
        this.updateStats();
        this.updateProgress();
        this.playSound('delete');
        this.showToast(`Deleted ${count} tasks`, 'info');
    }
    
    // Sound - Fixed AudioContext for browser autoplay policy
    initAudioContext() {
        // Initialize AudioContext on first user interaction
        const initAudio = () => {
            if (!this.audioContext) {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) {
                    console.log('AudioContext not supported');
                }
            }
            // Resume if suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            // Remove listeners after first interaction
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
        };
        
        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        try {
            // Initialize AudioContext if not exists
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Resume if suspended (required by browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = this.sounds[type].frequency;
            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + this.sounds[type].duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + this.sounds[type].duration);
        } catch (e) {
            // Audio not supported
            console.log('Audio playback error:', e);
        }
    }
    
    // Confetti
    fireConfetti() {
        const canvas = document.getElementById('confettiCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const confetti = [];
        const colors = ['#0d9488', '#f97316', '#fbbf24', '#10b981', '#3b82f6', '#8b5cf6'];
        
        for (let i = 0; i < 100; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: -20,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: (Math.random() - 0.5) * 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
        
        let frame = 0;
        const maxFrames = 150;
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            confetti.forEach(c => {
                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate((c.rotation * Math.PI) / 180);
                ctx.fillStyle = c.color;
                ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
                ctx.restore();
                
                c.y += c.speedY;
                c.x += c.speedX;
                c.rotation += c.rotationSpeed;
                c.speedY += 0.1;
            });
            
            frame++;
            if (frame < maxFrames) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };
        
        animate();
    }
    
    // Modals
    openModal(modal) {
        if (modal) modal.classList.add('active');
    }
    
    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        this.editingTaskId = null;
    }
    
    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'times-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas fa-${icons[type]} toast-icon"></i>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }
    
    // Storage
    saveToStorage() {
        const data = {
            tasks: this.tasks,
            soundEnabled: this.soundEnabled
        };
        localStorage.setItem('tuskApp', JSON.stringify(data));
    }
    
    loadFromStorage() {
        const data = JSON.parse(localStorage.getItem('tuskApp') || '{}');
        this.tasks = data.tasks || [];
        this.soundEnabled = data.soundEnabled !== false;

        // Load demo tasks if no tasks in localStorage
        if (this.tasks.length === 0) {
            this.loadDemoTasks();
        }

        this.loadStreakData();
    }
    
    loadDemoTasks() {
        fetch('demo-tasks.json')
            .then(response => response.json())
            .then(demoTasks => {
                this.tasks = demoTasks;
                this.saveToStorage();
                this.render();
                this.updateStats();
                this.updateProgress();
            })
            .catch(error => {
                console.log('Error loading demo tasks:', error);
            });
    }

    saveStreakData() {
        const streakData = {
            streak: this.streak,
            lastCompletionDate: this.lastCompletionDate
        };
        localStorage.setItem('tuskStreak', JSON.stringify(streakData));
    }
    
    loadStreakData() {
        const data = JSON.parse(localStorage.getItem('tuskStreak') || '{}');
        this.streak = data.streak || 0;
        this.lastCompletionDate = data.lastCompletionDate || null;
        
        // Check if streak should reset
        const today = new Date().toISOString().split('T')[0];
        const yesterday = this.getYesterday();
        
        if (this.lastCompletionDate && 
            this.lastCompletionDate !== today && 
            this.lastCompletionDate !== yesterday) {
            this.streak = 0;
            this.saveStreakData();
        }
    }
    
    // Utilities
    clearInputs() {
        if (this.taskInput) this.taskInput.value = '';
        if (this.prioritySelect) this.prioritySelect.selectedIndex = 1; // Medium
        if (this.categorySelect) this.categorySelect.selectedIndex = 0;
        if (this.dueDateInput) this.dueDateInput.value = '';
        if (this.dueTimeInput) this.dueTimeInput.value = '';
        if (this.endTimeInput) this.endTimeInput.value = '';
        
        // Reset manual selection flags
        this.priorityManuallySelected = false;
        this.categoryManuallySelected = false;
        this.dateManuallySelected = false;
        this.timeManuallySelected = false;
        this.endTimeManuallySelected = false;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    formatTime12h(time24) {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    }
    
    calculateDuration(startTime, endTime) {
        if (!startTime || !endTime) return '';
        
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        
        let startMinutes = startH * 60 + startM;
        let endMinutes = endH * 60 + endM;
        
        // Handle overnight meetings (e.g., 11PM to 1AM)
        if (endMinutes < startMinutes) {
            endMinutes += 24 * 60;
        }
        
        const diffMinutes = endMinutes - startMinutes;
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        
        if (hours === 0) {
            return `${mins}m`;
        } else if (mins === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${mins}m`;
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tuskApp = new TuskApp();
});
