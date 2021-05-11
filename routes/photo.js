var express = require('express');
var router = express.Router();
var photo = require('../fileDB')
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('./public/data/msg.db')
var path = require('path');

router.get('/:id',function(req,res,next){
    photo.get(`select fileName,data from photo where id = ?`,
    [req.params.id],function(err,row){
        if(row){
            res.attachment(row.fileName)
            res.send(row.data)
        }
        else{
            res.send('無此檔案')
        }
    })
})

router.get('/file/:id',function(req,res,next){
    db.get(`select fileName from messages where id = ?`,
    [req.params.id],function(err,row){
        if(err) console.log(err.message)
        if(row){
            var myF = row.fileName
            res.attachment(myF)
            res.download(path.join('upload',req.params.id+myF.substr(myF.indexOf('.'))),myF)
        }
        else{
            res.send('無此檔案')
        }
    })
})

module.exports = router;