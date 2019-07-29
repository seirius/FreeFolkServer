const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');

const http = require("http");
const https = require("https");
const fs = require("fs");

const app = express();
const port = 80;

let credentialsPath;
process.argv.forEach(val => {
	if (val && val.indexOf("--credentials") > -1) {
		credentialsPath = val.split("=")[1];
	}
});

let credentials;
if (credentialsPath) {
	const paths = JSON.parse(fs.readFileSync(credentialsPath));
	credentials = {
		key: fs.readFileSync(paths.privateKey, "utf8"),
		cert: fs.readFileSync(paths.certificate, "utf8"),
		ca: fs.readFileSync(paths.ca, "utf8")
	};
}

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
/*
app.all("*", (req, res, next) => {
	console.log(credentials);
	console.log(req.secure);
	if (credentials && !req.secure) {
			//return res.redirect("https://" + req.hostname + req.url);
	}
	res.redirect("/home");
});*/

app.use(express.static(__dirname, { dotfiles: "allow" } ));

const httpServer = http.createServer(app);
httpServer.listen(port, () => console.log(`FreeFolk is running on ${port}`));

if (credentials) {
	const httpsServer = https.createServer(credentials, app);
	httpsServer.listen(443, () => console.log(`FreeFolkSecure is running on 443`));
}
