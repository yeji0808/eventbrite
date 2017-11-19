var express = require('express');
var router = express.Router();
const catchErrors = require('../lib/async-error');
const User = require('../models/user');

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}


function validateForm(form, options) {
  var name = form.name || "";
  var email = form.email || "";
  name = name.trim();
  email = email.trim();

  if (!name) {
    return 'Name is required.';
  }

  if (!email) {
    return 'Email is required.';
  }

  if (!form.password && options.needPassword) {
    return 'Password is required.';
  }

  if (form.password !== form.password_confirmation) {
    return 'Passsword do not match.';
  }

  if (form.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//---------------------------------관리자 기능 ----------------------------
//관리자가 사용자 관리를 위한 페이지 이동 
router.get('/usermanage', needAuth, catchErrors(async (req, res, next) => {
  console.log('회원관리 페이지 이동');  
  const users = await User.find({});
  res.render('users/index', {users: users});
}));

//관리자가 회원정보 삭제 하기 method = delete
router.delete('/toadmin/:id', needAuth, catchErrors(async (req, res, next) => {
  console.log('관리자 회원삭제');    
  const user = await User.findOneAndRemove({_id: req.params.id});
  req.flash('success', '회원을 성공적으로 삭제 시켰습니다.');
  const users = await User.find({});
  res.render('users/index', {users: users});
}));



//--------------------------------회원기능------------------------------------
//회원가입 페이지 이동
router.get('/new', (req, res, next) => {
  console.log('회원가입 페이지 이동');
  res.render('users/signup', {messages: req.flash()});
});

//회원가입
router.post('/register', catchErrors(async (req, res, next) => {
  console.log('회원가입 하기')  
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  var user = await User.findOne({email: req.body.email});
  console.log('USER???', user);
  if (user) {
    req.flash('danger', 'Email address already exists.');
    return res.redirect('back');
  }
  
  user = new User({
    name: req.body.name,
    email: req.body.email,
  });
  user.password = await user.generateHash(req.body.password);
  user.save(function(err) {
    if(err){
      console.log(err);
      return handleError(err);
    }
  });
  req.flash('success', 'Registered successfully. Please sign in.');
  res.redirect('/');
}));

//회원 정보 변경하기 method = put
router.put('/:id', needAuth, catchErrors(async (req, res, next) => {
  console.log('회원 정보 변경 완료')
  const err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  const user = await User.findById({_id: req.params.id});
  if (!user) {
    req.flash('danger', 'Not exist user.');
    return res.redirect('back');
  }

  if (!await user.validatePassword(req.body.current_password)) {
    req.flash('danger', 'Current password invalid.');
    return res.redirect('back');
  }

  user.name = req.body.name;
  user.email = req.body.email;
  if (req.body.password) {
    user.password = await user.generateHash(req.body.password);
  }
  await user.save();
  res.render('users/show', {user: user});

}));


//회원정보 변경 화면 가기
router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/edit', {user: user});
}));

//회원정보보기 -> myprofile
router.get('/:id', catchErrors(async (req, res, next) => {
  console.log('회원 정보 보기')
  const user = await User.findById(req.params.id);
  res.render('users/show', {user: user});
}));

//회원정보 삭제 하기 method = delete
router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  console.log('회원삭제')
  const user = await User.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Deleted Successfully.');
  res.redirect('/users');
}));

module.exports = router;
