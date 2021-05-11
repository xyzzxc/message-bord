var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('./public/data/photo.db')

db.run(`create table if not exists photo(
    id integer not null primary key autoincrement,
    fileName text not null,
    data blob not null,
    updateTime datetime not null
)`)

module.exports = db