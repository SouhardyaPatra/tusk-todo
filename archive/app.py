# ============================================================
# TUSK - Smart Task Manager
# A Streamlit-based intelligent task management application
# ============================================================

# ============================================================
# SECTION 1: IMPORTS
# ============================================================
import streamlit as st
import pandas as pd
from datetime import datetime, date, time, timedelta
import uuid
import json
import os
import re
from collections import defaultdict


# ============================================================
# SECTION 2: PAGE CONFIGURATION
# ============================================================
st.set_page_config(
    page_title="TUSK - Smart Task Manager",
    page_icon="🐘",
    layout="wide",
    initial_sidebar_state="collapsed"
)


# ============================================================
# SECTION 3: CONSTANTS
# ============================================================
DATA_FILE = "tasks_data.json"
TEMPLATES_FILE = "task_templates.json"

CATEGORY_COLORS = {
    'Work': '#3b82f6',
    'Personal': '#8b5cf6',
    'Health': '#10b981',
    'Learning': '#f59e0b',
    'Finance': '#ef4444',
    'General': '#6b7280'
}

PRIORITY_ORDER = {"High": 1, "Medium": 2, "Low": 3}
PRIORITY_ICONS = {"High": "🔴", "Medium": "🟡", "Low": "🟢"}

CATEGORIES = ["General", "Work", "Personal", "Health", "Learning", "Finance"]

CATEGORY_KEYWORDS = {
    'Work': ['work', 'meeting', 'project', 'client', 'email', 'call', 'presentation', 'office'],
    'Personal': ['personal', 'home', 'family', 'friend', 'birthday', 'party'],
    'Health': ['health', 'gym', 'exercise', 'workout', 'doctor', 'medical', 'run', 'yoga'],
    'Learning': ['learn', 'study', 'course', 'read', 'book', 'tutorial', 'class'],
    'Finance': ['finance', 'budget', 'pay', 'bill', 'invoice', 'money', 'bank', 'tax']
}

# Funny GIFs for different states
GIFS = {
    'empty_active': 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
    'empty_upcoming': 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'empty_done': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
    'empty_analytics': 'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif',
    'celebrate_high': 'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
    'celebrate_medium': 'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif',
    'motivate_low': 'https://media.giphy.com/media/ACcXRXwUqJ6Ok/giphy.gif',
    'pomodoro_focus': 'https://media.giphy.com/media/IPbS5R4fSUl5S/giphy.gif',
    'pomodoro_break': 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
}


# ============================================================
# SECTION 4: DATA PERSISTENCE FUNCTIONS
# ============================================================
def load_tasks():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []


def save_tasks(tasks):
    with open(DATA_FILE, 'w') as f:
        json.dump(tasks, f, indent=2)


def load_templates():
    if os.path.exists(TEMPLATES_FILE):
        try:
            with open(TEMPLATES_FILE, 'r') as f:
                return json.load(f)
        except:
            return get_default_templates()
    return get_default_templates()


def get_default_templates():
    return {
        "Morning Routine": {
            "tasks": ["Exercise", "Healthy breakfast", "Plan the day"],
            "category": "Health", "priority": "Medium", "duration": 0.5
        },
        "Weekly Review": {
            "tasks": ["Review completed tasks", "Plan next week", "Update goals"],
            "category": "Personal", "priority": "Medium", "duration": 1
        },
        "Project Kickoff": {
            "tasks": ["Define scope", "Assign roles", "Set milestones", "Schedule meetings"],
            "category": "Work", "priority": "High", "duration": 1
        },
        "Study Session": {
            "tasks": ["Review materials", "Practice exercises", "Take notes"],
            "category": "Learning", "priority": "Medium", "duration": 1.5
        }
    }


def export_data():
    return {
        "tasks": st.session_state.tasks,
        "export_date": datetime.now().isoformat(),
        "version": "2.0"
    }


def import_data(data):
    try:
        if isinstance(data, dict) and 'tasks' in data:
            st.session_state.tasks = data['tasks']
            save_tasks(st.session_state.tasks)
            return True, f"✅ Imported {len(data['tasks'])} tasks!"
        return False, "Invalid data format"
    except Exception as e:
        return False, f"Import failed: {str(e)}"


# ============================================================
# SECTION 5: HELPER FUNCTIONS
# ============================================================
def get_category_color(category):
    return CATEGORY_COLORS.get(category, '#6b7280')


def is_task_active(task):
    task_datetime = datetime.strptime(f"{task['scheduled_date']} {task['start_time']}", "%Y-%m-%d %H:%M")
    return task_datetime <= datetime.now()


def is_task_future(task):
    task_datetime = datetime.strptime(f"{task['scheduled_date']} {task['start_time']}", "%Y-%m-%d %H:%M")
    return task_datetime > datetime.now()


def is_task_overdue(task):
    task_end = datetime.strptime(f"{task['scheduled_date']} {task['end_time']}", "%Y-%m-%d %H:%M")
    return task_end < datetime.now()


