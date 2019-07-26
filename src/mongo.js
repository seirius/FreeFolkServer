const mongo = require("mongodb").MongoClient;

exports.connected = false;
exports.USER_CONFIG = {
    store: args => {},
    retrieve: args => {},
    retrieveCreating: args => {}
};

const connectionCallback = (
    /** @type {import("mongodb").MongoError} */error, 
    /** @type {import("mongodb").MongoClient} */client) => {
    if (error) {
        console.error(error);
        return;
    }

    const database = client.db("ff");

    exports.connected = true;

    const userConfig = database.collection("user-config");

    this.USER_CONFIG.store = function (args) {
        return new Promise((resolve, reject) => {
            let { id, config } = args;
            if (!id) {
                const errMsg = "No ID defined";
                console.error(`USER_CONFIG.store() ${errMsg}`);
                reject(errMsg);
                return;
            }

            this.retrieve({id})
            .then(response => {
                if (!config) {
                    config = {
                        setPath: "",
                        videoList: []
                    };
                }

                if (response) {
                    userConfig.updateOne({_id: response._id}, {$set: {config: config}})
                    .then(response => resolve({id, config})).catch(reject);
                } else {
                    const obj = {id, config};
                    userConfig.insertOne(obj)
                    .then(response => resolve(obj)).catch(reject);
                }
            })
        });
    };
    this.USER_CONFIG.retrieveCreating = function (args) {
        return new Promise((resolve, reject) => {
            this.retrieve(args).then(response => {
                if (!response) {
                    this.store({id: args.id}).then(resolve).catch(reject);
                } else {
                    resolve({
                        id: response.id,
                        config: response.config
                    });
                }
            }).catch(reject);
        });
    };
    this.USER_CONFIG.retrieve = function (args) {
        return new Promise((resolve, reject) => {
            let { id } = args;
            if (!id) {
                const errMsg = "No ID defined";
                console.error(`USER_CONFIG.retrieve() ${errMsg}`);
                reject(errMsg);
                return;
            }

            userConfig.findOne({id})
            .then(resolve).catch(reject);
        });
    }
};

mongo.connect("mongodb://localhost:27017", {useNewUrlParser: true}, connectionCallback);

