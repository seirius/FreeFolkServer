const { USER_CONFIG } = require("./mongo");

exports.CONFIG_MAPPING = (args) => {
    /** @type {import("express").Express} */
    const app = args.app;

    app.get("/config/user-config", (req, res) => {
        USER_CONFIG.retrieveCreating({id: req.sessionID})
        .then(response => {
            if (response) {
                res.send(response.config);
            } else {
                const errMsg = "Config retrieve unexpected error";
                res.status(500);
                res.send(errMsg);
                console.error(errMsg);
            }
        }).catch(error => {
            console.error(error);
            res.status(500);
            res.send(error);
        });
    });

    app.post("/config/user-config", (req, res) => {
        if (!req.body || !req.body.config) {
            const errMsg = "No config defined";
            console.error(errMsg);
            res.status(400);
            res.send(errMsg);
        } else {
            USER_CONFIG.store({id: req.sessionID, config: req.body.config})
            .then(response => {
                if (response) {
                    res.send(response.config);
                } else {
                    const errMsg = "Config retrieve unexpected error";
                    res.status(500);
                    res.send(errMsg);
                    console.error(errMsg);
                }
            }).catch(error => {
                console.error(error);
                res.status(500);
                res.send(error);
            });
        }
    });

    return {};
};