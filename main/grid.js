import {playSprite} from "../playSprite.js";
import {SERVER_URL} from "../config.js";
let canvases = [];

export function createGrid() {
    return new Promise((resolve, reject) => {
        const gridContainer = document.getElementById('canvasGrid');
        const size = window.innerWidth / 21;
        const columns = 21;
        let rows = Math.floor(window.innerHeight / size);
        if (rows % 2 === 0) {
            rows -= 1; // Ensure rows is an odd number
        }
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, ${size}px)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, ${size}px)`;

        for (let i = 0; i < columns * rows; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'canvas-wrapper-grid';

            const canvas = document.createElement('canvas');
            canvas.className = 'grid-canvas';

            const text = document.createElement('div');
            text.className = 'canvas-text';

            wrapper.appendChild(text);
            wrapper.appendChild(canvas);
            gridContainer.appendChild(wrapper);

            canvases.push(canvas); // Assuming canvases is an array you use elsewhere
        }

        sendGridInfoToBackend((columns - 1) * rows)
            .then(() => {
                console.log('Grid info sent successfully');
                resolve(); // Resolve the promise when the grid info is sent
            })
            .catch(error => {
                console.error('Error sending grid info:', error);
                reject(error); // Reject the promise if there is an error
            });
    });
}

async function sendGridInfoToBackend(numVideos) {
    try {
        const response = await fetch(`${SERVER_URL}/grid-info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({numVideos})
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Data received from backend:', data);
    } catch (error) {
        console.error('Error sending grid info to backend:', error);
        throw error; // Re-throw the error to be caught in the createGrid function
    }
}

class AnimationQueue {
    constructor(maxConcurrent) {
        this.queue = [];
        this.maxConcurrent = maxConcurrent;
        this.activeCount = 0;
    }

    enqueue(task) {
        this.queue.push(task);
        this.maybeRun();
    }

    maybeRun() {
        while (this.activeCount < this.maxConcurrent && this.queue.length) {
            const task = this.queue.shift();
            this.activeCount++;
            task().finally(() => {
                this.activeCount--;
                this.maybeRun();
            });
        }
    }
}

export async function initializeAndStartAnimations(data) {

    console.log('INIT STARTING');
    // Preload images grouped by 'person' for both categories
    // const preloadedMostSimilar = await preloadGroupedImages(data.mostSimilar, 'Most Similar');
    // // const preloadedLeastSimilar = await preloadGroupedImages(data.leastSimilar, 'Least Similar');
    //
    // // Return arrays of preloaded images for each 'person' in both categories
    // return {preloadedMostSimilar, preloadedLeastSimilar};
    const leftCanvas = document.getElementById('left-canvas');
    const rightCanvas = document.getElementById('right-canvas');

    // Start animations for the left and right canvases
    // const animationQueue = new AnimationQueue(50); // Control the number of simultaneous animations

    playSprite(leftCanvas, data.leastSimilar[0].path);
    playSprite(rightCanvas, data.mostSimilar[0].path);

    const gridContainer = document.getElementById('canvasGrid');
    const columns = 21; // Assuming 21 columns
    const rows = Math.floor(gridContainer.children.length / columns);
    const middleRowIndex = Math.floor(rows / 2);
    const middleColumnIndex = Math.floor(columns / 2);

    const canvasGrid = [];
    for (let i = 0; i < gridContainer.children.length; i++) {
        const row = Math.floor(i / columns);
        const col = i % columns;
        if (!canvasGrid[row]) {
            canvasGrid[row] = [];
        }
        const wrapper = gridContainer.children[i];
        canvasGrid[row][col] = wrapper.querySelector('.grid-canvas');
        wrapper.querySelector('.canvas-text').textContent = ''; // Clear initial text
    }

    // Determine the index for each canvas based on its distance from the middle
    const positions = [];
    canvasGrid.forEach((row, rowIndex) => {
        row.forEach((canvas, colIndex) => {
            const distanceToMiddle = Math.abs(rowIndex - middleRowIndex) + Math.abs(colIndex - middleColumnIndex);
            positions.push({
                canvas,
                textElement: gridContainer.children[rowIndex * columns + colIndex].querySelector('.canvas-text'),
                distance: distanceToMiddle,
                rowIndex,
                colIndex
            });
        });
    });

    // Sort positions by distance to middle
    positions.sort((a, b) => {
        if (a.distance === b.distance) {
            return Math.abs(a.rowIndex - middleRowIndex) - Math.abs(b.rowIndex - middleRowIndex);
        }
        return a.distance - b.distance;
    });

    // Assign paths to positions, ensuring each path is used only once
    let leastSimilarIndex = 0;
    let mostSimilarIndex = 0;
    positions.forEach((pos, idx) => {
        const isLeftSide = pos.colIndex < middleColumnIndex;
        const imageSet = isLeftSide ? data.leastSimilar : data.mostSimilar;
        const index = isLeftSide ? leastSimilarIndex++ : mostSimilarIndex++;
        const path = imageSet[index % imageSet.length].path;
        pos.textElement.textContent = (index + 1).toString(); // Update the text content

        // Enqueue the animation
        playSprite(pos.canvas, path)
    });
}

// async function preloadGroupedImages(imageGroups) {
//     return Promise.all(imageGroups.map(async (group, index) => {
//         console.log(`Preloading Images for Person ${index + 1}:`);
//         const paths = group.path;
//         return Promise.all(paths.map(path => preloadImage(encodeURIComponent(path))));
//     }));
// }
// function preloadImage(path) {
//     return new Promise((resolve, reject) => {
//         const img = new Image();
//         img.src = path; // Assuming these paths are directly usable as image sources
//         img.onload = () => {
//             console.log(`Image preloaded: ${path}`);
//             resolve(path);
//         };
//         img.onerror = () => {
//             console.error(`Error loading image: ${path}`);
//             reject(`Error loading image: ${path}`);
//         };
//     });
// }