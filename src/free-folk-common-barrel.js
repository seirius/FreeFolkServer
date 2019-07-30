const path = require("path");
exports.YOUTUBE = require("freefolkcommon").YOUTUBE({
    CREDENTIALS: require("./../FreefolkCredentials.json"),
    tmpDir: path.join(__dirname, "..", "tmp"),
    ffmpegPaths: {
        // linuxPath: path.join(__dirname, "..", "ffmpeg-src", "debian-64/ffmpeg"),
        // windowsPath: path.join(__dirname, "..", "ffmpeg-src", "win-64/bin/ffmpeg")
    }
});