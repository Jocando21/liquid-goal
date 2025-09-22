# Liquid Goal

A lightweight vanilla JavaScript library for creating animated **liquid-style progress goals** with inertia, turbulence, and parallax effects.  
Perfect for stream widgets, dashboards, or gamified UIs.

---

## ✨ Features

- Realistic liquid simulation (two layers with parallax).
- Configurable turbulence, wave size, lumps (clumps), X flow speed, back wave lift.
- Gradient fill with custom angle.
- Smooth inertia-based progress transitions.
- 100% vanilla JavaScript (no dependencies).
- Works with any container size, retina-ready.

---

## 📦 Installation

Clone the repo or copy the library file:

```bash
git clone https://github.com/Jocando21/liquid-goal.git
```

Import the library into your project:

```html
<script type="module"> import LiquidGoal from 'https://cdn.jsdelivr.net/gh/Jocando21/liquid-goal@latest/liquid-goal.js';</script>
```

---

## 🚀 Usage Example

HTML:
```html
<div id="goalBox"></div>
```

JS:
```js
import LiquidGoal from 'https://cdn.jsdelivr.net/gh/Jocando21/liquid-goal@latest/liquid-goal.js';

const goal = new LiquidGoal(document.getElementById('goalBox'), {
  goal: 100,
  value: 0,
  turbulence: 1.0,
  wave: 1.0,
  lumps: 0.6,
  xspeed: 30,
  parallax: 0.35,
  backLift: 10,
  gradientFrom: '#7a0a10',
  gradientTo: '#3a0003',
  gradientAngle: 90,
  radius: 22,
  norm100: 1.2
});

// Update progress
goal.updateProgress(20);

// Set absolute progress
goal.setProgress(50);

// Change options on the fly
goal.setOptions({ xspeed: 60, gradientFrom: '#aa0000' });

// Get displayed % (0–100, normalized)
console.log(goal.getDisplayedPercent());
```

---

## 🧩 API

- `new LiquidGoal(container, options)` → create instance.
- `setGoal(n)` → set goal value.
- `setProgress(v)` → set absolute progress.
- `updateProgress(d)` → add/subtract progress.
- `setOptions({ ... })` → update settings dynamically.
- `getDisplayedPercent()` → returns current % (normalized).
- `play()` / `pause()` → control animation loop.
- `destroy()` → cleanup and remove listeners.

---

## 🖥 Demo

Check the <a href="https://jocando21.github.io/liquid-goal/" target="_blank">live demo on GitHub Pages</a>.



