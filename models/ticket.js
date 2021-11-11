const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
  number: String,
  encash: Boolean,
  eventId: String,
});

module.exports = mongoose.model('Ticket', ticketSchema);
