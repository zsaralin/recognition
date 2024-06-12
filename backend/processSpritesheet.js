const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

async function processSpriteSheets(rootDirectory) {
    const directories = await fs.readdir(rootDirectory, { withFileTypes: true });
    for (const directory of directories) {
        if (directory.isDirectory()) {
            const dirPath = path.join(rootDirectory, directory.name, "spritesheet");
            await extractAndSaveImagesFromSprite(dirPath);
        }
    }
}
async function extractAndSaveImagesFromSprite(directoryPath) {
    try {
        const files = await fs.readdir(directoryPath);
        if (files.length !== 1) {
            console.log(`Unexpected number of files in ${directoryPath}. Expected exactly one file.`);
            return;
        }
        const spriteSheetFileName = files[0];
        const spriteSheetPath = path.join(directoryPath, spriteSheetFileName);

        const image = await loadImage(spriteSheetPath);
        const imageSize = 100; // Assuming each sprite's height and width is 100 pixels
        const numColumns = Math.floor(image.width / imageSize);
        const numRows = Math.floor(image.height / imageSize);
        const canvas = createCanvas(imageSize, imageSize);
        const ctx = canvas.getContext('2d');

        const imagesFolderPath = path.join(directoryPath, '../images');
        await fs.ensureDir(imagesFolderPath);

        for (let y = 0; y < numRows * imageSize; y += imageSize) {
            for (let x = 0; x < numColumns * imageSize; x += imageSize) {
                ctx.clearRect(0, 0, imageSize, imageSize);
                ctx.drawImage(image, x, y, imageSize, imageSize, 0, 0, imageSize, imageSize);

                if (isPredominantlyWhite(ctx, imageSize)) {
                    console.log(`Predominantly white image detected at ${x}, ${y}. Stopping further processing.`);
                    return; // Stop processing on first white image
                }

                const outputPath = path.join(imagesFolderPath, `${(y / imageSize) * numColumns + (x / imageSize)}.png`);
                const buffer = canvas.toBuffer('image/png');
                await fs.writeFile(outputPath, buffer);
                console.log(`Saved image to ${outputPath}`);
            }
        }
    } catch (error) {
        console.error(`Failed to process sprite sheet at ${directoryPath}:`, error);
    }
}

function isPredominantlyWhite(ctx, size) {
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    const threshold = 250; // White color threshold
    let whiteCount = 0, totalCount = 0;

    for (let i = 0; i < data.length; i += 4) {
        if (data[i] > threshold && data[i + 1] > threshold && data[i + 2] > threshold) {
            whiteCount++;
        }
        totalCount++;
    }

    return (whiteCount / totalCount) > 0.75; // More than 75% of pixels are white
}


const databasePath = path.join('../database/');

processSpriteSheets(databasePath);

