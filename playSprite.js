
const animationFrameIds = new Map();
const timeoutIds = new Map(); // To store timeout IDs if needed
export function playSprite(canvas, images) {
    startAnimation(canvas, images);
}

function startAnimation(canvas, images) {
    const context = canvas.getContext('2d');
    let loadedImages = [];
    let currentIndex = 0;

    // Cancel any ongoing animation for this canvas
    if (animationFrameIds.has(canvas)) {
        clearTimeout(animationFrameIds.get(canvas));
    }
    if (timeoutIds.has(canvas)) {
        clearTimeout(timeoutIds.get(canvas));
    }

    // Load all images before starting the animation
    function preloadImages(urls) {
        let imagesLoaded = 0;

            const img = new Image();
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded ===1) {
                    console.log('hi')
                    startCycle();  // Call startCycle only when all images are loaded
                }
            };
            img.onerror = (e) => {
                console.error('Error loading image:', urls[0], e);
            };
            img.src = encodeURIComponent(urls[0]);
            loadedImages.push(img);
    }

    // Animation cycle function
    function startCycle() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        const currentImage = loadedImages[currentIndex];
        context.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

        // Increment the index and wrap around if necessary
        currentIndex = (currentIndex + 1) % loadedImages.length;

        // Schedule the next frame
        // const animationTimeoutId = setTimeout(startCycle, 33); // Approximately 33 ms per frame
        // animationFrameIds.set(canvas, animationTimeoutId);
    }

    preloadImages(images); // Start loading images
}