def get_pomodoro_time_remaining():
    if st.session_state.pomodoro_active and st.session_state.pomodoro_start_time:
        elapsed = (datetime.now() - st.session_state.pomodoro_start_time).total_seconds() / 60
        return max(0, st.session_state.pomodoro_duration - elapsed)
    return 0


def search_tasks(tasks, query):
    """Case-insensitive search in task name and category"""
    if not query:
        return tasks
    query_lower = query.lower()
    return [t for t in tasks if 
            query_lower in t['task'].lower() or 
            query_lower in t.get('category', 'General').lower()]


# ============================================================
# SECTION 6: NATURAL LANGUAGE PARSER
# ============================================================
def parse_natural_language(text):
    parsed = {
        'task': text,
        'priority': 'Medium',
        'category': 'General',
        'scheduled_date': date.today(),
        'start_time': datetime.now().time(),
        'end_time': (datetime.now() + timedelta(hours=1)).time()
    }
    
    text_lower = text.lower()
    
    # Priority detection
    if any(word in text_lower for word in ['urgent', 'critical', 'important', 'asap', 'high']):
        parsed['priority'] = 'High'
    elif any(word in text_lower for word in ['low', 'minor', 'someday', 'whenever']):
        parsed['priority'] = 'Low'
    
    # Category detection
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in text_lower for keyword in keywords):
            parsed['category'] = category
            break
    
    # Time detection
    time_match = re.search(r'\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b', text_lower)
    if time_match:
        hour = int(time_match.group(1))
        minute = int(time_match.group(2)) if time_match.group(2) else 0
        if time_match.group(3):
            if time_match.group(3) == 'pm' and hour != 12:
                hour += 12
            elif time_match.group(3) == 'am' and hour == 12:
                hour = 0
        parsed['start_time'] = time(hour % 24, minute)
        parsed['end_time'] = (datetime.combine(date.today(), parsed['start_time']) + timedelta(hours=1)).time()
    
    # Date detection
    if 'tomorrow' in text_lower:
        parsed['scheduled_date'] = date.today() + timedelta(days=1)
    elif 'today' in text_lower:
        parsed['scheduled_date'] = date.today()
    else:
        days_match = re.search(r'\bin\s*(\d+)\s*days?\b', text_lower)
        if days_match:
            parsed['scheduled_date'] = date.today() + timedelta(days=int(days_match.group(1)))
    
    # Duration detection
    duration_match = re.search(r'\bfor\s*(\d+)\s*(?:hours?|hrs?|h)\b', text_lower)
    if duration_match:
        hours = int(duration_match.group(1))
        parsed['end_time'] = (datetime.combine(date.today(), parsed['start_time']) + timedelta(hours=hours)).time()
    
    # Clean task text
    clean_text = text
    patterns_to_remove = [
        r'\b(?:high|low|medium)\s*(?:priority)?\b',
        r'\bat\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b',
        r'\btomorrow\b', r'\btoday\b',
        r'\bfor\s*\d+\s*(?:hours?|hrs?)\b',
        r'\bin\s*\d+\s*days?\b'
    ]
    for pattern in patterns_to_remove:
        clean_text = re.sub(pattern, '', clean_text, flags=re.IGNORECASE)
    parsed['task'] = ' '.join(clean_text.split()).strip()
    
    return parsed


# ============================================================
# SECTION 7: TASK CRUD FUNCTIONS
# ============================================================
def add_task(task_name, priority, category, scheduled_date, start_time, end_time):
    if task_name:
        new_task = {
            "id": str(uuid.uuid4()),
            "task": task_name,
            "priority": priority,
            "category": category,
            "status": "pending",
            "added_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "scheduled_date": scheduled_date.isoformat(),
            "start_time": start_time.strftime("%H:%M"),
            "end_time": end_time.strftime("%H:%M"),
        }
        st.session_state.tasks.append(new_task)
        save_tasks(st.session_state.tasks)
        st.toast(f"✅ Added: {task_name}")


def complete_task(task_id):
    for task in st.session_state.tasks:
        if task['id'] == task_id:
            task['status'] = 'completed'
            task['completed_at'] = datetime.now().strftime("%Y-%m-%d %H:%M")
            save_tasks(st.session_state.tasks)
            st.balloons()
            st.toast("🎉 Task completed!")
            break


def delete_task(task_id):
    st.session_state.tasks = [t for t in st.session_state.tasks if t['id'] != task_id]
    save_tasks(st.session_state.tasks)
    st.toast("🗑️ Task deleted")


def update_task(task_id, updates):
    for task in st.session_state.tasks:
        if task['id'] == task_id:
            task.update(updates)
            save_tasks(st.session_state.tasks)
            st.toast("✏️ Task updated")
            break


def create_tasks_from_template(template_name, templates, scheduled_date):
    if template_name not in templates:
        return 0
    template = templates[template_name]
    created_count = 0
    start_time = datetime.now()
    for i, task_text in enumerate(template['tasks']):
        task_start = start_time + timedelta(hours=i * template['duration'])
        task_end = task_start + timedelta(hours=template['duration'])
        add_task(task_text, template['priority'], template['category'],
                scheduled_date, task_start.time(), task_end.time())
        created_count += 1
    return created_count


