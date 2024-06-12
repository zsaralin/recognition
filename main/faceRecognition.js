import {SERVER_URL} from "../config.js";
import {currFace} from "./newFaces.js";
import {initializeAndStartAnimations} from './grid.js'
let sendInterval = null;
const MAX_RETRIES = 100; // Maximum number of retries


export async function sendImageDataToBackend(retries = 0) {
    try {
        const response = await fetch(`${SERVER_URL}/get-matches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: currFace, numVids: 10 })
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.log('No face detected, retrying...');
                if (retries < MAX_RETRIES) {
                    setTimeout(() => sendImageDataToBackend(retries + 1), 1000);
                } else {
                    console.log('Max retries reached. No face detected.');
                }
                return;
            } else {
                console.error(`HTTP error! status: ${response.status}`);
                return;
            }
        }

        const data = await response.json();
        if (!isValidData(data)) {
            console.error('Invalid data received from backend.');
        } else {
            initializeAndStartAnimations(data)
        }
    } catch (error) {
        console.error('Unexpected error sending image data to backend:', error);
        if (retries < MAX_RETRIES) {
            setTimeout(() => sendImageDataToBackend(retries + 1), 1000);
        } else {
            console.error('Max retries reached. Cannot send data to backend.');
        }
    }
}

function isValidData(data) {
    // Implement your logic to check if the data is valid
    // For example:
    return data && data.mostSimilar && data.leastSimilar;
}