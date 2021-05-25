
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

// init data (password: 123123)
db.defaults({
  users: [{
    id: 1621928295156,
    name: 'zei',
    password: "$2b$10$tEkODSZMKZE.MvBpTlw.9.jJQgo9.gOAs6zkSwjobNlCEFP4HCCY2",
    events: []
  }]
}).write();

module.exports = db;