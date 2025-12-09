/* script.js
   AI-enabled TODO app logic.
   No external AI calls — local deterministic suggestions & categorization.
*/

/* Storage keys */
const STORAGE_KEY = 'ai_todo_v1';

/* Utils */
const q = (s) => document.querySelector(s);
const createEl = (tag, attrs = {}) => {
  const el = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') el.className = attrs[k];
    else if (k === 'text') el.textContent = attrs[k];
    else el.setAttribute(k, attrs[k]);
  }
  return el;
};

/* Toast system */
(function ToastModule(){
  const container = q('#toastContainer');
  window.showToast = (msg, opts = {}) => {
    const t = createEl('div', { class: 'toast bg-slate-800 text-white px-4 py-2 rounded-md shadow-md' });
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => t.remove(), opts.duration || 2600);
  };
})();

/* App module - closure keeps internal state private */
const App = (function(){
  // DOM
  const taskInput = q('#taskInput');
  const addBtn = q('#addBtn');
  const aiBtn = q('#aiSuggestBtn');
  const voiceBtn = q('#voiceBtn');
  const listEl = q('#todoList');
  const stats = q('#stats');
  const clearCompletedBtn = q('#clearCompleted');
  const filterBtns = Array.from(document.querySelectorAll('.filterBtn'));
  const prioritySel = q('#priority');
  const autoCategoryEl = q('#autoCategory');
  const darkToggle = q('#darkToggle');
  const exportBtn = q('#exportBtn');
  const helpBtn = q('#helpBtn');
  const helpModal = q('#helpModal');
  const closeHelp = q('#closeHelp');

  let todos = [];          // { id, text, completed, createdAt, category, priority }
  let filter = 'all';

  /* --- Persistence --- */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      todos = raw ? JSON.parse(raw) : [];
    } catch(e) {
      todos = [];
      console.error('Load error', e);
    }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  /* Generate unique id */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  }

  /* Simple local "AI" suggestion system:
     - If user has input, suggest completion + category by keywords
     - Otherwise produce a helpful template item based on time of day
  */
  function aiSuggest(seed = '') {
    seed = (seed || '').trim().toLowerCase();
    const now = new Date();
    const hour = now.getHours();

    // keyword to category mapping
    const keywordMap = [
      { keywords: ['email','send','mail','inbox'], category: 'Work' },
      { keywords: ['meeting','call','sync','standup','demo'], category: 'Work' },
      { keywords: ['buy','grocer','shop','milk','eggs','shopping'], category: 'Personal' },
      { keywords: ['pay','bill','invoice','due'], category: 'Urgent' },
      { keywords: ['fitness','gym','run','exercise','walk'], category: 'Personal' },
      { keywords: ['fix','bug','error','deploy','release'], category: 'Work' },
    ];

    // heuristics
    let category = 'Other';
    for (const m of keywordMap) {
      for (const k of m.keywords) {
        if (seed.includes(k)) { category = m.category; break; }
      }
      if (category !== 'Other') break;
    }

    if (!seed) {
      // time-based templates
      if (hour < 12) seed = 'Plan today: prioritize 3 tasks';
      else if (hour < 18) seed = 'Finish current sprint task';
      else seed = 'Prepare tomorrow\'s morning checklist';
    } else {
      // expand seed into a clearer TODO sentence
      if (seed.length < 6) seed = seed + ' — add details';
      else seed = seed.charAt(0).toUpperCase() + seed.slice(1);
    }

    // urgency heuristic
    const priority = /urgent|asap|immediately|now|due/i.test(seed) ? 'urgent' : 'normal';
    return { text: seed, category, priority };
  }

  /* Auto categorizer for typed input */
  function autoCategorize(text) {
    return aiSuggest(text).category;
  }

  /* --- Rendering --- */
  function render() {
    listEl.innerHTML = '';
    const filtered = todos.filter(t => {
      if (filter === 'all') return true;
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
    });

    if (filtered.length === 0) {
      const p = createEl('div', { class: 'text-sm text-slate-500 p-4' });
      p.textContent = 'No tasks — try AI or voice input!';
      listEl.appendChild(p);
    } else {
      for (const t of filtered) listEl.appendChild(renderItem(t));
    }

    updateStats();
    save();
  }

  function renderItem(item) {
    const li = createEl('li', { class: 'flex items-start gap-3 p-3 border rounded-md' });
    // left: checkbox
    const chk = createEl('input');
    chk.type = 'checkbox';
    chk.checked = !!item.completed;
    chk.className = 'mt-1';
    chk.addEventListener('change', () => {
      item.completed = chk.checked;
      showToast(`Marked ${item.completed ? 'done' : 'active'}`);
      render();
    });

    // center: content
    const content = createEl('div', { class: 'flex-1' });
    const txt = createEl('div', { text: item.text });
    txt.className = item.completed ? 'line-through text-slate-400' : 'font-medium';
    const meta = createEl('div', { class: 'text-xs text-slate-500 mt-1' });
    meta.textContent = `${item.category} • ${item.priority === 'urgent' ? '⚠️ Urgent • ' : ''}${new Date(item.createdAt).toLocaleString()}`;

    content.appendChild(txt);
    content.appendChild(meta);

    // right: actions
    const actions = createEl('div', { class: 'flex gap-2 items-center' });

    const editBtn = createEl('button', { class: 'px-2 py-1 text-sm rounded-md bg-slate-100', text: 'Edit' });
    editBtn.addEventListener('click', () => enterEditMode(item, txt, meta));

    const delBtn = createEl('button', { class: 'px-2 py-1 text-sm rounded-md bg-red-50 text-red-600', text: 'Delete' });
    delBtn.addEventListener('click', () => {
      todos = todos.filter(x => x.id !== item.id);
      showToast('Task deleted');
      render();
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    // priority badge
    const badge = createEl('div', { class: 'text-xs px-2 py-1 rounded-md text-white' });
    badge.textContent = item.priority === 'urgent' ? 'Urgent' : item.category;
    badge.classList.add(item.priority === 'urgent' ? 'bg-red-500' : 'bg-slate-400');

    li.appendChild(chk);
    li.appendChild(content);
    li.appendChild(badge);
    li.appendChild(actions);

    return li;
  }

  function enterEditMode(item, txtNode, metaNode) {
    const input = createEl('input', { class: 'w-full px-2 py-1 border rounded-md' });
    input.value = item.text;
    txtNode.replaceWith(input);
    input.focus();

    input.addEventListener('blur', () => {
      item.text = input.value.trim() || item.text;
      metaNode.textContent = `${item.category} • ${item.priority === 'urgent' ? '⚠️ Urgent • ' : ''}${new Date(item.createdAt).toLocaleString()}`;
      render();
      showToast('Task updated');
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') input.blur();
      if (e.key === 'Escape') render();
    });
  }

  function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    stats.textContent = `${total} item(s) — ${completed} completed`;
  }

  /* --- Actions --- */
  function addTask({ text, category = 'Other', priority = 'normal' }) {
    const trimmed = (text || '').trim();
    if (!trimmed) { showToast('Cannot add empty task'); return; }
    const item = {
      id: uid(),
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
      category,
      priority
    };
    todos.unshift(item); // newest first
    showToast('Task added');
    render();
  }

  function clearCompleted() {
    const before = todos.length;
    todos = todos.filter(t => !t.completed);
    save();
    showToast(`Removed ${before - todos.length} completed`);
    render();
  }

  function exportJSON() {
    const data = JSON.stringify(todos, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-export-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export started');
  }

  /* --- Voice input --- */
  let recognition = null;
  function initVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      voiceBtn.title = 'Voice not supported';
      voiceBtn.disabled = true;
      return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener('result', (ev) => {
      const txt = ev.results[0][0].transcript;
      taskInput.value = txt;
      autoCategoryEl.textContent = autoCategorize(txt);
      showToast('Voice recognized — edit if needed');
    });
    recognition.addEventListener('end', () => voiceBtn.classList.remove('ring'));
  }
  function startVoice() {
    if (!recognition) { showToast('Voice not available'); return; }
    try {
      recognition.start();
      voiceBtn.classList.add('ring', 'ring-2', 'ring-emerald-300');
      showToast('Listening...');
    } catch(e) {
      console.warn('Voice start error', e);
    }
  }

  /* --- Keyboard shortcuts --- */
  function initShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl+Enter to add
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        addBtn.click();
      }
      // Press "/" focus input
      if (e.key === '/' && !/INPUT|TEXTAREA/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        taskInput.focus();
      }
    });
  }

  /* --- Init --- */
  function bind() {
    // Add
    addBtn.addEventListener('click', () => {
      const cat = autoCategorize(taskInput.value) || 'Other';
      const priority = prioritySel.value;
      addTask({ text: taskInput.value, category: cat, priority });
      taskInput.value = '';
      autoCategoryEl.textContent = '—';
    });

    // AI Suggest
    aiBtn.addEventListener('click', () => {
      const seed = taskInput.value.trim();
      const suggestion = aiSuggest(seed);
      // fill input with suggestion
      taskInput.value = suggestion.text;
      prioritySel.value = suggestion.priority;
      autoCategoryEl.textContent = suggestion.category;
      showToast('AI suggested a task');
    });

    // Voice
    voiceBtn.addEventListener('click', startVoice);

    // Filters
    filterBtns.forEach(b => {
      b.addEventListener('click', () => {
        filterBtns.forEach(x => x.classList.remove('bg-slate-100'));
        b.classList.add('bg-slate-100');
        filter = b.dataset.filter;
        render();
      });
    });

    // Clear completed
    clearCompletedBtn.addEventListener('click', clearCompleted);

    // Export
    exportBtn.addEventListener('click', exportJSON);

    // Dark mode
    darkToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      if (document.documentElement.classList.contains('dark')) {
        document.body.classList.add('bg-slate-900', 'text-slate-100');
        showToast('Dark mode on');
      } else {
        document.body.classList.remove('bg-slate-900', 'text-slate-100');
        showToast('Dark mode off');
      }
    });

    // Help modal
    helpBtn.addEventListener('click', () => helpModal.classList.remove('hidden'), false);
    closeHelp.addEventListener('click', () => helpModal.classList.add('hidden'), false);
  }

  /* --- Public init --- */
  function init() {
    load();
    bind();
    initVoice();
    initShortcuts();
    render();

    // update category display when typing
    taskInput.addEventListener('input', (e) => {
      autoCategoryEl.textContent = autoCategorize(e.target.value);
    });

    // keyboard: Enter to add quickly
    taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addBtn.click();
    });
  }

  return { init };
})();

/* Kick off app */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

/* Helper global toast wrapper to expose showToast from anywhere */
function showToast(msg){ window.showToast && window.showToast(msg); }