# ============================================================
# SECTION 8: ANALYTICS FUNCTIONS
# ============================================================
def calculate_analytics(tasks):
    if not tasks:
        return None
    
    completed = [t for t in tasks if t['status'] == 'completed']
    analytics = {
        'total_tasks': len(tasks),
        'completed_count': len(completed),
        'completion_rate': round((len(completed) / len(tasks)) * 100, 1) if tasks else 0,
        'by_priority': defaultdict(int),
        'by_category': defaultdict(int),
        'avg_duration': 0,
    }
    
    for task in tasks:
        analytics['by_priority'][task['priority']] += 1
        analytics['by_category'][task.get('category', 'General')] += 1
    
    durations = []
    for task in completed:
        try:
            start = datetime.strptime(f"2000-01-01 {task['start_time']}", "%Y-%m-%d %H:%M")
            end = datetime.strptime(f"2000-01-01 {task['end_time']}", "%Y-%m-%d %H:%M")
            durations.append((end - start).seconds / 3600)
        except:
            pass
    
    if durations:
        analytics['avg_duration'] = round(sum(durations) / len(durations), 1)
    
    return analytics


# ============================================================
# SECTION 9: SESSION STATE INITIALIZATION
# ============================================================
if 'tasks' not in st.session_state:
    st.session_state.tasks = load_tasks()

if 'editing_task_id' not in st.session_state:
    st.session_state.editing_task_id = None

if 'search_query' not in st.session_state:
    st.session_state.search_query = ""

if 'selected_category' not in st.session_state:
    st.session_state.selected_category = "All"

if 'pomodoro_active' not in st.session_state:
    st.session_state.pomodoro_active = False

if 'pomodoro_start_time' not in st.session_state:
    st.session_state.pomodoro_start_time = None

if 'pomodoro_duration' not in st.session_state:
    st.session_state.pomodoro_duration = 25

if 'active_tab' not in st.session_state:
    st.session_state.active_tab = 0


# ============================================================
# SECTION 10: MAIN PAGE UI
# ============================================================

# ----- HEADER -----
st.markdown("""
<div style='text-align: center; padding: 1rem 0; margin-bottom: 1rem;'>
    <h1 style='font-size: 3rem; margin: 0; color: #0ea5e9;'>🐘 TUSK</h1>
    <p style='color: #64748b; font-size: 1.1rem; margin: 0.5rem 0 0 0;'>Smart Task Manager</p>
</div>
""", unsafe_allow_html=True)

# ----- STATS ROW -----
_pending = [t for t in st.session_state.tasks if t['status'] == 'pending']
_active_count = len([t for t in _pending if is_task_active(t)])
_future_count = len([t for t in _pending if is_task_future(t)])
_done_count = len([t for t in st.session_state.tasks if t['status'] == 'completed'])
_total = len(st.session_state.tasks)
_rate = round((_done_count/_total)*100) if _total > 0 else 0

st.markdown("""
<div style='background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
            padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem;'>
</div>
""", unsafe_allow_html=True)

stat_cols = st.columns(4)
with stat_cols[0]:
    st.metric("🔥 Active", _active_count)
with stat_cols[1]:
    st.metric("⏳ Upcoming", _future_count)
with stat_cols[2]:
    st.metric("✅ Completed", _done_count)
with stat_cols[3]:
    st.metric("📊 Rate", f"{_rate}%")

st.markdown("<br>", unsafe_allow_html=True)

# ----- QUICK ADD SECTION -----
st.markdown("""
<div style='background: #f8fafc; padding: 1.5rem; border-radius: 12px; 
            border: 2px solid #e2e8f0; margin-bottom: 1rem;'>
    <h3 style='margin: 0 0 0.5rem 0; color: #0ea5e9;'>⚡ Quick Add Task</h3>
    <p style='margin: 0; color: #64748b; font-size: 0.9rem;'>
        Type naturally: "Meeting tomorrow 2pm high" or "Gym 6am health"
    </p>
</div>
""", unsafe_allow_html=True)

qa_col1, qa_col2 = st.columns([0.85, 0.15])
with qa_col1:
    quick_input = st.text_input(
        "Quick Add",
        placeholder="e.g., 'Call John tomorrow 3pm work high' or 'Pay rent finance'",
        label_visibility="collapsed",
        key="quick_add_input"
    )
with qa_col2:
    add_clicked = st.button("➕ ADD", use_container_width=True, type="primary", key="quick_add_btn")

if add_clicked and quick_input:
    parsed = parse_natural_language(quick_input)
    add_task(parsed['task'], parsed['priority'], parsed['category'],
            parsed['scheduled_date'], parsed['start_time'], parsed['end_time'])
    st.rerun()

st.markdown("<br>", unsafe_allow_html=True)

# ----- SEARCH & FILTER SECTION -----
st.markdown("""
<div style='background: #fefce8; padding: 1rem; border-radius: 12px; 
            border: 2px solid #fef08a; margin-bottom: 1rem;'>
    <h3 style='margin: 0 0 0.5rem 0; color: #ca8a04;'>🔍 Search & Filter</h3>
</div>
""", unsafe_allow_html=True)

