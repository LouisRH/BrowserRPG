const MongoClient = require("mongodb").MongoClient;
const settings = require("./settings");
const mongoConfig = settings.mongoConfig;

let fullMongoUrl = `${mongoConfig.serverUrl}`;
let _connection = undefined;
let _db = undefined;
let url = process.env.MONGODB_URI;

module.exports = async () => {
  if (!_connection) {
    _connection = await MongoClient.connect(url, { useNewUrlParser: true });
    _db = await _connection.db(mongoConfig.database);
  }

  return _db;
};