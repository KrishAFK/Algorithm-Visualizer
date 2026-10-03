/* =========================================================
   Algorithm Visualizer - main.js
   Sorting: Bubble, Selection, Insertion, Merge, Quick, Heap
   Searching: Linear, Binary
   ========================================================= */

"use strict";

/* =========================================================
   DOM References
   ========================================================= */

const els = {
    algorithm: document.getElementById("algorithm"),
    arraySize: document.getElementById("arraySize"),
    arraySizeValue: document.getElementById("arraySizeValue"),
    speed: document.getElementById("speed"),
    speedValue: document.getElementById("speedValue"),
    generateBtn: document.getElementById("generateBtn"),
    startBtn: document.getElementById("startBtn"),
    resetBtn: document.getElementById("resetBtn"),
    container: document.getElementById("arrayContainer"),
    comparisons: document.getElementById("comparisons"),
    swaps: document.getElementById("swaps"),
    steps: document.getElementById("steps"),
    status: document.getElementById("status"),
    title: document.getElementById("algorithmTitle"),
    description: document.getElementById("algorithmDescription"),
    best: document.getElementById("bestComplexity"),
    average: document.getElementById("averageComplexity"),
    worst: document.getElementById("worstComplexity"),
    space: document.getElementById("spaceComplexity"),
};

/* =========================================================
   Algorithm Metadata
   ========================================================= */

const ALGORITHM_INFO = {
    bubble: {
        title: "Bubble Sort",
        type: "sort",
        description:
            "Repeatedly compares adjacent elements and swaps them if they are in the wrong order. After each pass, the largest remaining element bubbles up to its final position.",
        best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)",
    },
    selection: {
        title: "Selection Sort",
        type: "sort",
        description:
            "Repeatedly finds the smallest element in the unsorted part of the array and swaps it into the next position of the sorted part.",
        best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)",
    },
    insertion: {
        title: "Insertion Sort",
        type: "sort",
        description:
            "Builds the sorted array one element at a time by taking the next element and inserting it into its correct place among the elements before it.",
        best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)",
    },
    merge: {
        title: "Merge Sort",
        type: "sort",
        description:
            "A divide and conquer algorithm that splits the array in half, recursively sorts each half, and then merges the two sorted halves back together.",
        best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)",
    },
    quick: {
        title: "Quick Sort",
        type: "sort",
        description:
            "Picks a pivot element and partitions the array so smaller elements come before it and larger ones after it, then recursively sorts both sides.",
        best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)",
    },
    heap: {
        title: "Heap Sort",
        type: "sort",
        description:
            "Builds a max heap from the array, then repeatedly moves the largest element (the root) to the end and restores the heap property on the remaining elements.",
        best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)",
    },
    linear: {
        title: "Linear Search",
        type: "search",
        description:
            "Checks every element one by one from the start of the array until the target value is found or the end is reached. Works on unsorted data.",
        best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(1)",
    },
    binary: {
        title: "Binary Search",
        type: "search",
        description:
            "Requires a sorted array. Repeatedly compares the target with the middle element and discards the half that cannot contain it.",
        best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)",
    },
};

/* =========================================================
   Speed Settings
   ========================================================= */

const SPEED_LABELS = { 1: "Very Slow", 2: "Slow", 3: "Medium", 4: "Fast", 5: "Very Fast" };
const SPEED_DELAYS = { 1: 500, 2: 200, 3: 80, 4: 25, 5: 4 }; // milliseconds

/* =========================================================
   State
   ========================================================= */

let array = [];          // Current working array
let originalArray = [];  // Copy used by the Reset button
let bars = [];           // Bar DOM elements (same order as array)
let isRunning = false;
let runId = 0;           // Incremented to cancel any running animation

const stats = { comparisons: 0, swaps: 0, steps: 0 };

// Thrown inside a running algorithm when the user presses Reset
class CancelError extends Error {}