sf_col1, sf_col2, sf_col3 = st.columns([0.5, 0.3, 0.2])

with sf_col1:
    search_input = st.text_input(
        "Search",
        value=st.session_state.search_query,
        placeholder="Search tasks by name or category...",
        label_visibility="collapsed",
        key="search_input"
    )
    st.session_state.search_query = search_input

with sf_col2:
    available_cats = ["All"] + sorted(set(t.get('category', 'General') for t in st.session_state.tasks))
    cat_idx = available_cats.index(st.session_state.selected_category) if st.session_state.selected_category in available_cats else 0
    selected_cat = st.selectbox("Category", available_cats, index=cat_idx, 
                                label_visibility="collapsed", key="cat_select")
    st.session_state.selected_category = selected_cat

with sf_col3:
    if st.button("🗑️ Clear Filters", use_container_width=True, key="clear_filters_btn"):
        st.session_state.search_query = ""
        st.session_state.selected_category = "All"
        st.rerun()

# Show active filters indicator
filters_active = st.session_state.search_query or st.session_state.selected_category != "All"
if filters_active:
    filter_text = []
    if st.session_state.search_query:
        filter_text.append(f"Search: '{st.session_state.search_query}'")
    if st.session_state.selected_category != "All":
        filter_text.append(f"Category: {st.session_state.selected_category}")
    st.markdown(f"""
    <div style='background: #fef2f2; padding: 0.5rem 1rem; border-radius: 8px; 
                border-left: 4px solid #ef4444; margin: 0.5rem 0;'>
        <span style='color: #dc2626;'>🔴 <strong>Filters Active:</strong> {' | '.join(filter_text)}</span>
    </div>
    """, unsafe_allow_html=True)

# ----- SEARCH RESULTS WITH EDIT/DELETE -----
if st.session_state.search_query:
    search_results = search_tasks(st.session_state.tasks, st.session_state.search_query)
    if search_results:
        st.markdown(f"""
        <div style='background: #f0fdf4; padding: 0.75rem 1rem; border-radius: 8px; 
                    border-left: 4px solid #22c55e; margin: 1rem 0;'>
            <strong style='color: #16a34a;'>📋 Found {len(search_results)} matching task(s)</strong>
        </div>
        """, unsafe_allow_html=True)
        
        for task in search_results[:5]:  # Show top 5 results
            p_icon = PRIORITY_ICONS.get(task['priority'], '🟡')
            cat_color = get_category_color(task.get('category', 'General'))
            status_badge = "✅" if task['status'] == 'completed' else "⏳"
            
            with st.container():
                rc1, rc2, rc3, rc4 = st.columns([0.05, 0.6, 0.15, 0.2])
                
                with rc1:
                    st.markdown(f"**{p_icon}**")
                
                with rc2:
                    st.markdown(f"**{task['task']}** {status_badge}")
                    st.markdown(f"""
                    <span style='background:{cat_color};color:white;padding:2px 8px;
                    border-radius:10px;font-size:0.75rem;'>{task.get('category', 'General')}</span>
                    <span style='color:#64748b;font-size:0.85rem;'> 📅 {task['scheduled_date']}</span>
                    """, unsafe_allow_html=True)
                
                with rc3:
                    if st.button("✏️ Edit", key=f"search_edit_{task['id']}", use_container_width=True):
                        st.session_state.editing_task_id = task['id']
                        st.rerun()
                
                with rc4:
                    if st.button("🗑️ Delete", key=f"search_del_{task['id']}", use_container_width=True):
                        delete_task(task['id'])
                        st.rerun()
                
                # Inline edit form
                if st.session_state.editing_task_id == task['id']:
                    with st.form(key=f"search_edit_form_{task['id']}"):
                        st.markdown("**✏️ Edit Task**")
                        edit_name = st.text_input("Task Name", value=task['task'])
                        
                        e_col1, e_col2 = st.columns(2)
                        with e_col1:
                            edit_pri = st.selectbox("Priority", ["Low", "Medium", "High"],
                                                   index=["Low", "Medium", "High"].index(task['priority']))
                        with e_col2:
                            edit_cat = st.selectbox("Category", CATEGORIES,
                                                   index=CATEGORIES.index(task.get('category', 'General')))
                        
                        e_col3, e_col4 = st.columns(2)
                        with e_col3:
                            edit_date = st.date_input("Date", 
                                value=datetime.strptime(task['scheduled_date'], "%Y-%m-%d").date())
                        with e_col4:
                            edit_start = st.time_input("Start Time",
                                value=datetime.strptime(task['start_time'], "%H:%M").time())
                        
                        btn_col1, btn_col2 = st.columns(2)
                        with btn_col1:
                            if st.form_submit_button("💾 Save", use_container_width=True):
                                update_task(task['id'], {
                                    'task': edit_name, 'priority': edit_pri, 'category': edit_cat,
                                    'scheduled_date': edit_date.isoformat(),
                                    'start_time': edit_start.strftime("%H:%M"),
                                })
                                st.session_state.editing_task_id = None
                                st.rerun()
                        with btn_col2:
                            if st.form_submit_button("❌ Cancel", use_container_width=True):
                                st.session_state.editing_task_id = None
                                st.rerun()
                
                st.markdown("<hr style='margin: 0.5rem 0; border: none; border-top: 1px solid #e2e8f0;'>", 
                           unsafe_allow_html=True)

