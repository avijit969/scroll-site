const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://showcase2.piyushsingh123443.workers.dev/frames-webp';
const outputDir = path.join(__dirname, '..', 'public', 'frames');
const frameCount = 960;

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function downloadAllFrames() {
    console.log(`Starting download of ${frameCount} frames...`);

    for (let i = 1; i <= frameCount; i++) {
        const frameNumber = String(i).padStart(6, '0');
        const url = `${baseUrl}/frame_${frameNumber}.webp`;
        const filename = `frame_${frameNumber}.webp`;
        const filepath = path.join(outputDir, filename);

        // Skip if already exists
        if (fs.existsSync(filepath)) {
            console.log(`[${i}/${frameCount}] Already exists: ${filename}`);
            continue;
        }

        try {
            await downloadFile(url, filepath);
            console.log(`[${i}/${frameCount}] Downloaded: ${filename}`);
        } catch (error) {
            console.error(`[${i}/${frameCount}] Failed: ${filename}`, error.message);
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('Download complete!');
}

downloadAllFrames();
