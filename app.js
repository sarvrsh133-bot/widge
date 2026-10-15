/**
 * ============================================================================
 * DAILY HABIT TRACKER — APP JAVASCRIPT
 * A professional, modern, responsive habit tracker with pastel aesthetics.
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY_HABITS = 'daily_habits_list_v2';
  const STORAGE_KEY_THEME = 'daily_habits_theme_v2';
  const STORAGE_KEY_SOUND = 'daily_habits_sound_v2';
  const STORAGE_KEY_DATE = 'daily_habits_last_date_v2';

  // Default Sample Habits
  const SAMPLE_HABITS = [
    {
      id: 'habit-sample-1',
      title: 'Reading 20 pages',
      category: 'Learning',
      target: '20 pages',
      icon: '📖',
      color: 'lavender',
      completed: true,
      streak: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: 'habit-sample-2',
      title: 'Daily Exercise & Stretch',
      category: 'Fitness',
      target: '30 mins',
      icon: '🏃',
      color: 'peach',
      completed: false,
      streak: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 'habit-sample-3',
      title: 'Drink 8 Glasses of Water',
      category: 'Health',
      target: '2.5 Liters',
      icon: '💧',
      color: 'sky',
      completed: true,
      streak: 8,
      createdAt: new Date().toISOString()
    },
    {
      id: 'habit-sample-4',
      title: 'Study & Focused Deep Work',
      category: 'Productivity',
      target: '45 mins',
      icon: '📚',
      color: 'mint',
      completed: false,
      streak: 4,
      createdAt: new Date().toISOString()
    }
  ];

  // Motivational Quotes Pool (Changes on refresh)
  const MOTIVATIONAL_QUOTES = [
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear, Atomic Habits" },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
    { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
    { text: "Consistency is more important than perfection.", author: "Angela Duckworth" },
    { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
    { text: "Continuous improvement is better than delayed perfection.", author: "Mark Twain" },
    { text: "Energy flows where attention goes. Focus on your daily ritual.", author: "Tony Robbins" },
    { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { text: "Habits change into character.", author: "Ovid" },
    { text: "Drop by drop is the water pot filled.", author: "Buddha" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" }
  ];

  // Color theme mapping for pastel styling
  const COLOR_MAP = {
    lavender: {
      color: 'var(--pastel-lavender)',
      bg: 'var(--pastel-lavender-light)',
      border: 'var(--pastel-lavender-border)',
      text: 'var(--pastel-lavender-text)'
    },
    mint: {
      color: 'var(--pastel-mint)',
      bg: 'var(--pastel-mint-light)',
      border: 'var(--pastel-mint-border)',
      text: 'var(--pastel-mint-text)'
    },
    peach: {
      color: 'var(--pastel-peach)',
      bg: 'var(--pastel-peach-light)',
      border: 'var(--pastel-peach-border)',
      text: 'var(--pastel-peach-text)'
    },
    sky: {
      color: 'var(--pastel-sky)',
      bg: 'var(--pastel-sky-light)',
      border: 'var(--pastel-sky-border)',
      text: 'var(--pastel-sky-text)'
    },
    rose: {
      color: 'var(--pastel-rose)',
      bg: 'var(--pastel-rose-light)',
      border: 'var(--pastel-rose-border)',
      text: 'var(--pastel-rose-text)'
    },
    butter: {
      color: 'var(--pastel-butter)',
      bg: 'var(--pastel-butter-light)',
      border: 'var(--pastel-butter-border)',
      text: 'var(--pastel-butter-text)'
    }
  };

  const ICON_EMOJI_MAP = {
    book: '📖',
    exercise: '🏃',
    water: '💧',
    study: '📚',
    meditate: '🧘',
    heart: '❤️',
    code: '💻',
    sleep: '🌙',
    sun: '☀️',
    apple: '🍎'
  };

  // --- State ---
  let habits = [];
  let currentFilter = 'all'; // 'all', 'pending', 'completed'
  let currentCategory = 'all';
  let searchQuery = '';
  let habitToDeleteId = null;
  let soundEnabled = true;
  let audioContext = null;

  // --- DOM Elements ---
  const currentDateDisplay = document.getElementById('currentDateDisplay');
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const refreshQuoteBtn = document.getElementById('refreshQuoteBtn');
  const habitsList = document.getElementById('habitsList');
  const emptyState = document.getElementById('emptyState');
  const emptyTitle = document.getElementById('emptyTitle');
  const emptyDesc = document.getElementById('emptyDesc');

  // Stats elements
  const completionPercentage = document.getElementById('completionPercentage');
  const completionStatusBadge = document.getElementById('completionStatusBadge');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressSubtext = document.getElementById('progressSubtext');
  const radialMeter = document.getElementById('radialMeter');
  const radialRatio = document.getElementById('radialRatio');
  const completedCount = document.getElementById('completedCount');
  const totalHabitsMetric = document.getElementById('totalHabitsMetric');
  const remainingMetricText = document.getElementById('remainingMetricText');
  const currentStreakDisplay = document.getElementById('currentStreakDisplay');
  const totalHabitsCount = document.getElementById('totalHabitsCount');
  const habitCounterPill = document.getElementById('habitCounterPill');

  // Toolbar elements
  const filterTabs = document.querySelectorAll('.filter-tab');
  const tabCountAll = document.getElementById('tabCountAll');
  const tabCountPending = document.getElementById('tabCountPending');
  const tabCountCompleted = document.getElementById('tabCountCompleted');
  const categoryFilter = document.getElementById('categoryFilter');
  const habitSearchInput = document.getElementById('habitSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const resetTodayBtn = document.getElementById('resetTodayBtn');
  const restoreDefaultsBtn = document.getElementById('restoreDefaultsBtn');

  // Modal elements
  const habitModalBackdrop = document.getElementById('habitModalBackdrop');
  const openAddModalBtn = document.getElementById('openAddModalBtn');
  const emptyAddBtn = document.getElementById('emptyAddBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const habitForm = document.getElementById('habitForm');
  const modalTitle = document.getElementById('modalTitle');
  const saveBtnText = document.getElementById('saveBtnText');
  const habitIdInput = document.getElementById('habitIdInput');
  const habitTitleInput = document.getElementById('habitTitleInput');
  const habitCategorySelect = document.getElementById('habitCategorySelect');
  const habitGoalInput = document.getElementById('habitGoalInput');
  const selectedIconInput = document.getElementById('selectedIconInput');
  const selectedColorInput = document.getElementById('selectedColorInput');
  const titleError = document.getElementById('titleError');
  const iconPicker = document.getElementById('iconPicker');
  const colorPicker = document.getElementById('colorPicker');

  // Delete modal
  const deleteConfirmBackdrop = document.getElementById('deleteConfirmBackdrop');
  const deleteHabitName = document.getElementById('deleteHabitName');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  // Header toggles
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundOnIcon = document.getElementById('soundOnIcon');
  const soundOffIcon = document.getElementById('soundOffIcon');
  const toastContainer = document.getElementById('toastContainer');
  const confettiCanvas = document.getElementById('confettiCanvas');

  // --- Initialization ---
  function init() {
    renderCurrentDate();
    initTheme();
    initSound();
    initMotivationalQuote();
    loadHabits();
    setupEventListeners();
  }

  // --- Date Display ---
  function renderCurrentDate() {
    const today = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    currentDateDisplay.textContent = today.toLocaleDateString('en-US', options);
  }

  // --- Theme Controller ---
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'light';
    setTheme(savedTheme);
  }

  function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    if (theme === 'dark') {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  }

  function toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'light';
    const target = current === 'dark' ? 'light' : 'dark';
    setTheme(target);
    showToast(`Switched to ${target} mode`, 'info');
  }

  // --- Sound Effects (Web Audio API) ---
  function initSound() {
    const saved = localStorage.getItem(STORAGE_KEY_SOUND);
    soundEnabled = saved !== null ? JSON.parse(saved) : true;
    updateSoundIcons();
  }

  function updateSoundIcons() {
    if (soundEnabled) {
      soundOnIcon.classList.remove('hidden');
      soundOffIcon.classList.add('hidden');
    } else {
      soundOnIcon.classList.add('hidden');
      soundOffIcon.classList.remove('hidden');
    }
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem(STORAGE_KEY_SOUND, JSON.stringify(soundEnabled));
    updateSoundIcons();
    showToast(`Sound effects ${soundEnabled ? 'enabled' : 'disabled'}`, 'info');
    if (soundEnabled) playChimeSound(600, 0.08);
  }

  function playChimeSound(frequency = 587.33, duration = 0.12, type = 'sine') {
    if (!soundEnabled) return;
    try {
      if (!audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioContext = new AudioCtx();
      }
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
      }
      if (!audioContext) return;

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioContext.currentTime);

      gain.gain.setValueAtTime(0.12, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + duration);
    } catch (e) {
      // Audio might be blocked by browser policy
    }
  }

  function playCelebrationFanfare() {
    if (!soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playChimeSound(freq, 0.22, 'triangle');
      }, idx * 110);
    });
  }

  // --- Motivational Quote Logic ---
  // Selects a new quote on page refresh
  function initMotivationalQuote() {
    setRandomQuote(false);
  }

  function setRandomQuote(withAnimation = true) {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    const quote = MOTIVATIONAL_QUOTES[randomIndex];

    if (withAnimation) {
      quoteText.style.opacity = '0';
      setTimeout(() => {
        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `— ${quote.author}`;
        quoteText.style.opacity = '1';
      }, 200);
    } else {
      quoteText.textContent = `"${quote.text}"`;
      quoteAuthor.textContent = `— ${quote.author}`;
    }
  }

  // --- Local Storage Management ---
  function loadHabits() {
    const raw = localStorage.getItem(STORAGE_KEY_HABITS);
    if (!raw) {
      // First visit: use sample starter habits
      habits = JSON.parse(JSON.stringify(SAMPLE_HABITS));
      saveHabits(false);
    } else {
      try {
        habits = JSON.parse(raw);
        if (!Array.isArray(habits)) habits = [];
      } catch (e) {
        habits = JSON.parse(JSON.stringify(SAMPLE_HABITS));
      }
    }

    // Check if new day
    checkDateRollover();

    renderHabits();
    updateStats();
  }

  function saveHabits(notify = false) {
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
    if (notify) {
      updateStats();
    }
  }

  // Automatically reset checkmarks if a new calendar day has started
  function checkDateRollover() {
    const todayStr = new Date().toDateString();
    const lastDate = localStorage.getItem(STORAGE_KEY_DATE);

    if (lastDate && lastDate !== todayStr) {
      // A new day! Let's update streak logic
      habits.forEach(h => {
        if (!h.completed) {
          // Missed yesterday -> streak resets to 0
          h.streak = 0;
        }
        // Reset checkbox for today
        h.completed = false;
      });
      saveHabits(false);
      showToast("🌅 Good morning! Habit checkboxes reset for a fresh day.", "info");
    }

    localStorage.setItem(STORAGE_KEY_DATE, todayStr);
  }

  // --- Render Habits & Dashboard ---
  function renderHabits() {
    habitsList.innerHTML = '';

    // Apply Filter & Search
    const filtered = habits.filter(habit => {
      // Status filter
      if (currentFilter === 'pending' && habit.completed) return false;
      if (currentFilter === 'completed' && !habit.completed) return false;

      // Category filter
      if (currentCategory !== 'all' && habit.category.toLowerCase() !== currentCategory.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = habit.title.toLowerCase().includes(q);
        const matchesCat = habit.category.toLowerCase().includes(q);
        const matchesTarget = (habit.target || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCat && !matchesTarget) return false;
      }

      return true;
    });

    // Update Counts
    updateTabBadges();

    // Toggle Empty State
    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
      if (habits.length === 0) {
        emptyTitle.textContent = "No habits created yet";
        emptyDesc.textContent = "Start building positive routines by adding your first daily habit!";
      } else {
        emptyTitle.textContent = "No matching habits";
        emptyDesc.textContent = "Try clearing your search query or switching active filters.";
      }
    } else {
      emptyState.classList.add('hidden');
      filtered.forEach(habit => {
        const card = createHabitCard(habit);
        habitsList.appendChild(card);
      });
    }

    habitCounterPill.textContent = `${habits.length} ${habits.length === 1 ? 'routine' : 'routines'}`;
  }

  function updateTabBadges() {
    const total = habits.length;
    const completed = habits.filter(h => h.completed).length;
    const pending = total - completed;

    tabCountAll.textContent = total;
    tabCountPending.textContent = pending;
    tabCountCompleted.textContent = completed;
  }

  function createHabitCard(habit) {
    const card = document.createElement('div');
    card.className = `habit-card ${habit.completed ? 'is-completed' : ''}`;
    card.setAttribute('data-id', habit.id);

    const colorConfig = COLOR_MAP[habit.color] || COLOR_MAP.lavender;
    card.style.setProperty('--card-accent-color', colorConfig.color);
    card.style.setProperty('--card-accent-bg', colorConfig.bg);
    card.style.setProperty('--card-accent-border', colorConfig.border);
    card.style.setProperty('--card-accent-text', colorConfig.text);

    // Left section: Checkbox, Icon, Title & Meta
    const leftSection = document.createElement('div');
    leftSection.className = 'habit-left-section';

    // Custom Checkbox
    const checkboxLabel = document.createElement('label');
    checkboxLabel.className = 'checkbox-container';
    checkboxLabel.setAttribute('title', habit.completed ? 'Mark as incomplete' : 'Mark as complete');

    const checkboxInput = document.createElement('input');
    checkboxInput.type = 'checkbox';
    checkboxInput.className = 'habit-checkbox-input';
    checkboxInput.checked = habit.completed;
    checkboxInput.setAttribute('aria-label', `Complete ${habit.title}`);
    checkboxInput.addEventListener('change', () => toggleHabitComplete(habit.id));

    const customCheckbox = document.createElement('div');
    customCheckbox.className = 'custom-checkbox';
    customCheckbox.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    checkboxLabel.appendChild(checkboxInput);
    checkboxLabel.appendChild(customCheckbox);
    leftSection.appendChild(checkboxLabel);

    // Icon Badge
    const iconBadge = document.createElement('div');
    iconBadge.className = 'habit-icon-badge';
    iconBadge.textContent = habit.icon || '✨';
    leftSection.appendChild(iconBadge);

    // Habit Details
    const content = document.createElement('div');
    content.className = 'habit-content';

    const title = document.createElement('h3');
    title.className = 'habit-title';
    title.textContent = habit.title;
    content.appendChild(title);

    const metaRow = document.createElement('div');
    metaRow.className = 'habit-meta-row';

    // Category tag
    const catTag = document.createElement('span');
    catTag.className = 'category-tag';
    catTag.textContent = habit.category;
    metaRow.appendChild(catTag);

    // Target badge
    if (habit.target && habit.target.trim() !== '') {
      const targetBadge = document.createElement('span');
      targetBadge.className = 'target-badge';
      targetBadge.innerHTML = `🎯 ${escapeHtml(habit.target)}`;
      metaRow.appendChild(targetBadge);
    }

    // Streak badge
    const streakBadge = document.createElement('span');
    streakBadge.className = 'streak-badge';
    streakBadge.innerHTML = `🔥 ${habit.streak || 0}d streak`;
    metaRow.appendChild(streakBadge);

    content.appendChild(metaRow);
    leftSection.appendChild(content);

    // Right section: Actions (Edit & Delete)
    const actions = document.createElement('div');
    actions.className = 'habit-actions';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn edit-btn';
    editBtn.setAttribute('title', 'Edit habit');
    editBtn.setAttribute('aria-label', `Edit ${habit.title}`);
    editBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
      </svg>
    `;
    editBtn.addEventListener('click', () => openEditModal(habit));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.setAttribute('title', 'Delete habit');
    deleteBtn.setAttribute('aria-label', `Delete ${habit.title}`);
    deleteBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    `;
    deleteBtn.addEventListener('click', () => requestDeleteHabit(habit.id, habit.title));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(leftSection);
    card.appendChild(actions);

    return card;
  }

  // --- Habit Completion & Progress Calculation ---
  function toggleHabitComplete(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    habit.completed = !habit.completed;

    if (habit.completed) {
      habit.streak = (habit.streak || 0) + 1;
      playChimeSound(680, 0.15, 'sine');
      showToast(`Completed: ${habit.title}! 👏`, 'success');
    } else {
      habit.streak = Math.max(0, (habit.streak || 1) - 1);
      playChimeSound(420, 0.1, 'sine');
    }

    saveHabits();
    renderHabits();
    updateStats();

    // Check if 100% completion was achieved
    checkAllCompletedCelebration();
  }

  function updateStats() {
    const total = habits.length;
    const completed = habits.filter(h => h.completed).length;
    const remaining = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Percentage & Status text
    completionPercentage.textContent = `${percentage}%`;
    progressBarFill.style.width = `${percentage}%`;

    // Radial SVG Meter
    const circumference = 2 * Math.PI * 42; // ~263.89
    const offset = circumference - (percentage / 100) * circumference;
    radialMeter.style.strokeDashoffset = offset;
    radialRatio.textContent = `${completed}/${total}`;

    // Metrics Cards
    completedCount.textContent = completed;
    totalHabitsMetric.textContent = `/ ${total}`;
    remainingMetricText.textContent = `${remaining} ${remaining === 1 ? 'habit' : 'habits'} left`;
    totalHabitsCount.textContent = total;

    // Highest current streak among all active habits
    const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    currentStreakDisplay.textContent = maxStreak;

    // Motivational status badge & progress text
    if (total === 0) {
      completionStatusBadge.textContent = 'No Habits Yet';
      progressSubtext.textContent = 'Add a habit to start tracking your daily flow.';
    } else if (percentage === 0) {
      completionStatusBadge.textContent = 'Ready to Start';
      progressSubtext.textContent = 'Take your first step today — you’ve got this!';
    } else if (percentage < 50) {
      completionStatusBadge.textContent = 'Building Momentum';
      progressSubtext.textContent = `Great progress! ${completed} done, ${remaining} to go.`;
    } else if (percentage < 100) {
      completionStatusBadge.textContent = 'Almost There! 🔥';
      progressSubtext.textContent = `Over halfway there! Finish strong today.`;
    } else {
      completionStatusBadge.textContent = 'All Done! 🎉';
      progressSubtext.textContent = 'Outstanding achievement! You completed all daily habits!';
    }
  }

  function checkAllCompletedCelebration() {
    if (habits.length > 0 && habits.every(h => h.completed)) {
      triggerConfetti();
      playCelebrationFanfare();
      showToast('🌟 Incredible! All habits completed today! Keep shining!', 'success');
    }
  }

  // --- CRUD Operations ---
  function openAddModal() {
    habitForm.reset();
    habitIdInput.value = '';
    modalTitle.textContent = 'Add New Habit';
    saveBtnText.textContent = 'Save Habit';
    selectedIconInput.value = 'book';
    selectedColorInput.value = 'lavender';
    titleError.classList.add('hidden');

    resetPickerSelections();
    habitModalBackdrop.classList.remove('hidden');
    setTimeout(() => habitTitleInput.focus(), 100);
  }

  function openEditModal(habit) {
    habitIdInput.value = habit.id;
    habitTitleInput.value = habit.title;
    habitCategorySelect.value = habit.category;
    habitGoalInput.value = habit.target || '';
    modalTitle.textContent = 'Edit Habit';
    saveBtnText.textContent = 'Update Habit';
    titleError.classList.add('hidden');

    // Set icon
    selectedIconInput.value = habit.icon;
    document.querySelectorAll('.icon-choice').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.trim() === habit.icon);
    });

    // Set color
    selectedColorInput.value = habit.color;
    document.querySelectorAll('.color-dot').forEach(dot => {
      dot.classList.toggle('active', dot.getAttribute('data-color') === habit.color);
    });

    habitModalBackdrop.classList.remove('hidden');
    setTimeout(() => habitTitleInput.focus(), 100);
  }

  function closeModal() {
    habitModalBackdrop.classList.add('hidden');
  }

  function resetPickerSelections() {
    document.querySelectorAll('.icon-choice').forEach((btn, idx) => {
      btn.classList.toggle('active', idx === 0);
    });
    document.querySelectorAll('.color-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === 0);
    });
  }

  function handleHabitSubmit(e) {
    e.preventDefault();
    const titleVal = habitTitleInput.value.trim();

    if (!titleVal) {
      titleError.classList.remove('hidden');
      habitTitleInput.focus();
      return;
    }
    titleError.classList.add('hidden');

    const editingId = habitIdInput.value;
    const category = habitCategorySelect.value;
    const target = habitGoalInput.value.trim();
    const icon = selectedIconInput.value || '📖';
    const color = selectedColorInput.value || 'lavender';

    if (editingId) {
      // Update existing
      const existing = habits.find(h => h.id === editingId);
      if (existing) {
        existing.title = titleVal;
        existing.category = category;
        existing.target = target;
        existing.icon = icon;
        existing.color = color;
        showToast(`Habit updated: "${titleVal}"`, 'info');
      }
    } else {
      // Add new
      const newHabit = {
        id: 'habit-' + Date.now(),
        title: titleVal,
        category: category,
        target: target,
        icon: icon,
        color: color,
        completed: false,
        streak: 0,
        createdAt: new Date().toISOString()
      };
      habits.unshift(newHabit);
      playChimeSound(640, 0.12, 'sine');
      showToast(`Added new habit: "${titleVal}"`, 'success');
    }

    saveHabits();
    renderHabits();
    updateStats();
    closeModal();
  }

  function requestDeleteHabit(id, name) {
    habitToDeleteId = id;
    deleteHabitName.textContent = `Are you sure you want to delete "${name}"?`;
    deleteConfirmBackdrop.classList.remove('hidden');
  }

  function closeDeleteModal() {
    habitToDeleteId = null;
    deleteConfirmBackdrop.classList.add('hidden');
  }

  function executeDelete() {
    if (!habitToDeleteId) return;

    const habitToDelete = habits.find(h => h.id === habitToDeleteId);
    const title = habitToDelete ? habitToDelete.title : 'Habit';

    habits = habits.filter(h => h.id !== habitToDeleteId);
    saveHabits();
    renderHabits();
    updateStats();
    closeDeleteModal();

    playChimeSound(320, 0.1, 'sine');
    showToast(`Deleted habit: "${title}"`, 'danger');
  }

  function resetTodayProgress() {
    if (habits.length === 0) return;
    habits.forEach(h => {
      h.completed = false;
    });
    saveHabits();
    renderHabits();
    updateStats();
    playChimeSound(450, 0.1, 'sine');
    showToast("Reset daily checkboxes for today.", "info");
  }

  function restoreSampleHabits() {
    habits = JSON.parse(JSON.stringify(SAMPLE_HABITS));
    saveHabits();
    renderHabits();
    updateStats();
    playChimeSound(550, 0.15, 'sine');
    showToast("Restored sample starter habits!", "success");
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Header actions
    themeToggleBtn.addEventListener('click', toggleTheme);
    soundToggleBtn.addEventListener('click', toggleSound);
    refreshQuoteBtn.addEventListener('click', () => {
      playChimeSound(700, 0.08, 'sine');
      setRandomQuote(true);
    });

    // Modals
    openAddModalBtn.addEventListener('click', openAddModal);
    emptyAddBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    habitForm.addEventListener('submit', handleHabitSubmit);

    // Delete modal
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', executeDelete);

    // Close on backdrop click
    habitModalBackdrop.addEventListener('click', (e) => {
      if (e.target === habitModalBackdrop) closeModal();
    });
    deleteConfirmBackdrop.addEventListener('click', (e) => {
      if (e.target === deleteConfirmBackdrop) closeDeleteModal();
    });

    // Esc key closes modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!habitModalBackdrop.classList.contains('hidden')) closeModal();
        if (!deleteConfirmBackdrop.classList.contains('hidden')) closeDeleteModal();
      }
    });

    // Reset & restore buttons
    resetTodayBtn.addEventListener('click', resetTodayProgress);
    restoreDefaultsBtn.addEventListener('click', restoreSampleHabits);

    // Filter tabs
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        currentFilter = tab.getAttribute('data-filter');
        renderHabits();
      });
    });

    // Category filter
    categoryFilter.addEventListener('change', (e) => {
      currentCategory = e.target.value;
      renderHabits();
    });

    // Search input
    habitSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      clearSearchBtn.classList.toggle('hidden', searchQuery.trim() === '');
      renderHabits();
    });

    clearSearchBtn.addEventListener('click', () => {
      habitSearchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.add('hidden');
      habitSearchInput.focus();
      renderHabits();
    });

    // Icon Picker buttons
    iconPicker.addEventListener('click', (e) => {
      const btn = e.target.closest('.icon-choice');
      if (!btn) return;
      document.querySelectorAll('.icon-choice').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedIconInput.value = btn.textContent.trim();
    });

    // Color Picker buttons
    colorPicker.addEventListener('click', (e) => {
      const dot = e.target.closest('.color-dot');
      if (!dot) return;
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      selectedColorInput.value = dot.getAttribute('data-color');
    });
  }

  // --- Toast Notification Helper ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Confetti Animation Canvas System ---
  function triggerConfetti() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    let width = (confettiCanvas.width = window.innerWidth);
    let height = (confettiCanvas.height = window.innerHeight);

    const colors = ['#8B5CF6', '#10B981', '#F97316', '#3B82F6', '#EC4899', '#F59E0B', '#A78BFA'];
    const particles = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 - 40,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.9) * 16,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.35,
        opacity: 1
      });
    }

    let animationFrameId;
    function renderFrame() {
      ctx.clearRect(0, 0, width, height);
      let aliveCount = 0;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;
        p.opacity -= 0.008;

        if (p.opacity > 0 && p.y < height + 50) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      });

      if (aliveCount > 0) {
        animationFrameId = requestAnimationFrame(renderFrame);
      } else {
        ctx.clearRect(0, 0, width, height);
        cancelAnimationFrame(animationFrameId);
      }
    }

    renderFrame();
  }

  // --- Run on DOM Ready ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