st.markdown("---")

# ----- FILTER TASKS FOR TABS -----
filtered_tasks = st.session_state.tasks

if st.session_state.search_query:
    filtered_tasks = search_tasks(filtered_tasks, st.session_state.search_query)

if st.session_state.selected_category != "All":
    filtered_tasks = [t for t in filtered_tasks 
                      if t.get('category', 'General') == st.session_state.selected_category]

pending = [t for t in filtered_tasks if t['status'] == 'pending']
active_tasks = [t for t in pending if is_task_active(t)]
future_tasks = [t for t in pending if is_task_future(t)]
completed_tasks = [t for t in filtered_tasks if t['status'] == 'completed']

# ----- TAB PERSISTENCE -----
# Get active tab from query params
query_params = st.query_params
default_tab = int(query_params.get('tab', 0))

# JavaScript to select the correct tab after rerun
if default_tab > 0:
    st.markdown(f"""
    <script>
        const tabs = window.parent.document.querySelectorAll('[data-baseweb="tab"]');
        if (tabs.length > {default_tab}) {{
            tabs[{default_tab}].click();
        }}
    </script>
    """, unsafe_allow_html=True)

# ----- TABS -----
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    f"🔥 Active ({len(active_tasks)})",
    f"⏳ Upcoming ({len(future_tasks)})",
    f"✅ Done ({len(completed_tasks)})",
    "📊 Analytics",
    "⚙️ Tools"
])


# ----- TAB 1: ACTIVE TASKS -----
with tab1:
    if not active_tasks:
        col_gif, col_msg = st.columns([0.4, 0.6])
        with col_gif:
            st.image(GIFS['empty_active'], width=300)
        with col_msg:
            st.markdown("### 🎉 You're all caught up!")
            st.markdown("No active tasks right now. Time to relax!")
            st.markdown("💡 **Tip:** Use Quick Add above to create a task")
    else:
        active_sorted = sorted(active_tasks, key=lambda x: (
            not is_task_overdue(x), PRIORITY_ORDER.get(x['priority'], 4)
        ))
        
        for task in active_sorted:
            p_icon = PRIORITY_ICONS.get(task['priority'], '🟡')
            overdue_badge = "🚨 **OVERDUE**" if is_task_overdue(task) else ""
            cat_color = get_category_color(task.get('category', 'General'))
            
            # Task card
            st.markdown(f"""
            <div style='background: {"#fef2f2" if is_task_overdue(task) else "#ffffff"}; 
                        padding: 1rem; border-radius: 10px; 
                        border: 1px solid {"#fecaca" if is_task_overdue(task) else "#e2e8f0"};
                        margin-bottom: 0.5rem;'>
            </div>
            """, unsafe_allow_html=True)
            
            c1, c2, c3, c4 = st.columns([0.05, 0.55, 0.2, 0.2])
            
            with c1:
                st.markdown(f"### {p_icon}")
            
            with c2:
                st.markdown(f"**{task['task']}** {overdue_badge}")
                st.markdown(f"""
                <span style='background:{cat_color};color:white;padding:2px 10px;
                border-radius:12px;font-size:0.8rem;font-weight:500;'>{task.get('category', 'General')}</span>
                <span style='color:#64748b;margin-left:10px;'>📅 {task['scheduled_date']} • 🕐 {task['start_time']}-{task['end_time']}</span>
                """, unsafe_allow_html=True)
            
            with c3:
                if st.button("✅ Complete", key=f"done_{task['id']}", use_container_width=True):
                    complete_task(task['id'])
                    st.query_params['tab'] = '0'
                    st.rerun()
            
            with c4:
                btn_c1, btn_c2 = st.columns(2)
                with btn_c1:
                    if st.button("✏️", key=f"edit_{task['id']}"):
                        st.session_state.editing_task_id = task['id']
                        st.query_params['tab'] = '0'
                        st.rerun()
                with btn_c2:
                    if st.button("🗑️", key=f"del_{task['id']}"):
                        delete_task(task['id'])
                        st.query_params['tab'] = '0'
                        st.rerun()
            
            # Edit form
            if st.session_state.editing_task_id == task['id']:
                with st.form(key=f"edit_form_{task['id']}"):
                    st.markdown("#### ✏️ Edit Task")
                    new_name = st.text_input("Task", value=task['task'])
                    
                    ec1, ec2 = st.columns(2)
                    with ec1:
                        new_pri = st.selectbox("Priority", ["Low", "Medium", "High"],
                                              index=["Low", "Medium", "High"].index(task['priority']))
                    with ec2:
                        new_cat = st.selectbox("Category", CATEGORIES,
                                              index=CATEGORIES.index(task.get('category', 'General')))
                    
                    new_date = st.date_input("Date", 
                        value=datetime.strptime(task['scheduled_date'], "%Y-%m-%d").date())
                    
                    ec3, ec4 = st.columns(2)
                    with ec3:
                        new_start = st.time_input("Start", 
                            value=datetime.strptime(task['start_time'], "%H:%M").time())
                    with ec4:
                        new_end = st.time_input("End", 
                            value=datetime.strptime(task['end_time'], "%H:%M").time())
                    
                    sc1, sc2 = st.columns(2)
                    with sc1:
                        if st.form_submit_button("💾 Save", use_container_width=True):
                            update_task(task['id'], {
                                'task': new_name, 'priority': new_pri, 'category': new_cat,
                                'scheduled_date': new_date.isoformat(),
                                'start_time': new_start.strftime("%H:%M"),
                                'end_time': new_end.strftime("%H:%M")
                            })
                            st.session_state.editing_task_id = None
                            st.query_params['tab'] = '0'
                            st.rerun()
                    with sc2:
                        if st.form_submit_button("❌ Cancel", use_container_width=True):
                            st.session_state.editing_task_id = None
                            st.query_params['tab'] = '0'
                            st.rerun()
            
            st.markdown("---")


