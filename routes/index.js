var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
service: 'naver',
auth: {
user: '',
pass: ''
}
});

var mailOptions = {
from: '',
to: '',
subject: '',
text: ''
};




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//회원 로그인
router.get('/ok', function(req, res, next) {
  console.log(res.locals.currentUser.name);
  res.render('index', { test: 'Express' });
});

//비밀번호 재설정 메일 보내기
router.get('/reset-password', function(req, res, next) {
   console.log('비밀번호 재설정 하기');
   transporter.sendMail(mailOptions, (error, info)=>{
    if (error) {
    console.log(error);
    }
    else {
    console.log('Email sent! : ' + info.response);
    }
    transporter.close();
    });
   res.render('index', { test: 'Express' });
 });module.exports = router;
