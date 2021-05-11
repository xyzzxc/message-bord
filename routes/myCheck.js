var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('./public/data/msg.db')

var myCheck = (req,res,next,mydb) =>{
    if(req.session.user!=null){
        db.get(`select id from ${mydb} where id = ? and owner = ?`,[req.params.id,req.session.user],function(err,row){
          if(row){
            next();
          }
          else{
            res.send('請不要直接key網址好嗎，寫防呆很累耶')
          }
        })
      }
      else res.redirect('/msg/msglist')
}

module.exports = {myCheck}