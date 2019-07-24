exports.CONFIG_MAPPING = (args) => {
    /** @type {import("express").Express} */
    const app = args.app;

    app.get("/config/user-config", (req, res) => {
        res.send({
            setPath: "",
            videoList: []
        });
    });

    app.post("/config/user-config", (req, res) => {
        res.send({
            ok: true
        });
    });

    return {};
};