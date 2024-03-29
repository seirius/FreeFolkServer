exports.START_SERVER = async function (args) {
    const express = require("express");
    const path = require("path");
    const bodyParser = require('body-parser');
    const session = require('express-session');
    const MongoStore = require('connect-mongo')(session);
    const cookieParser = require('cookie-parser');
    const { loadConfig, credentialsPresent, secureRedirect } = require("./config");

    const http = require("http");
    const https = require("https");

    const app = express();

    const { configPath } = args;

    const config = await loadConfig({ configPath });

    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(session({
        secret: config.session.secret,
        name: config.session.name,
        store: new MongoStore({
            port: config.mongodb.port,
            host: config.mongodb.host,
            url: `mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}`
        }),
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 60000 * 60 * 24 * 30
        }
    }));

    require("./youtube").YOUTUBE_MAPPING({ app });
    require("./user-config").CONFIG_MAPPING({ app });
    require("./meta").META_MAPPING({ app });
    require("./util").UTIL_MAPPING({ app });

    config.expose.files
    .filter(exposedFile => exposedFile.httpPath && exposedFile.systemPath)
    .forEach(exposedFile => app.get(exposedFile.httpPath, (req, res) => res.sendFile(exposedFile.systemPath)));

    config.webs.forEach(web => {
        app.use(`/${web.basePath}`, express.static(web.distPath));
        app.get(`/${web.basePath}/**`, (req, res) => {
            if (secureRedirect({credentials: config.credentials, req, res})) {
                return;
            }
            res.sendFile(path.join(web.distPath, "index.html"));
        });
    });

    app.use(`/${config.web.basePath}`, express.static(config.web.distPath));
    app.get(`/${config.web.basePath}/**`, (req, res) => {
        if (secureRedirect({credentials: config.credentials, req, res})) {
            return;
        }
        res.sendFile(path.join(config.web.distPath, "index.html"));
    });

    app.all("*", (req, res) => {
        if (secureRedirect({credentials: config.credentials, req, res})) {
            return;
        }
        return res.redirect(`/${config.web.basePath}`);
    });

    app.use(express.static(__dirname, { dotfiles: "allow" }));

    http.createServer(app)
        .listen(config.server.port, () => console.log(`FreeFolk is running on ${config.server.port}`));

    if (credentialsPresent({credentials: config.credentials})) {
        https.createServer(config.credentials, app)
            .listen(443, () => console.log(`FreeFolkSecure is running on 443`));
    }
}