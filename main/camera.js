import {startFaceDetection} from "./faceDetection.js";
import {setupFaceDetector, setupFaceLandmarker} from "./faceDetectionSetup.js";
import {createGrid} from "./grid.js";

document.addEventListener('DOMContentLoaded', function () {

    const video = document.getElementById('video');
    const canvas = document.getElementById('user-canvas');
    const container = document.getElementById('canv-container');
    const leftcanv = document.getElementById('left-canvas');
    const rightcanv = document.getElementById('right-canvas');

    // Access user's webcam
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({video: true})
            .then(function (stream) {
                video.srcObject = stream;
                video.play();
                video.onplay = async () => {
                    await setupFaceDetector();
                    createGrid().then(() => {
                        startFaceDetection(video);
                    })

                };
            })
            .catch(function (error) {
                console.log("Something went wrong!", error);
            });
    } else {
        alert('Your browser does not support video capture, or this device does not have a camera');
    }

    var size = window.innerWidth / 7;
    const wrappers = document.querySelectorAll('.canvas-wrapper');

    wrappers.forEach(wrapper => {
        wrapper.style.width = size + 'px';
        wrapper.style.height = size + 'px';
    });

    const canvases = document.querySelectorAll('.canvas-wrapper canvas');
    canvases.forEach(canvas => {
        canvas.width = size;  // Set width and height as integer values
        canvas.height = size;
    });
})