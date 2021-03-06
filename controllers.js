const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('./models/user');
const Event = require('./models/event');

const generateAccessToken = (user) => jwt.sign({ user }, process.env.SECRET_TOKEN, { expiresIn: '1d' });

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email && !password) {
    return res.status(400).json({
      message: 'email_or_password_is_missing',
      statusCode: 400,
    })
  }

  try {
    const user = await User.findOne({ email }).populate("events").lean();
    if (!user) {
      return res.status(401).json({
        message: 'incorrect_email_or_password',
        statusCode: 401,
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        message: 'wrong_password',
        statusCode: 401,
      });
    }
    const accessToken = generateAccessToken(user._id);
    delete user.password;
    return res.status(200).json({
      token: {
        tokenType: 'Bearer',
        accessToken,
        expiresIn: new Date(new Date().getTime() + 86400000),
      },
      user,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getUserEvents = async (req, res, next) => {
  const user = await User.findOne({ _id: user._id }).lean();
  res.status(200).json({
    events: user.events
  });
}

exports.postUserEvent = async (req, res, next) => {
  const user = req.user;
  const { title = '', date = '', description = '' } = req.body;

  if (!title.trim() && !date.trim() && !description.trim()) {
    return res.status(400).json({
      message: 'some_field_is_missing_or_wrong_type',
      statusCode: 400,
    });
  }

  if (new Date(date.trim()).toString() === 'Invalid Date') {
    return res.status(400).json({
      message: 'date_field_is_not_a_date',
      statusCode: 400,
    });
  }
  try {
    const event = await Event.create({ title, date, description });
    await User.updateOne({ _id: user._id }, { $push: { events: event._id } });
    const updatedUser = await User.findOne({ _id: user._id }).populate('events').lean();
    return res.status(200).json({
      events: updatedUser.events,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteUserEvent = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const event = await Event.findById(id).lean();
    if (!event) {
      return res.status(404).json({
        message: 'event_not_found',
        statusCode: 404,
      });
    }
    await Event.deleteOne({ _id: event._id });
    await User.updateOne({ _id: user._id }, { $pull: { events: event._id } });
    console.log('updated');
    const updatedUser = await User.findById(user._id).populate('events').lean();
    console.log('updateduser', updatedUser);
    return res.status(200).json({
      events: updatedUser.events
    });
  } catch (error) {
    return next(error);
  }
}
