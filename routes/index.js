var express = require('express');
var router = express.Router();
const User = require('../models/user');
const catchErrors = require('../lib/async-error');

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
service: 'naver',
auth: {
user: 'yejji0808@naver.com',
pass: 'dkdld0522!'
}
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//회원 로그인
router.get('/ok', function(req, res, next) {
  console.log(res.locals.currentUser.name);
  res.render('index', { test: 'Express' });
});

//아이디가 있을경우 비밀번호 재설정 메일 보내기
router.post('/confirmId', function(req, res, next) {  
  var user =  User.findOne({email: req.body.email});
  
  if (user) {
  //  alert('이메일을 전송 합니다.');  
    console.log('USER???', user);
    
    var mailOptions = {
      from: 'yejji0808@naver.com',
      to: req.body.email,
      subject:'비밀번호 변경 안내',
      text: 'http://localhost:3000/passwordUpdateToemail?email='+req.body.email
      };
    transporter.sendMail(mailOptions, (error, info)=>{
      if (error) {
      console.log(error);
      }
      else {
      console.log('Email sent! : ' + info.response);
      }
      transporter.close();
      });
      req.flash('danger', '비밀번호 재설정 메일을 보냈습니다.');
      
      res.render('index', { title: 'Express' });
      
  }else{
    req.flash('danger', '아이디가 존재하지 않습니다.');
    console.log('아이디가 없음')
    
 //   alert('아이디를 확인해주세요');
    return res.redirect('back');
  }
  
});

//비밀번호 재설정 메일 보내기
router.get('/reset-password', function(req, res, next) {
   console.log('비밀번호 재설정 하기');
   
   res.render('users/resetPassword', );
   
});

//받은 이메일로 패스워드 변경하기화면이동
router.get('/passwordUpdateToemail', function(req, res, next) {
  console.log('비밀번호 재설정 화면');
  console.log(req.query.email);
  res.render('users/updatePassword', { email: req.query.email });
});

//변경된 패스워드로 업데이트
router.post('/updatePassword', catchErrors(async (req, res, next) => {
  console.log('비밀번호 변경 완료')
  console.log(req.body)
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    req.flash('danger', 'Not exist user.');
    return res.redirect('back');
  }

  user.email = req.body.email;
  if (req.body.password) {
    user.password = await user.generateHash(req.body.password);
  }
  await user.save();
  req.flash('danger', '비밀번호가 정상적으로 변경되었습니다 다시로그인해주세요');  
  res.render('index', { test: 'Express' });
  
}));

module.exports = router;
