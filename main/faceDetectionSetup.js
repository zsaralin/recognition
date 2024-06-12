import {FaceDetector, FilesetResolver, FaceLandmarker}  from '../internal_cdn/package0/vision_bundle.mjs'
export let faceLandmarker; export let faceDetector; export let optionsTinyFaceDetector;

export async function setupFaceLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
        "./internal_cdn/package0/wasm"
    );


    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `./internal_cdn/face_landmarker.task`,
            delegate: "GPU",
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
    });

}

export async function setupFaceDetector() {
    const vision = await FilesetResolver.forVisionTasks(
        "./internal_cdn/package0/wasm"

    );

    faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:`./internal_cdn/blaze_face_short_range.tflite`,
            delegate: "GPU",
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1
    });

}