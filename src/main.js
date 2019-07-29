const { START_SERVER } = require("./server");

let configPath;
process.argv.forEach(val => {
    if (val && val.indexOf("--config") > -1) {
        configPath = val.split("=")[1];
    }
});

START_SERVER({configPath});