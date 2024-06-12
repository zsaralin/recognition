const path = require('path');
const fs = require('fs').promises;
async function findSimilarImages(descriptor, numVids) {
    const baseDir = '../database'; // Use absolute path for reliability
    const entries = await fs.readdir(baseDir, { withFileTypes: true });
    let images = [];

    const promises = entries.map(async (entry) => {
        if (entry.isDirectory()) {
            const descriptorPath = path.join(baseDir, entry.name, 'descriptor.json');
            try {
                const descriptorData = await fs.readFile(descriptorPath, 'utf8');
                const imageDescriptor = JSON.parse(descriptorData).descriptor;
                if (Array.isArray(imageDescriptor) && imageDescriptor.length === descriptor.length) {
                    const distance = euclideanDistance(descriptor, imageDescriptor);

                    const imagesDir = path.join(baseDir, entry.name, 'images');
                    const imageFiles = await fs.readdir(imagesDir);
                    let imagePaths = imageFiles.map(file => path.join('database\\', entry.name, 'images', file));

                    // Sort the image paths based on the numeric part of the filenames
                    imagePaths.sort((a, b) => {
                        const numA = parseInt(a.match(/(\d+)\.png$/)[1]);
                        const numB = parseInt(b.match(/(\d+)\.png$/)[1]);
                        return numA - numB;
                    });

                    const imagePathsRev = imagePaths.slice().reverse();
                    images.push({
                        path: imagePaths.concat(imagePathsRev), distance}
                        );                }
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    console.error(`Error reading descriptor from ${descriptorPath}:`, error);
                }
            }
        }
    });

    // Wait for all promises to complete
    await Promise.all(promises);

    // Sort images by distance
    images.sort((a, b) => a.distance - b.distance);

    // Select the most similar and least similar images
    const halfNumVids = Math.floor(numVids / 2);
    const mostSimilar = images.slice(0, halfNumVids);
    const leastSimilar = images.slice(-halfNumVids);
    return { mostSimilar, leastSimilar };
}

function euclideanDistance(descriptor1, descriptor2) {
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    return Math.sqrt(sum);
}

module.exports = {findSimilarImages}