/* =========================================================
   Utility Functions
   ========================================================= */

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDelay() {
    return SPEED_DELAYS[els.speed.value];
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Waits for the current speed delay. If Reset was pressed while waiting,
 * throws a CancelError so the running algorithm stops immediately.
 */
async function pause() {
    const id = runId;
    await sleep(getDelay());
    if (id !== runId) throw new CancelError();
}

function setStatus(text) {
    els.status.textContent = text;
}

function updateStats() {
    els.comparisons.textContent = stats.comparisons;
    els.swaps.textContent = stats.swaps;
    els.steps.textContent = stats.steps;
}

function resetStats() {
    stats.comparisons = 0;
    stats.swaps = 0;
    stats.steps = 0;
    updateStats();
}

function isSearch() {
    return ALGORITHM_INFO[els.algorithm.value].type === "search";
}

function isSorted(arr) {
    for (let i = 1; i < arr.length; i++) {
        if (arr[i - 1] > arr[i]) return false;
    }
    return true;
}

/* =========================================================
   Rendering
   ========================================================= */

function generateArray() {
    const size = Number(els.arraySize.value);
    array = Array.from({ length: size }, () => randomInt(5, 100));
    originalArray = [...array];
    renderBars();
    resetStats();
    setStatus("Ready");
}

function renderBars() {
    els.container.innerHTML = "";
    bars = array.map((value) => {
        const bar = document.createElement("div");
        bar.className = "array-bar";
        bar.style.height = `${value}%`;
        bar.title = value;
        els.container.appendChild(bar);
        return bar;
    });
}

function setBarHeight(index) {
    bars[index].style.height = `${array[index]}%`;
    bars[index].title = array[index];
}

function addClass(indices, className) {
    for (const i of indices) {
        if (bars[i]) bars[i].classList.add(className);
    }
}

function removeClass(indices, className) {
    for (const i of indices) {
        if (bars[i]) bars[i].classList.remove(className);
    }
}

function clearBarStates() {
    bars.forEach((bar) => {
        bar.classList.remove("comparing", "swapping", "sorted", "active");
        bar.style.opacity = "";
    });
}

/* =========================================================
   Core Animated Operations
   ========================================================= */

/** Compares two values (highlighting bars at idxA and idxB). Returns a - b. */
async function compareValues(a, b, idxA, idxB) {
    stats.comparisons++;
    stats.steps++;
    updateStats();

    addClass([idxA, idxB], "comparing");
    await pause();
    removeClass([idxA, idxB], "comparing");

    return a - b;
}

/** Compares array[i] with array[j]. */
function cmp(i, j) {
    return compareValues(array[i], array[j], i, j);
}

/** Swaps two elements in the array and animates it. */
async function swap(i, j) {
    stats.swaps++;
    stats.steps++;

    [array[i], array[j]] = [array[j], array[i]];
    setBarHeight(i);
    setBarHeight(j);
    updateStats();

    addClass([i, j], "swapping");
    await pause();
    removeClass([i, j], "swapping");
}

/** Overwrites array[index] with a value (used by Merge Sort). Counted as a swap. */
async function write(index, value) {
    stats.swaps++;
    stats.steps++;

    array[index] = value;
    setBarHeight(index);
    updateStats();

    addClass([index], "swapping");
    await pause();
    removeClass([index], "swapping");
}

/** Green sweep across the whole array once sorting has finished. */
async function finishSweep() {
    const id = runId;
    const delay = Math.min(getDelay(), 15);
    for (let i = 0; i < bars.length; i++) {
        bars[i].classList.add("sorted");
        await sleep(delay);
        if (id !== runId) throw new CancelError();
    }
}

/* =========================================================
   Sorting Algorithms
   ========================================================= */

async function bubbleSort() {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            if ((await cmp(j, j + 1)) > 0) {
                await swap(j, j + 1);
                swapped = true;
            }
        }
        addClass([n - i - 1], "sorted");
        if (!swapped) break; // Already sorted
    }
}