# ----- TAB 2: UPCOMING TASKS -----
with tab2:
    if not future_tasks:
        col_gif, col_msg = st.columns([0.4, 0.6])
        with col_gif:
            st.image(GIFS['empty_upcoming'], width=300)
        with col_msg:
            st.markdown("### 📭 Nothing scheduled!")
            st.markdown("Plan ahead and stay organized.")
            st.markdown("💡 **Tip:** Try 'Meeting tomorrow 2pm'")
    else:
        future_sorted = sorted(future_tasks,
            key=lambda x: datetime.strptime(f"{x['scheduled_date']} {x['start_time']}", "%Y-%m-%d %H:%M"))
        
        for task in future_sorted:
            p_icon = PRIORITY_ICONS.get(task['priority'], '🟡')
            cat_color = get_category_color(task.get('category', 'General'))
            
            task_dt = datetime.strptime(f"{task['scheduled_date']} {task['start_time']}", "%Y-%m-%d %H:%M")
            delta = task_dt - datetime.now()
            days, hours = delta.days, delta.seconds // 3600
            time_str = f"⏰ in {days}d {hours}h" if days > 0 else f"⏰ in {hours}h"
            
            c1, c2, c3, c4 = st.columns([0.05, 0.55, 0.2, 0.2])
            
            with c1:
                st.markdown(f"### {p_icon}")
            
            with c2:
                st.markdown(f"**{task['task']}**")
                st.markdown(f"""
                <span style='background:{cat_color};color:white;padding:2px 10px;
                border-radius:12px;font-size:0.8rem;'>{task.get('category', 'General')}</span>
                <span style='color:#64748b;margin-left:10px;'>📅 {task['scheduled_date']} • {time_str}</span>
                """, unsafe_allow_html=True)
            
            with c3:
                if st.button("✅ Done", key=f"fdone_{task['id']}", use_container_width=True):
                    complete_task(task['id'])
                    st.query_params['tab'] = '1'
                    st.rerun()
            
            with c4:
                if st.button("🗑️ Delete", key=f"fdel_{task['id']}", use_container_width=True):
                    delete_task(task['id'])
                    st.query_params['tab'] = '1'
                    st.rerun()
            
            st.markdown("---")


# ----- TAB 3: COMPLETED TASKS -----
with tab3:
    if not completed_tasks:
        col_gif, col_msg = st.columns([0.4, 0.6])
        with col_gif:
            st.image(GIFS['empty_done'], width=300)
        with col_msg:
            st.markdown("### 💪 Time to get productive!")
            st.markdown("Complete tasks and they'll appear here.")
            st.markdown("💡 **Tip:** Click '✅ Complete' on any task")
    else:
        st.success(f"🎉 {len(completed_tasks)} task(s) completed! Great job!")
        
        df = pd.DataFrame(completed_tasks)
        display_cols = ["task", "category", "priority", "scheduled_date", "completed_at"]
        available_cols = [c for c in display_cols if c in df.columns]
        
        st.dataframe(
            df[available_cols].sort_values(by='completed_at' if 'completed_at' in df.columns else 'scheduled_date', ascending=False),
            use_container_width=True,
            hide_index=True
        )


