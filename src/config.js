const fs = require("fs");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);

const DEFAULT_CONFIG = function () {
    return {
        credentials: {
            key: null,
            cert: null,
            ca: null
        },
        server: {
            port: 3000
        },
        mongodb: {
            host: "127.0.0.1",
            port: 27017,
            database: "ff"
        },
        session: {
            secret: "fffffffffffffffffffff23",
            name: "FFSession"
        }
    };
};

exports.DEFAULT_CONFIG = DEFAULT_CONFIG;

exports.loadConfig = async function (args) {
    let config = DEFAULT_CONFIG();

    const { configPath } = args;

    if (configPath) {
        let rawConfig = await readFile(configPath, {encoding: "utf8"});
        if (rawConfig) {
            let aux = Object.assign(config, JSON.parse(rawConfig));
            Object.keys(aux).forEach(key => {
                const auxValue = aux[key];
                if (auxValue) {
                    config[key] = Object.assign(config[key], auxValue);
                }
            });
            if (config.credentials) {
                await loadCredentials({credentials: config.credentials});
            }
        }
    }

    return config;
};

async function loadCredentials (args) {
    const { credentials } = args;

    const promises = [Promise.resolve(null), Promise.resolve(null), Promise.resolve(null)];

    if (credentials.key) {
        promises[0] = readFile(credentials.key, {encoding: "utf8"});
    }
    
    if (credentials.cert) {
        promises[1] = readFile(credentials.cert, {encoding: "utf8"});
    }

    if (credentials.ca) {
        promises[2] = readFile(credentials.ca, {encoding: "utf8"});
    }

    const responses = await Promise.all(promises);
    credentials.key = responses[0];
    credentials.cert = responses[1];
    credentials.ca = responses[2];

    return credentials;
}

const credentialsPresent = function (args) {
    const { credentials } = args;
    return credentials && Object.values(credentials).some(value => value);
}; 

exports.credentialsPresent = credentialsPresent;

exports.secureRedirect = function (args) {
    const { credentials, req, res } = args;
    if (!req.secure && credentialsPresent({credentials})) {
        res.redirect("https://" + req.hostname + req.url);
        return true;
    }
}