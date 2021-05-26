const { Schema, model } = require('mongoose');

const eventSchema = new Schema(
  {
    title: {
      type: String,
      require: true,
    },
    date: {
      type: Date,
      require: true,
    },
    description: {
      type: String,
    }
  }
)

module.exports = model('Event', eventSchema);