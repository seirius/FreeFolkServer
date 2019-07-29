exports.START_SERVER = async function (args) {
    const express = require("express");
    const path = require("path");
    const bodyParser = require('body-parser');
    const session = require('express-session');
    const MongoStore = require('connect-mongo')(session);
    const cookieParser = require('cookie-parser');
    const { loadConfig } = require("./config");

    const http = require("http");
    const https = require("https");

    const app = express();

    const { configPath } = args;

    let config = await loadConfig({ configPath });

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

    app.use('/home', express.static(path.join(__dirname, "..", "web-dist")));
    app.get('/home*', (req, res) => res.sendFile(path.join(__dirname, "..", "web-dist", "index.html")));

    app.all("*", (req, res) => {
        if (config.credentials && !req.secure) {
            console.log("redirect to secure");
            return res.redirect("https://" + req.hostname + req.url);
        }

        return res.redirect("/home");
    });

    app.use(express.static(__dirname, { dotfiles: "allow" }));

    http.createServer(app)
        .listen(config.server.port, () => console.log(`FreeFolk is running on ${config.server.port}`));

    if (config.credentials && Object.values(config.credentials).some(cred => cred)) {
        https.createServer(config.credentials, app)
            .listen(443, () => console.log(`FreeFolkSecure is running on 443`));
    }
}