const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

require("./youtube").YOUTUBE_MAPPING({app});
require("./user-config").CONFIG_MAPPING({app});

app.use('/home', express.static(path.join(__dirname, "..", "web-dist")));
app.get('/home*', (req, res) => res.sendFile(path.join(__dirname, "..", "web-dist", "index.html")));

app.get("/*", (req, res) => res.redirect("/home"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));