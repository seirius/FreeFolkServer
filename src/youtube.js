
const YOUTUBE = require("freefolkcommon").YOUTUBE({
    CREDENTIALS: require("./../FreefolkCredentials.json")
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
        if (!req.body || !req.body.ids) {
            res.status(401);
            res.send("No IDS present");
        } else {
            YOUTUBE.getVideosInfo({ids: req.body.ids})
            .then(items => {
                if (items && items.length) {
                    if (req.body.mp3) {
                        if (items.length === 1) {
                            const item = items[0];
                            res.setHeader('Content-disposition', 
                            'attachment; filename=' 
                            + YOUTUBE.safeFilename(item.title) + ".mp3");
                            YOUTUBE.downloadMusic({
                                id: item.id,
                                pipe: res
                            }).catch(error => {
                                res.status(500);
                                res.send(error);
                            });
                        } else {
                            res.status(404);
                            res.send("Not implemented yet (Multiple download)");
                        }
                    } else {
                        if (items.length === 1) {
                            const item = items[0];
                            res.setHeader('Content-disposition', 
                            'attachment; filename=' 
                            + YOUTUBE.safeFilename(item.title) + ".mp4");
                            YOUTUBE.downloadVideo({
                                id: item.id,
                                pipe: res
                            }).catch(error => {
                                res.status(500);
                                res.send(error);
                            });
                        } else {
                            res.status(404);
                            res.send("Not implemented yet (Multiple download)");
                        }
                    }
                }
            }).catch(error => {
                res.status(500);
                res.send(error);
            });
        }
    });

    return {

    };
};

exports.YOUTUBE_MAPPING = YOUTUBE_MAPPING;