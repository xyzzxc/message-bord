var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('./public/data/msg.db')
var myCheck = require('./myCheck').myCheck;

/* GET users listing. */
router.post('/new', function(req, res, next) {
  db.run(`insert into subMsg(Fid,content,lastUpDateTime,owner) values(?,?,?,?)`,
    [req.body.fid, req.body.content, new Date().toLocaleString(), req.body.owner],function(err){
        if(err) console.log(err.message)
        res.redirect('/msg/msglist')
    })
});

router.post('/update', function(req,res,next) {
    db.run(`update subMsg
            set content = ?, lastUpDateTime = ?
            where id = ?`,
            [req.body.content, new Date().toLocaleString(), req.body.id],function(err){
                if(err) console.log(err.message)
                res.redirect('/msg/msglist')
            })
});

router.use('/delete/:id', (req,res,next) => {myCheck(req,res,next,'subMsg')});
router.get('/delete/:id', function(req,res,next){
    db.run(`delete from subMsg where id = ?`,[req.params.id],function(err){
        res.redirect('/msg/msglist')
    })
})

module.exports = router;
