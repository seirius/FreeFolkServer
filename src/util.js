const { UTIL } = require("freefolkcommon");

exports.UTIL_MAPPING = (args) => {
    /** @type {import("express").Express} */
    const app = args.app;

    app.post("/util/unshortened-url", (req, res) => {
        if (!req.body || !req.body.url) {
            const errMsg = "No URL defined";
            res.status(400);
            res.send(errMsg);
            console.error(errMsg);
            return;
        }

        UTIL.getUnshortenedUrl({url: req.body.url})
        .then(response => res.send(response))
        .catch(error => {
            res.status(500);
            res.send(error);
            console.error(error);
        });
    });
};