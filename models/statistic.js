const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statisticSchema = new Schema({
  planned: Number,
  completed: Number,
  canceled: Number,
});

module.exports = mongoose.model('Statistic', statisticSchema);
