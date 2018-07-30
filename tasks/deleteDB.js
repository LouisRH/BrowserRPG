const dbConnection = require("../mongoConnection");

dbConnection().then(db => {
    return db.dropDatabase().then(() => {
        console.log("done");
    })});