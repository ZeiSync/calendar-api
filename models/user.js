const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    event: [{ type: Schema.Types.ObjectId, ref: 'Event' }]
  },
  {
    timestamps: true,
  },
);

module.exports = model('User', userSchema);


