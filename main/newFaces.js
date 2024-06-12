import {sendImageDataToBackend} from "./faceRecognition.js";

export let currFace = null;
let noFaceCounter = 0; // Counter for consecutive frames with no face detected
export function setCurrFace(mediapipeResult, imageDataUrl) {
    if (mediapipeResult && mediapipeResult.detections.length > 0) {
        noFaceCounter = 0; // Reset counter if a face is detected
        updateFaceDetection(imageDataUrl);
    } else {
        noFaceCounter++;
        if (noFaceCounter >= 10) {
            currFace = null;
            console.log('No face detected for 50 consecutive frames, resetting currFace.');
        }
    }
}

function updateFaceDetection(imageDataUrl) {
    const isNewFace = !currFace;
    if (isNewFace && imageDataUrl) {
        console.log('New face detected');
        currFace = imageDataUrl;
        sendImageDataToBackend();
    } else {
        currFace = imageDataUrl;
    }
}