# ----- TAB 4: ANALYTICS -----
with tab4:
    analytics = calculate_analytics(st.session_state.tasks)
    
    if analytics and analytics['total_tasks'] > 0:
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("📋 Total", analytics['total_tasks'])
        m2.metric("✅ Done", analytics['completed_count'])
        m3.metric("📈 Rate", f"{analytics['completion_rate']}%")
        m4.metric("⏱️ Avg Time", f"{analytics['avg_duration']}h")
        
        st.markdown("---")
        
        ch1, ch2 = st.columns(2)
        with ch1:
            st.markdown("#### 📊 Tasks by Priority")
            if analytics['by_priority']:
                df = pd.DataFrame(list(analytics['by_priority'].items()), columns=['Priority', 'Count'])
                st.bar_chart(df.set_index('Priority'))
        
        with ch2:
            st.markdown("#### 📁 Tasks by Category")
            if analytics['by_category']:
                df = pd.DataFrame(list(analytics['by_category'].items()), columns=['Category', 'Count'])
                st.bar_chart(df.set_index('Category'))
        
        st.markdown("---")
        st.markdown("#### 💡 Insights")
        
        rate = analytics['completion_rate']
        ins_col1, ins_col2 = st.columns([0.35, 0.65])
        
        if rate >= 80:
            with ins_col1:
                st.image(GIFS['celebrate_high'], width=300)
            with ins_col2:
                st.success(f"🌟 AMAZING! {rate}% completion rate!")
                st.markdown("You're crushing it! Keep up the momentum! 🔥")
        elif rate >= 50:
            with ins_col1:
                st.image(GIFS['celebrate_medium'], width=300)
            with ins_col2:
                st.warning(f"📈 Good progress at {rate}%!")
                st.markdown("You're on the right track! Keep pushing! 💪")
        else:
            with ins_col1:
                st.image(GIFS['motivate_low'], width=300)
            with ins_col2:
                st.info(f"🚀 Currently at {rate}% - Let's boost that!")
                st.markdown("Every task completed is a win! You got this! 🎯")
    else:
        col_gif, col_msg = st.columns([0.4, 0.6])
        with col_gif:
            st.image(GIFS['empty_analytics'], width=300)
        with col_msg:
            st.markdown("### 📊 No data yet!")
            st.markdown("Add and complete tasks to see analytics.")
            st.markdown("💡 **Tip:** The more tasks you track, the better insights!")


