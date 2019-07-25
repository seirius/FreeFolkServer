
const path = require("path");

const YOUTUBE = require("freefolkcommon").YOUTUBE({
    CREDENTIALS: require("./../FreefolkCredentials.json"),
    tmpDir: path.join(__dirname, "..", "tmp"),
    ffmpegPaths: {
        // linuxPath: path.join(__dirname, "..", "ffmpeg-src", "debian-64/ffmpeg"),
        // windowsPath: path.join(__dirname, "..", "ffmpeg-src", "win-64/bin/ffmpeg")
    }
});

const YOUTUBE_MAPPING = (args) => {
    /** @type {import("express").Express} */
    const app = args.app;

    app.post("/youtube/videos-info", (req, res) => {
        if (!req.body || !req.body.ids) {
            res.status(401);
            res.send("No video IDS present");
        } else {
            YOUTUBE.getVideosInfo({ids: req.body.ids})
            .then(videos => res.send(videos))
            .catch(error => {
                console.error(error);
                res.status(500);
                res.send(error);
            });
        }
    });

    app.post("/youtube/playlist", (req, res) => {
        if (!req.body || !req.body.id) {
            res.status(401);
            res.send("No playilist ID present");
        } else {
            YOUTUBE.getPlaylist({id: req.body.id})
            .then(videos => res.send(videos))
            .catch(error => {
                res.status(500);
                res.send(error);
            });
        }
    });

    app.post("/youtube/search", (req, res) => {
        if (!req.body || !req.body.query) {
            res.status(401);
            res.send("No query present");
        } else {
            YOUTUBE.getByText({text: req.body.query})
            .then(videos => res.send(videos))
            .catch(error => {
                res.status(500);
                res.send(error);
            }); 
        }
    });

    app.post("/youtube/download", (req, res) => {
        if (!req.body || !req.body.id) {
            res.status(401);
            res.send("No ID defined");
        } else {
            YOUTUBE.getVideosInfo({ids: [req.body.id]})
            .then(items => {
                if (items && items.length) {
                    if (req.body.mp3) {
                        if (items.length) {
                            const item = items[0];
                            const filename = YOUTUBE.safeFilename(item.title) + ".mp3";
                            res.setHeader('Content-disposition', 
                            'attachment; filename=' + filename);
                            res.setHeader("x-suggested-filename", filename);
                            YOUTUBE.downloadMusic({
                                id: item.id,
                                pipe: res
                            }).catch(error => {
                                console.error(error);
                                res.status(500);
                                res.send(error);
                            });
                        } else {
                            const errMsg = "No items to download";
                            console.error(errMsg);
                            res.status(404);
                            res.send(errMsg);
                        }
                    } else {
                        if (items.length) {
                            const item = items[0];
                            const filename = YOUTUBE.safeFilename(item.title) + ".mp4";
                            res.setHeader('Content-disposition', 
                            'attachment; filename=' + filename);
                            res.setHeader("x-suggested-filename", filename);
                            YOUTUBE.downloadVideo({
                                id: item.id,
                                pipe: res
                            }).then(() => res.end()).catch(error => {
                                console.error(error);
                                res.status(500);
                                res.send(error);
                            });
                        } else {
                            const errMsg = "No items to download";
                            console.error(errMsg);
                            res.status(404);
                            res.send(errMsg);
                        }
                    }
                }
            }).catch(error => {
                console.error(error);
                res.status(500);
                res.send(error);
            });
        }
    });

    return {

    };
};

exports.YOUTUBE_MAPPING = YOUTUBE_MAPPING;