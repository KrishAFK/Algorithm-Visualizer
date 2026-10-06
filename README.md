# Algorithm Visualizer

An interactive web app that visualizes sorting and searching algorithms step by step. Watch how each algorithm works in real time, control the speed and array size, and compare algorithms using live statistics and complexity information.

**🔗 Live Demo:** [https://algorithmvisualizer3.netlify.app/](https://algorithmvisualizer3.netlify.app/)

<img width="700" height="443" alt="image" src="https://github.com/user-attachments/assets/9ab7dcee-4b89-49b4-a2f3-7ba70e205ea9" />
---

## Table of Contents

- [Features](#features)
- [Supported Algorithms](#supported-algorithms)
- [User Guide](#user-guide)
- [Colour Legend](#colour-legend)
- [Technical Overview](#technical-overview)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [How the Animation Engine Works](#how-the-animation-engine-works)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

- **8 algorithms**: 6 sorting and 2 searching, each animated step by step
- **Adjustable array size**: from 10 to 100 elements
- **Adjustable speed**: 5 levels, from Very Slow to Very Fast, changeable even while an algorithm is running
- **Live statistics**: comparisons, swaps/writes, total steps and current status
- **Complexity panel**: best, average and worst case time complexity plus space complexity for the selected algorithm
- **Algorithm descriptions**: a short explanation of how each algorithm works
- **Instant reset**: cancel a running animation at any time and restore the original array
- **Colour-coded bars**: see exactly which elements are being compared, swapped, or already sorted
- **Responsive design**: works on desktop, tablet and mobile
- **No dependencies**: built with plain HTML, CSS and JavaScript

---

## Supported Algorithms

### Sorting

| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) |

### Searching

| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Linear Search | O(1) | O(n) | O(n) | O(1) |
| Binary Search | O(1) | O(log n) | O(log n) | O(1) |

---

## User Guide

### Getting Started

1. Open the [live demo](https://algorithmvisualizer3.netlify.app/).
2. Choose an algorithm from the **Algorithm** dropdown.
3. Adjust the **Array Size** and **Speed** sliders to your preference.
4. Click **▶ Start** to begin the visualization.

### Controls

| Control | What it does |
|---------|--------------|
| **Algorithm** | Selects the sorting or searching algorithm. Updates the description and complexity panel. |
| **Array Size** | Sets the number of bars (10–100). Generates a new array when changed. |
| **Speed** | Sets the animation speed (Very Slow → Very Fast). Can be changed during a run. |
| **Generate Array** | Creates a new random array. |
| **▶ Start** | Runs the selected algorithm on the current array. |
| **↻ Reset** | Stops any running animation and restores the original, unsorted array. |

> While an algorithm is running, the Algorithm, Array Size, Generate and Start controls are locked. Only **Speed** and **Reset** stay active.

### Statistics Panel

| Stat | Meaning |
|------|---------|
| **Comparisons** | Number of times two elements were compared |
| **Swaps** | Number of swaps (or array writes, for Merge Sort) |
| **Steps** | Total number of animated operations |
| **Status** | Current state: Ready, Sorting..., Searching..., Sorted!, Found at index X, etc. |

### Using the Searching Algorithms

- **Linear Search** and **Binary Search** pick a random value from the array as the target. The target is briefly highlighted (Linear Search) and shown in the status card.
- **Binary Search** requires sorted data, so the array is sorted instantly when you press Start. Bars outside the current search range fade out so you can watch the range shrink.
- When the target is found, its bar turns green and the status shows its index.

---

## Colour Legend

| Colour | Meaning |
|--------|---------|
| 🔵 Blue | Default, untouched element |
| 🟡 Yellow | Elements currently being compared |
| 🔴 Red | Elements being swapped or overwritten |
| 🟣 Purple | Special marker: pivot (Quick Sort), current minimum (Selection Sort), search bounds (Binary Search), target preview (Linear Search) |
| 🟢 Green | Sorted element, or the found search result |

---

## Technical Overview

### Tech Stack

- **HTML5**: semantic page structure
- **CSS3**: custom properties (CSS variables), Flexbox, Grid, media queries
- **JavaScript (ES6+)**: `async/await`, classes, arrow functions, destructuring
- **Hosting**: Netlify

### Architecture

The app is a single-page application with three layers:

1. **Presentation (`index.html`, `style.css`)**: layout, controls, the bar container and info panels. Bar states (`comparing`, `swapping`, `sorted`, `active`) are CSS classes toggled by JavaScript.
2. **State & rendering (`main.js`)**: holds the working array, the original array (for Reset), bar DOM elements and statistics. Bars are created once per array and updated in place by changing their `height`.
3. **Algorithm engine (`main.js`)**: each algorithm is an `async` function built on a small set of animated primitives (`cmp`, `compareValues`, `swap`, `write`). A registry object maps dropdown values to functions.

### Design Decisions

- **Animation primitives**: algorithms never touch the DOM directly. They call `cmp`, `swap` and `write`, which update the array, the stats and the bar styles, then pause. This keeps every algorithm short and close to its textbook form.
- **Cancellation via run IDs**: each run gets an incrementing `runId`. After every pause, the function checks that its ID is still current. If the user pressed Reset, a `CancelError` is thrown, which unwinds the entire (possibly deeply recursive) algorithm instantly with no leftover timers.
- **Live speed changes**: the delay is read from the slider on every pause, so speed changes take effect immediately.
- **Merge Sort writes**: because Merge Sort overwrites positions rather than swapping, each overwrite is counted in the Swaps statistic.
- **Binary Search preparation**: the array is sorted without animation before the search, since the focus is on the search itself.
- **Data-driven UI**: algorithm names, descriptions and complexities live in a single `ALGORITHM_INFO` object, so adding an algorithm only requires one metadata entry and one function.

---

## Project Structure

```
algorithm-visualizer/
├── index.html          # Page structure and controls
├── css/
│   └── style.css       # Styling, theme variables, responsive layout
├── js/
│   └── main.js         # State, rendering, algorithms, event handling
├── screenshots/
│   └── preview.png     # (optional) Screenshot for this README
└── README.md
```

---

## Deployment

The site is deployed on **Netlify** as a static site:

- **Build command:** none
- **Publish directory:** project root
- Every push to the `main` branch triggers an automatic redeploy.

---

## How the Animation Engine Works

A simplified view of how an algorithm such as Bubble Sort is written:

```javascript
async function bubbleSort() {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if ((await cmp(j, j + 1)) > 0) {   // highlights, counts, pauses
                await swap(j, j + 1);          // swaps, redraws, pauses
            }
        }
        addClass([n - i - 1], "sorted");
    }
}
```

Each `await` pauses for the current speed delay, which is what turns the algorithm into a step-by-step animation.

### Adding a New Algorithm

1. Add an entry to `ALGORITHM_INFO` (title, type, description, complexities).
2. Write an `async` function using `cmp`, `swap` and/or `write`.
3. Register it in the `ALGORITHMS` object.
4. Add an `<option>` to the dropdown in `index.html`.

---

## Future Improvements

- Pause / resume and step-by-step (next/previous) controls
- Pseudocode panel with line-by-line highlighting
- Sound effects based on bar values
- More algorithms (Shell Sort, Counting Sort, Radix Sort, DFS/BFS, Dijkstra)
- Custom array input
- Side-by-side algorithm comparison
- Light/dark theme toggle

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Author

**Your Name**
[GitHub](https://github.com/YOUR-USERNAME) · [LinkedIn](https://www.linkedin.com/in/YOUR-PROFILE)
