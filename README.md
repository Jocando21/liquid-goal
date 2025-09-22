# Liquid Goal

A lightweight vanilla JavaScript library for creating animated **liquid-style progress goals** with inertia, turbulence, bubbles, and parallax effects.  
Perfect for stream widgets, dashboards, or gamified UIs.

---

## ✨ Features

- Realistic liquid simulation (two layers with parallax).
- Configurable turbulence, wave size, lumps (clumps), X flow speed, back wave lift.
- Gradient fill with custom angle or fully transparent background.
- Smooth inertia-based progress transitions.
- Event system (`progress`, `valueChanged`, `goalReached`, `animationStep`).
- Extra methods: `reset`, `jumpTo`, `animateTo`, `toDataURL`, `getState`, `setState`.
- Optional bubble system (size, speed, drift, rate, alpha, color).
- 100% vanilla JavaScript (no dependencies).
- Works with any container size, retina-ready.

---

## 📦 Installation

Clone the repo or copy the library file:

```bash
git clone https://github.com/Jocando21/liquid-goal.git
````

Import the library into your project:

```html
<script type="module">
  import LiquidGoal from 'https://cdn.jsdelivr.net/gh/Jocando21/liquid-goal@latest/liquid-goal.js';
</script>
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
  norm100: 1.2,
  background: { type: 'none' },
  bubbles: { enabled: true, rate: 12, minR: 2, maxR: 5 }
});

// Update progress
goal.updateProgress(20);

// Set absolute progress
goal.setProgress(50);

// Animate smoothly
goal.animateTo(80, 1.2);

// Reset
goal.reset();

// Events
goal.el.addEventListener("progress", e => console.log("progress:", e.detail));
goal.el.addEventListener("goalReached", () => console.log("🎉 Goal reached"));
```

---

## 🧩 API

**Core**

* `new LiquidGoal(container, options)` → create instance.
* `setGoal(n)` → set goal value.
* `setProgress(v)` → set absolute progress.
* `updateProgress(d)` → add/subtract progress.
* `setOptions({ ... })` → update settings dynamically.
* `getDisplayedPercent()` → returns current % (normalized).

**Control**

* `reset()` → reset to 0.
* `jumpTo(v)` → jump instantly to value.
* `animateTo(v, duration)` → animate progress to value.
* `play()` / `pause()` / `togglePause()` → control loop.
* `destroy()` → cleanup.

**State**

* `getState()` → return snapshot `{goal, value, percent, level, velocity}`.
* `setState(obj)` → restore from snapshot.
* `toDataURL(type, quality)` → export canvas as image.

**Events**

* `"progress"` → fired each frame progress changes `{value, percent}`.
* `"valueChanged"` → fired when setProgress/updateProgress called.
* `"goalReached"` → fired when reaching 100%.
* `"animationStep"` → fired each frame `{dt, time}`.

**Options**

* `goal`, `value`, `turbulence`, `wave`, `lumps`, `xspeed`, `parallax`, `backLift`, `gradientFrom`, `gradientTo`, `gradientAngle`, `radius`, `norm100`.
* `background`: `{ type: 'none' | 'solid' | 'linear', ... }`.
* `bubbles`: `{ enabled, rate, minR, maxR, minVy, maxVy, drift, alpha, color }`.

---

## 🖥 Demo

Check the <a href="https://jocando21.github.io/liquid-goal/" target="_blank">live demo on GitHub Pages</a>.