async function selectionSort() {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        addClass([minIndex], "active");

        for (let j = i + 1; j < n; j++) {
            if ((await cmp(j, minIndex)) < 0) {
                removeClass([minIndex], "active");
                minIndex = j;
                addClass([minIndex], "active");
            }
        }

        removeClass([minIndex], "active");
        if (minIndex !== i) await swap(i, minIndex);
        addClass([i], "sorted");
    }
}

async function insertionSort() {
    const n = array.length;
    for (let i = 1; i < n; i++) {
        let j = i;
        while (j > 0 && (await cmp(j - 1, j)) > 0) {
            await swap(j - 1, j);
            j--;
        }
    }
}

async function mergeSort() {
    async function merge(left, mid, right) {
        const leftPart = array.slice(left, mid + 1);
        const rightPart = array.slice(mid + 1, right + 1);
        let i = 0, j = 0, k = left;

        while (i < leftPart.length && j < rightPart.length) {
            const result = await compareValues(
                leftPart[i], rightPart[j], left + i, mid + 1 + j
            );
            if (result <= 0) {
                await write(k++, leftPart[i++]);
            } else {
                await write(k++, rightPart[j++]);
            }
        }
        while (i < leftPart.length) await write(k++, leftPart[i++]);
        while (j < rightPart.length) await write(k++, rightPart[j++]);
    }

    async function sort(left, right) {
        if (left >= right) return;
        const mid = Math.floor((left + right) / 2);
        await sort(left, mid);
        await sort(mid + 1, right);
        await merge(left, mid, right);
    }

    await sort(0, array.length - 1);
}

async function quickSort() {
    async function partition(low, high) {
        addClass([high], "active"); // Pivot
        let i = low - 1;

        for (let j = low; j < high; j++) {
            if ((await cmp(j, high)) < 0) {
                i++;
                if (i !== j) await swap(i, j);
            }
        }

        if (i + 1 !== high) await swap(i + 1, high);
        removeClass([high], "active");
        addClass([i + 1], "sorted");
        return i + 1;
    }

    async function sort(low, high) {
        if (low < high) {
            const pivotIndex = await partition(low, high);
            await sort(low, pivotIndex - 1);
            await sort(pivotIndex + 1, high);
        } else if (low === high) {
            addClass([low], "sorted");
        }
    }

    await sort(0, array.length - 1);
}

async function heapSort() {
    const n = array.length;

    async function heapify(size, root) {
        while (true) {
            let largest = root;
            const left = 2 * root + 1;
            const right = 2 * root + 2;

            if (left < size && (await cmp(left, largest)) > 0) largest = left;
            if (right < size && (await cmp(right, largest)) > 0) largest = right;

            if (largest === root) return;
            await swap(root, largest);
            root = largest;
        }
    }

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(n, i);
    }

    // Extract elements one by one
    for (let end = n - 1; end > 0; end--) {
        await swap(0, end);
        addClass([end], "sorted");
        await heapify(end, 0);
    }
    addClass([0], "sorted");
}

/* =========================================================
   Searching Algorithms
   ========================================================= */

async function linearSearch() {
    const targetIndex = randomInt(0, array.length - 1);
    const target = array[targetIndex];
    setStatus(`Looking for ${target}`);
    addClass([targetIndex], "active"); // Show which value we are hunting
    await sleep(Math.max(getDelay(), 300));
    removeClass([targetIndex], "active");

    for (let i = 0; i < array.length; i++) {
        const result = await compareValues(array[i], target, i, i);
        if (result === 0) {
            addClass([i], "sorted");
            return { found: true, index: i, target };
        }
    }
    return { found: false, target };
}

