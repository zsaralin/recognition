import {faceDetector, faceLandmarker, optionsTinyFaceDetector} from "./faceDetectionSetup.js";
import {setCurrFace} from "./newFaces.js";

let mediapipeResult;
const BOX_HEIGHT = 220; // Fixed height of the box
const BOX_WIDTH = 220; // Fixed width of the box
let lastX = 0;
let lastY = 0;
const smoothingFactor = 0.05; // Determines the amount of smoothing

export async function startFaceDetection(video) {
    if (!video || video.paused) return false;
    const canvas = document.getElementById('user-canvas');
    canvas.width = canvas.height = Math.min(canvas.height, canvas.width);
    const context = canvas.getContext('2d');

    let lastCaptureTime = 0;
    const captureInterval = 500; // 5000 milliseconds = 5 seconds

    async function detectAndDraw() {
        requestAnimationFrame(detectAndDraw); // Move it to the beginning for more accurate timing
        const currentTime = performance.now();

        const mediapipeResult = await faceDetector.detectForVideo(video, currentTime);
        if (mediapipeResult && mediapipeResult.detections && mediapipeResult.detections.length > 0) {
            const bb = mediapipeResult.detections[0].boundingBox;

            // Calculate the midpoint of the bounding box
            const midX = bb.originX + bb.width / 2;
            const midY = bb.originY + bb.height / 2;

            // Apply smoothing to the midpoint coordinates (assuming lastX, lastY, and smoothingFactor are defined)
            const smoothedX = lastX + smoothingFactor * (midX - lastX);
            const smoothedY = lastY + smoothingFactor * (midY - lastY);
            lastX = smoothedX;
            lastY = smoothedY;

            // Calculate the top-left source coordinates based on the smoothed midpoint
            let srcX = smoothedX - BOX_WIDTH / 2;
            let srcY = smoothedY - BOX_HEIGHT / 2;

            // Adjust srcX and srcY to prevent the box from moving out of the video frame
            srcX = Math.max(0, Math.min(srcX, video.videoWidth - BOX_WIDTH));
            srcY = Math.max(0, Math.min(srcY, video.videoHeight - BOX_HEIGHT));

            // Clear the canvas before redrawing
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the specified portion of the video on the entire canvas
            context.drawImage(video, srcX, srcY, BOX_WIDTH, BOX_HEIGHT, 0, 0, canvas.width, canvas.height);

            // Capture the canvas to a data URL every 5 seconds
            if (currentTime - lastCaptureTime >= captureInterval) {
                const imageDataURL = canvas.toDataURL('image/jpeg'); // Adjust quality as needed
                setCurrFace(mediapipeResult, imageDataURL);
                lastCaptureTime = currentTime; // Reset the timer
            }
        } else {
            setCurrFace(null);
        }
    }

    detectAndDraw(); // Start the drawing loop
}