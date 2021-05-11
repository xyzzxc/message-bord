var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('./public/data/msg.db')

db.run(`create table if not exists messages(
    id integer not null primary key autoincrement,
    title text not null,
    feeling text not null,
    content text,
    lastUpDateTime datetime not null,
    owner text not null,
    fileName text
)`)

db.run(`create table if not exists users(
    id integer not null primary key autoincrement,
    email text not null,
    password text not null,
    name text not null,
    sex text not null,
    int text,
    interest text,
    createTime datetime not null
)`)

db.run(`create table if not exists subMsg(
    id integer not null primary key autoincrement,
    Fid integer not null,
    content text,
    lastUpDateTime datetime not null,
    owner text not null
)`)