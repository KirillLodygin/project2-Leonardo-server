const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: String,
  description: String,
  date: String,
  image: String,
  status: String,
  rate: Number,
  encashTickets: Number,
  visited: Number,
}, {
  versionKey: false
});

module.exports = mongoose.model('Event', eventSchema);
