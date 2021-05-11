var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('./public/data/msg.db')
var photo = require('../fileDB')

/* GET users listing. */
router.get('/:id',function(req,res,next){
  db.get(`select name,sex,interest from users where id = ?`,
  [req.params.id],function(err,row){
    res.render('users', {id: req.params.id, name: row.name, interest: row.interest, sex: row.sex})
  })
})

router.route('/')
.get((req,res,next)=>{
  if(req.session.user){
    db.get(`select email,sex,int from users where id = ?`,
    [req.session.user],function(err,row){
      res.render('user', {id: req.session.user, name: req.session.userName, int: row.int, sex: row.sex, email: row.email})
    })
  }
  else{
    res.redirect('/msg/msglist')
  }
})
.post((req,res,next)=>{
  if(req.body.Name==''){
    res.send('很煩耶，都給預設了，還給我特地刪掉')
  }
  else {
    if(req.files && Object.keys(req.files).length > 0){
      var myF = req.files.file
      if(!myF.name.includes('.png') && !myF.name.includes('.jpg') && !myF.name.includes('.jpeg') && !myF.name.includes('.gif')){
        res.send('only：png、jpg、jpeg、gif')
      }
      else{
        db.run(`update users
              set name = ?, sex = ?, int = ?, interest = ?
              where id = ?`
              ,[req.body.Name, req.body.sex,req.body.int,req.body.interest,req.body.id],function(err){
                photo.run(`update photo
                          set fileName = ?, data = ?, updateTime = ?
                          where id = ?`,
                          [myF.name,myF.data,new Date().toLocaleString(),req.body.id],function(error){
                            console.log('12')
                            req.session.userName = req.body.Name
                            res.redirect('msg/msglist')
                          })
              })
      }
    }
    else{
      db.run(`update users
            set name = ?, sex = ?, int = ?, interest = ?
            where id = ?`
            ,[req.body.Name, req.body.sex,req.body.int,req.body.interest,req.body.id],function(err){
              if(err) console.log(err.message)
              req.session.userName = req.body.Name
              console.log('123')
              res.redirect('msg/msglist')
            })
    }
  }
})

module.exports = router;
