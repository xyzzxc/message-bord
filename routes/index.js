var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('./public/data/msg.db')
var photo = require('../fileDB')
const bcrypt = require('bcrypt')
const saltRounds = 10;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/msg/msglist')
});

router.route('/login')
.get((req,res,next) => {
  res.render('login')
})
.post((req,res,next) => {
  db.get(`select id,name,password from users where email = ?`,
  [req.body.userName],function(err,row){
    if(row){
      bcrypt.compare(req.body.password,row.password, function(err,result){
        if(result){
          req.session.user = row.id
          req.session.userName = row.name
          res.redirect('/msg/msglist')
        }
        else{
          res.status(401)
          res.send('密碼錯誤')
        }
      })
    }
    else{
      res.status(401)
      res.send('沒有此帳號')
    }
  })
})

router.route('/registered')
.get((req,res,next) => {
  res.render('registered')
})
.post((req,res,next) => {
  var psd1 = req.body.password
  var psd2 = req.body.password2
  var myF = req.files.file
  if(psd1==''||req.body.userName==''||req.body.Name==''){
    res.send('可以別這樣搞我嗎?記得輸入每個')
  }
  else if(!req.files || Object.keys(req.files).length === 0){
    res.send('檔案上傳失敗')
  }
  else if(!myF.name.includes('.png') && !myF.name.includes('.jpg') && !myF.name.includes('.jpeg') && !myF.name.includes('.gif')){
    res.send('only：png、jpg、jpeg、gif')
  }
  else if(psd1==psd2){
    db.get(`select email from users where email = ?`,[req.body.userName],function(err,row){
      if(!row){
        bcrypt.hash(psd1,saltRounds, function(err,hashpsd){
          db.run(`insert into users(email,password,name,sex,createTime) values(?,?,?,?,?)`,
          [req.body.userName,hashpsd, req.body.Name, req.body.sex, new Date().toLocaleString()],function(err){
            if(err) console.log(err.message)
            photo.run(`insert into photo(fileName,data,updateTime) values(?,?,?)`,
            [myF.name,myF.data,new Date().toLocaleString()],function(err){
              res.redirect('/login')
            })
          })
        })
      }
      else{
        res.status(401)
        res.send('已有此人註冊')
      }
    })
  }
  else{
    res.status(401)
    res.send('兩個密碼不正確')
  }
})

router.route('/repsd')
.get((req,res,next) => {
  res.render('repsd')
})
.post((req,res,next) => {
  var psd1 = req.body.password
  var psd2 = req.body.password2
  if(psd1==''){
    res.send('可以別這樣搞我嗎?')
  }
  else if(psd1==psd2){
    db.get(`select email from users where email = ?`,[req.body.userName],function(err,row){
      if(row){
        bcrypt.hash(psd1,saltRounds, function(err,hashpsd){
          db.run(`update users
                  set password = ?
                  where email = ?`,
          [hashpsd, req.body.userName],function(err){
            res.redirect('/login')
          })
        })
      }
      else{
        res.status(401)
        res.send('無此帳號')
      }
    })
  }
  else{
    res.status(401)
    res.send('兩個密碼不正確')
  }
})

module.exports = router;
