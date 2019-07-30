const { version } = require("./../package.json");
const commonVersion = require("freefolkcommon").version;

exports.META_MAPPING = (args) => {
    /** @type {import("express").Express} */
    const app = args.app;

    app.get("/meta/version", (req, res) => {
        res.send({
            serverVersion: version,
            commonVersion,
            appVersion: ""
        });
    });
};