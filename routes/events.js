const express = require('express');
const Events = require('../models/event');
const Answer = require('../models/answer'); 
const catchErrors = require('../lib/async-error');

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

/* GET questions listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {place: {'$regex': term, '$options': 'i'}},
      {start: {'$regex': term, '$options': 'i'}},
      {end: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}},
      {group_name: {'$regex': term, '$options': 'i'}},
      {group_explain: {'$regex': term, '$options': 'i'}},
      {koe: {'$regex': term, '$options': 'i'}},
      {inlineRadioOptions2: {'$regex': term, '$options': 'i'}},
      {inlineRadioOptions3: {'$regex': term, '$options': 'i'}},
      {price: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const events = await Events.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('events/index', {events: events, term: term});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('events/new', {event: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const event = await Events.findById(req.params.id);
  console.log('수정할 이벤트 내용',event);
  res.render('events/edit', {event: event});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  console.log(req.params);

    const event = await Events.findById(req.params.id).populate('author');
  const answers = await Answer.find({event: event.id}).populate('author');
  event.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???
console.log(event);
  await event.save();
  res.render('events/show', {event: event, answers: answers});
}));

router.post('/:id', catchErrors(async (req, res, next) => {
  const event = await Events.findById(req.params.id);

  if (!event) {
    req.flash('danger', 'Not exist event');
    return res.redirect('back');
  }
  event.title = req.body.title;
  event.place = req.body.place;
  event.start = req.body.start;
  event.end = req.body.end;
  event.content = req.body.content;
  event.group_name = req.body.group_name;
  event.group_explain = req.body.group_explain;
  event.koe =  req.body.koe;
  event.inlineRadioOptions2 =  req.body.inlineRadioOptions2;
  event.inlineRadioOptions3 =  req.body.inlineRadioOptions3;
  event.price = req.body.price;
  event.tags = req.body.tags.split(" ").map(e => e.trim());
  console.log('/--------------이벤트변경---------------');
  await event.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/events');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Events.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/events');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  var event = new Events({
    title: req.body.title,
    place: req.body.place,
    start: req.body.start,
    end: req.body.end,
    content: req.body.content,
    group_name: req.body.group_name,
    group_explain: req.body.group_explain,
    koe: req.body.koe,
    inlineRadioOptions2: req.body.inlineRadioOptions2,
    inlineRadioOptions3: req.body.inlineRadioOptions3,
    price: req.body.price,
    author: user._id,
    tags: req.body.tags.split(" ").map(e => e.trim())
  });
  await event.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/events');
}));

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  console.log('body 내용: ',req.body);
  const user = req.user;
  const event = await Events.findById(req.params.id);

  if (!event) {
    req.flash('danger', 'Not exist event');
    return res.redirect('back');
  }

  var answer = new Answer({
    author: user._id,
    event: event._id,
    content: req.body.content
  });
  await answer.save();
  event.numAnswers++;
  await event.save();

  req.flash('success', 'Successfully registered');
  res.redirect(`/events/${req.params.id}`);
}));



module.exports = router;
