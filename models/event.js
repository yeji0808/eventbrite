const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  place: {type: String, trim: true},
  start: {type: String, trim: true},
  end: {type: String, trim: true},
  content: {type: String, trim: true},
  group_name: {type: String, trim: true},
  group_explain: {type: String, trim: true},
  koe: {type: String, trim: true},
  inlineRadioOptions2: {type: String, trim: true},
  inlineRadioOptions3: {type: String, trim: true},
  price: {type: String, trim: true},  
  tags: [String],
  numAnswers: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Events = mongoose.model('Events', schema);

module.exports = Events;