async function binarySearch() {
    const targetIndex = randomInt(0, array.length - 1);
    const target = array[targetIndex];
    setStatus(`Looking for ${target}`);

    let low = 0;
    let high = array.length - 1;

    while (low <= high) {
        // Dim everything outside the current search range
        bars.forEach((bar, i) => {
            bar.style.opacity = i < low || i > high ? "0.2" : "1";
        });

        const mid = Math.floor((low + high) / 2);
        addClass([low, high], "active");
        const result = await compareValues(array[mid], target, mid, mid);
        removeClass([low, high], "active");

        if (result === 0) {
            bars.forEach((bar) => (bar.style.opacity = "1"));
            addClass([mid], "sorted");
            return { found: true, index: mid, target };
        }
        if (result < 0) low = mid + 1;
        else high = mid - 1;
    }

    bars.forEach((bar) => (bar.style.opacity = "1"));
    return { found: false, target };
}

/* =========================================================
   Algorithm Registry
   ========================================================= */

const ALGORITHMS = {
    bubble: bubbleSort,
    selection: selectionSort,
    insertion: insertionSort,
    merge: mergeSort,
    quick: quickSort,
    heap: heapSort,
    linear: linearSearch,
    binary: binarySearch,
};

/* =========================================================
   Controls
   ========================================================= */

function setControlsDisabled(disabled) {
    els.algorithm.disabled = disabled;
    els.arraySize.disabled = disabled;
    els.generateBtn.disabled = disabled;
    els.startBtn.disabled = disabled;
    // Speed slider and Reset stay enabled so they work mid-animation
}

function updateAlgorithmInfo() {
    const info = ALGORITHM_INFO[els.algorithm.value];
    els.title.textContent = info.title;
    els.description.textContent = info.description;
    els.best.textContent = info.best;
    els.average.textContent = info.average;
    els.worst.textContent = info.worst;
    els.space.textContent = info.space;
}

function updateSpeedLabel() {
    els.speedValue.textContent = SPEED_LABELS[els.speed.value];
}

async function startVisualization() {
    if (isRunning) return;

    const algorithmKey = els.algorithm.value;
    const search = isSearch();

    isRunning = true;
    const currentRun = ++runId;
    setControlsDisabled(true);
    resetStats();
    clearBarStates();

    try {
        // Binary search needs sorted data: sort instantly (no animation)
        if (algorithmKey === "binary" && !isSorted(array)) {
            array.sort((a, b) => a - b);
            renderBars();
        }

        setStatus(search ? "Searching..." : "Sorting...");
        const result = await ALGORITHMS[algorithmKey]();

        if (search) {
            setStatus(result.found ? `Found at index ${result.index}` : "Not found");
        } else {
            await finishSweep();
            setStatus("Sorted!");
        }
    } catch (error) {
        if (!(error instanceof CancelError)) {
            console.error(error);
            setStatus("Error");
        }
        // CancelError: Reset already restored the UI
    } finally {
        if (currentRun === runId) {
            isRunning = false;
            setControlsDisabled(false);
        }
    }
}

function resetVisualization() {
    runId++;               // Cancels any running animation
    isRunning = false;
    array = [...originalArray];
    renderBars();
    resetStats();
    setStatus("Ready");
    setControlsDisabled(false);
}

function handleSizeChange() {
    els.arraySizeValue.textContent = els.arraySize.value;
    if (!isRunning) generateArray();
}

function handleAlgorithmChange() {
    updateAlgorithmInfo();
    resetVisualization();
}

/* =========================================================
   Event Listeners
   ========================================================= */

els.algorithm.addEventListener("change", handleAlgorithmChange);
els.arraySize.addEventListener("input", handleSizeChange);
els.speed.addEventListener("input", updateSpeedLabel);
els.generateBtn.addEventListener("click", generateArray);
els.startBtn.addEventListener("click", startVisualization);
els.resetBtn.addEventListener("click", resetVisualization);

/* =========================================================
   Initialise
   ========================================================= */

function init() {
    els.arraySizeValue.textContent = els.arraySize.value;
    updateSpeedLabel();
    updateAlgorithmInfo();
    generateArray();
}

init();
