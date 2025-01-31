const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;
const DOWNLOADS_DIR = path.join(__dirname, "downloads");

// Ensure downloads folder exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));  // Serve frontend files from "public" folder
app.use(express.static(DOWNLOADS_DIR));  // Serve downloaded files

// Route to download YouTube video
app.post("/download", (req, res) => {
    const { url, quality } = req.body;

    // Validate URL
    if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // Set the filename and path for saving the downloaded video
    const filename = `video_${Date.now()}.mp4`;
    const outputPath = path.join(DOWNLOADS_DIR, filename);

    // Construct the yt-dlp command with the selected quality/resolution
    let command = `yt-dlp -o "${outputPath}" -f ${quality} ${url}`;

    // Execute the download command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            return res.status(500).json({ error: "Failed to download video" });
        }

        // Return the URL of the downloaded video
        res.json({ success: true, downloadUrl: `http://localhost:${PORT}/${filename}` });
    });
});

// Serve index.html as the default page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});