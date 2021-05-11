var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('./public/data/msg.db')
var myCheck = require('./myCheck').myCheck;
var path = require('path');
var fs = require('fs')

/* GET users listing. */
router.get('/msglist', function(req, res, next) {
  var show = []
  var count = 0
  db.all(`select m.id,m.title,m.feeling,m.content,m.lastUpDateTime,m.owner,m.fileName,u.name
          from messages m,users u where m.owner = u.id
          order by m.lastUpDateTime DESC`,[],function(err,rows){
    if(rows.length!=0){
      rows.forEach(row => {
        db.all(`select s.id,s.content,s.lastUpDateTime,s.owner,u.name
                from subMsg s,users u where s.Fid = ? and s.owner = u.id
                order by lastUpDateTime DESC`,[row.id],function(err,sub){
          show.push({id: row.id, title: row.title, feeling: row.feeling, content: row.content, lastUpDateTime: row.lastUpDateTime, owner: row.owner, fileName: row.fileName, name: row.name, sub:sub})
          count++
          if(count==rows.length){
            show.sort(function(a,b){
              if(a.lastUpDateTime>b.lastUpDateTime) return -1;
              else if(a.lastUpDateTime<b.lastUpDateTime) return 1;
              else return 0;
            })
            res.render('msglist', {rows: show, user: req.session.user, userName: req.session.userName})
          }
        })
      });
    }
    else{
      res.render('msglist', {rows: show, user: req.session.user, userName: req.session.userName})
    }
  })
});

router.route('/new')
.get((req,res,next) => {
  if(req.session.user!=null)
  res.render('new', {user: req.session.user});
  else res.redirect('/msg/msglist')
})
.post((req,res,next) => {
  if(req.files && Object.keys(req.files).length > 0){
    var myF=req.files.file
    db.run(`insert into messages(title,feeling,content,lastUpDateTime,owner,fileName) values(?,?,?,?,?,?)`,
  [req.body.title,req.body.feeling,req.body.content,new Date().toLocaleString(),req.body.owner,myF.name],function(err){
    if(err) console.log(err.message)
    myF.mv(path.join('upload',this.lastID+myF.name.substr(myF.name.indexOf('.'))),function(err){
      res.redirect('/msg/msglist')
    })
  })
  }
  else{
    db.run(`insert into messages(title,feeling,content,lastUpDateTime,owner) values(?,?,?,?,?)`,
  [req.body.title,req.body.feeling,req.body.content,new Date().toLocaleString(),req.body.owner],function(err){
    if(err) console.log(err.message)
    res.redirect('/msg/msglist')
  })
  }
})

router.route('/update/:id')
.get((req,res,next) => {myCheck(req,res,next,'messages')},(req,res,next) => {
  db.get(`select title,feeling,content from messages where id = ?`,[req.params.id],function(err,row){
    res.render('update', {row: row, user: req.session.user})
  })
})
.post((req,res,next) =>{
  if(req.files && Object.keys(req.files).length > 0){
    var myF = req.files.file
    db.get(`select fileName from messages where id = ?`,[req.params.id],function(err,row){
      var oname=''
      if(row.fileName) var oname= row.fileName
      db.run(`update messages
      set title = ?, feeling = ?, content = ?, lastUpDateTime = ?, owner = ?, fileName = ?
      where id = ?`,
      [req.body.title, req.body.feeling, req.body.content, new Date().toLocaleString(), req.body.owner, myF.name, req.params.id],function(err){
        if(err) console.log(err.message)
        fs.unlink(path.join('upload',req.params.id+oname.substr(oname.indexOf('.'))),function(error){
          if(error) console.log(error.message)
          myF.mv(path.join('upload',req.params.id+myF.name.substr(myF.name.indexOf('.'))),function(err){
            res.redirect('/msg/msglist')
          })
        })
      }) 
    })
  }
  else{
    db.run(`update messages
    set title = ?, feeling = ?, content = ?, lastUpDateTime = ?, owner = ?
    where id = ?`,
    [req.body.title, req.body.feeling, req.body.content, new Date().toLocaleString(), req.body.owner, req.params.id],function(err){
      res.redirect('/msg/msglist')
    }) 
  }
})

router.post('/delete', function(req,res,next){
  db.get(`select fileName from messages where id = ?`,
  [req.body.id],function(err,row){
    var oname= ''
    if(row.fileName) oname = row.fileName
    fs.unlink(path.join('upload',req.body.id+oname.substr(oname.indexOf('.'))),function(error){
      if(error) console.log(error.message)
      db.run(`delete from messages where id = ?`,[req.body.id],function(err){
        db.run(`delete from subMsg where Fid = ?`,[req.body.id],function(err){
            res.redirect('/msg/msglist')
        })
      })
    })
  })
})

module.exports = router;
