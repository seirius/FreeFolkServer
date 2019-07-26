const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

app.use(cookieParser());
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(session({
    secret: "fffffffffffffffffffff23",
    name: "FFSession",
    store: new MongoStore({
        port: 27017,
        host: "127.0.0.1",
        url: "mongodb://localhost:27017/ff"
    }).on("create", sessionId => console.log("create", sessionId)),
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000 * 60 * 24 * 30
    }
}));

require("./youtube").YOUTUBE_MAPPING({app});
require("./user-config").CONFIG_MAPPING({app});

app.use('/home', express.static(path.join(__dirname, "..", "web-dist")));
app.get('/home*', (req, res) => res.sendFile(path.join(__dirname, "..", "web-dist", "index.html")));

app.get("/*", (req, res) => res.redirect("/home"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));