# ----- TAB 5: TOOLS -----
with tab5:
    st.markdown("### ⚙️ Tools & Utilities")
    
    tool_col1, tool_col2 = st.columns(2)
    
    with tool_col1:
        # Manual Add Form
        st.markdown("""
        <div style='background: #f0f9ff; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;'>
            <h4 style='margin: 0; color: #0369a1;'>📝 Manual Task Entry</h4>
            <p style='margin: 0.25rem 0 0 0; color: #64748b; font-size: 0.85rem;'>Full control over all task fields</p>
        </div>
        """, unsafe_allow_html=True)
        
        with st.form("manual_add_form", clear_on_submit=True):
            m_task = st.text_input("Task Name", placeholder="What needs to be done?")
            
            m_col1, m_col2 = st.columns(2)
            with m_col1:
                m_priority = st.selectbox("Priority", ["Low", "Medium", "High"], index=1, key="m_pri")
            with m_col2:
                m_category = st.selectbox("Category", CATEGORIES, key="m_cat")
            
            m_date = st.date_input("Date", value=date.today(), key="m_date")
            
            m_col3, m_col4 = st.columns(2)
            with m_col3:
                m_start = st.time_input("Start Time", value=datetime.now().time(), key="m_start")
            with m_col4:
                m_end = st.time_input("End Time", value=(datetime.now() + timedelta(hours=1)).time(), key="m_end")
            
            if st.form_submit_button("➕ Add Task", use_container_width=True):
                if m_task:
                    if m_end <= m_start:
                        st.error("End time must be after start time!")
                    else:
                        add_task(m_task, m_priority, m_category, m_date, m_start, m_end)
                        st.query_params['tab'] = '4'
                        st.rerun()
        
        st.markdown("---")
        
        # Pomodoro Timer
        st.markdown("""
        <div style='background: #fef2f2; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;'>
            <h4 style='margin: 0; color: #dc2626;'>🍅 Pomodoro Timer</h4>
            <p style='margin: 0.25rem 0 0 0; color: #64748b; font-size: 0.85rem;'>Focus sessions with breaks</p>
        </div>
        """, unsafe_allow_html=True)
        
        pom_col1, pom_col2 = st.columns([0.6, 0.4])
        with pom_col1:
            st.session_state.pomodoro_duration = st.number_input(
                "Duration (min)", min_value=5, max_value=60,
                value=st.session_state.pomodoro_duration, step=5, key="pom_dur"
            )
        
        with pom_col2:
            if st.session_state.pomodoro_active:
                remaining = get_pomodoro_time_remaining()
                if remaining > 0:
                    if st.button("⏹️ Stop", use_container_width=True, key="pom_stop"):
                        st.session_state.pomodoro_active = False
                        st.session_state.pomodoro_start_time = None
                        st.query_params['tab'] = '4'
                        st.rerun()
                else:
                    st.balloons()
                    st.session_state.pomodoro_active = False
            else:
                if st.button("▶️ Start", use_container_width=True, type="primary", key="pom_start"):
                    st.session_state.pomodoro_active = True
                    st.session_state.pomodoro_start_time = datetime.now()
                    st.query_params['tab'] = '4'
                    st.rerun()
        
        if st.session_state.pomodoro_active:
            remaining = get_pomodoro_time_remaining()
            if remaining > 0:
                st.image(GIFS['pomodoro_focus'], width=300)
                st.success(f"⏱️ {int(remaining)} minutes remaining - Stay focused!")
                st.progress(1 - (remaining / st.session_state.pomodoro_duration))
            else:
                st.image(GIFS['pomodoro_break'], width=300)
                st.success("🎉 Time's up! Take a break!")
    
    with tool_col2:
        # Templates
        st.markdown("""
        <div style='background: #f0fdf4; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;'>
            <h4 style='margin: 0; color: #16a34a;'>📋 Task Templates</h4>
            <p style='margin: 0.25rem 0 0 0; color: #64748b; font-size: 0.85rem;'>Quick-create task sets</p>
        </div>
        """, unsafe_allow_html=True)
        
        templates = load_templates()
        tpl_name = st.selectbox("Select Template", list(templates.keys()), key="tpl_select")
        tpl_date = st.date_input("Schedule Date", value=date.today(), key="tpl_date")
        
        if st.button("✨ Create from Template", use_container_width=True, key="tpl_create"):
            count = create_tasks_from_template(tpl_name, templates, tpl_date)
            if count > 0:
                st.success(f"Created {count} tasks!")
                st.query_params['tab'] = '4'
                st.rerun()
        
        st.markdown("---")
        
        # Data Management
        st.markdown("""
        <div style='background: #faf5ff; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;'>
            <h4 style='margin: 0; color: #7c3aed;'>💾 Data Management</h4>
            <p style='margin: 0.25rem 0 0 0; color: #64748b; font-size: 0.85rem;'>Backup & restore</p>
        </div>
        """, unsafe_allow_html=True)
        
        st.download_button(
            "⬇️ Export Backup",
            json.dumps(export_data(), indent=2),
            file_name=f"tusk_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            mime="application/json",
            use_container_width=True,
            key="export_btn"
        )
        
        uploaded = st.file_uploader("Import Backup", type=['json'], key="import_file")
        if uploaded:
            try:
                success, msg = import_data(json.load(uploaded))
                if success:
                    st.success(msg)
                    st.rerun()
                else:
                    st.error(msg)
            except Exception as e:
                st.error(str(e))
        
        st.markdown("---")
        
        # Danger Zone
        st.markdown("""
        <div style='background: #fef2f2; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;'>
            <h4 style='margin: 0; color: #dc2626;'>🚨 Danger Zone</h4>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("🗑️ Clear Completed", use_container_width=True, key="clear_done"):
            before = len(st.session_state.tasks)
            st.session_state.tasks = [t for t in st.session_state.tasks if t['status'] != 'completed']
            save_tasks(st.session_state.tasks)
            st.success(f"Cleared {before - len(st.session_state.tasks)} completed tasks")
            st.query_params['tab'] = '4'
            st.rerun()
        
        if st.button("🚨 Clear ALL Tasks", use_container_width=True, key="clear_all"):
            st.session_state.tasks = []
            save_tasks(st.session_state.tasks)
            st.warning("All tasks cleared!")
            st.query_params['tab'] = '4'
            st.rerun()


# ============================================================
# SECTION 11: CSS STYLES
# ============================================================
st.markdown("""
<style>
    /* Hide Streamlit defaults */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Hide sidebar */
    [data-testid="stSidebar"], [data-testid="collapsedControl"] {
        display: none !important;
    }
    
    /* Clean white background */
    .stApp {
        background: #ffffff;
    }
    
    /* Better typography */
    h1, h2, h3, h4 {
        font-family: 'Segoe UI', system-ui, sans-serif;
    }
    
    /* Styled tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background: #f8fafc;
        padding: 0.5rem;
        border-radius: 12px;
    }
    
    .stTabs [data-baseweb="tab-list"] button {
        font-size: 15px;
        font-weight: 600;
        padding: 12px 24px;
        border-radius: 8px;
        background: transparent;
    }
    
    .stTabs [data-baseweb="tab-list"] button[aria-selected="true"] {
        background: #0ea5e9;
        color: white;
    }
    
    /* Metric styling */
    div[data-testid="stMetricValue"] {
        font-size: 2rem;
        font-weight: 700;
        color: #0ea5e9;
    }
    
    div[data-testid="stMetricLabel"] {
        font-size: 0.9rem;
        font-weight: 600;
    }
    
    /* Button styling */
    .stButton button {
        border-radius: 10px;
        font-weight: 600;
        transition: all 0.2s;
    }
    
    .stButton button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .stButton button[kind="primary"] {
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    }
    
    /* Input styling */
    .stTextInput input {
        border-radius: 10px;
        border: 2px solid #e2e8f0;
        padding: 0.75rem;
        font-size: 1rem;
    }
    
    .stTextInput input:focus {
        border-color: #0ea5e9;
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
    }
    
    /* Select styling */
    .stSelectbox > div > div {
        border-radius: 10px;
    }
    
    /* Progress bar */
    .stProgress > div > div {
        background: linear-gradient(90deg, #0ea5e9 0%, #06b6d4 100%);
        border-radius: 10px;
    }
    
    /* Divider */
    hr {
        border: none;
        border-top: 1px solid #e2e8f0;
        margin: 1rem 0;
    }
    
    /* DataFrames */
    .stDataFrame {
        border-radius: 10px;
        overflow: hidden;
    }
</style>
""", unsafe_allow_html=True)
