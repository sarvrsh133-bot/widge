# ✨ Daily Habit Tracker

A modern, responsive, and delightful web application designed to help users track and cultivate daily positive routines with an aesthetic pastel dashboard.

---

## 🌟 Key Features

1. **Add & Edit Daily Habits**:
   - Create habits with custom names, categories (Health, Fitness, Learning, Mindfulness, Productivity), target goals, icons, and pastel colors.
   - Edit existing habits on the fly.

2. **Mark Habits Completed**:
   - Custom animated pastel checkboxes with interactive sound feedback (Web Audio API) and visual strikethrough.
   - Automatically tracks daily completion status and streaks.

3. **Dynamic Progress Visualizations**:
   - Real-time animated linear gradient progress bar.
   - Circular SVG radial completion ring with live completion fractions (e.g. `3/4`).
   - Dynamic status badges: *"Ready to Start"*, *"Building Momentum"*, *"Almost There! 🔥"*, *"All Done! 🎉"*.
   - Celebration Confetti explosion when all habits are 100% completed.

4. **Sample Starter Habits**:
   - Pre-loaded with starter habits:
     - 📖 **Reading 20 pages** (*Learning*)
     - 🏃 **Daily Exercise & Stretch** (*Fitness*)
     - 💧 **Drink 8 Glasses of Water** (*Health*)
     - 📚 **Study & Focused Deep Work** (*Productivity*)
   - Dedicated "Samples" button to restore starter templates anytime.

5. **Motivational Quote of the Day**:
   - Displays an inspiring quote that rotates upon every page refresh.
   - Includes a shuffle button to cycle through quotes on demand.

6. **Full Local Storage Persistence**:
   - Habits, checkboxes, daily streak counters, sound preferences, and theme choices are automatically stored in the browser's `localStorage`.
   - Date-rollover detection: preserves current progress across reloads and intelligently refreshes checkmarks for fresh calendar days while maintaining consistency streaks.

7. **Aesthetic Pastel Design & Responsiveness**:
   - Custom pastel palette (Lavender, Mint, Peach, Sky Blue, Rose, Butter).
   - Light and Calm Dark Mode toggles.
   - Fully responsive on mobile, tablet, and desktop devices.
   - Zero external library dependencies for core features (runs offline, zero CDN latency, SVG inline icons, Web Audio chimes, HTML5 Canvas confetti).

---

## 📁 File Structure

```
daily-habit-tracker/
├── index.html        # Clean semantic HTML5 dashboard layout & accessible modal dialogs
├── styles.css        # Pastel styling system, custom CSS properties, micro-animations, responsive rules
├── app.js            # Modular JavaScript for state management, localStorage, audio, and UI updates
├── test_e2e.py       # Automated Playwright test suite for headless browser verification
├── screenshots/      # Verified visual captures (desktop, tablet, mobile, dark mode)
└── README.md         # Documentation and guide
```

---

## 🚀 How to Run

### Method 1: Direct File Open
Simply double-click `index.html` or open it directly in any modern browser (Chrome, Edge, Safari, Firefox):
```text
file:///C:/Users/SARWESH/.gemini/antigravity/scratch/daily-habit-tracker/index.html
```

### Method 2: Local HTTP Server
Using Python (or `uv`):
```powershell
cd C:\Users\SARWESH\.gemini\antigravity\scratch\daily-habit-tracker
uv run python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

---

## 🧪 Verification & Testing

The project has been tested with an end-to-end headless browser test suite (`test_e2e.py`) verifying:
- ✅ Page load and initial sample habits rendering
- ✅ Motivational quote rotation on refresh and shuffle
- ✅ Checkbox toggle, streak calculation, and progress bar updates
- ✅ All-completed milestone celebration (100% completion)
- ✅ Adding, editing, and deleting habits with modals
- ✅ Search input filtering and category tab filters
- ✅ Persistence in `localStorage` across page reload
- ✅ Dark/Light mode theme switching
- ✅ Mobile (375px), Tablet (768px), and Desktop (1280px) responsiveness
- ✅ Zero console errors or unhandled exceptions
