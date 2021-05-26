// checkout my spaghetti code
require('dotenv').config();
const express = require('express');
const app = express();

const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// remember the good old days 
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const requireAuth = require('./auth');
const User = require('./models/user');
const Event = require('./models/event');

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));


app.get('/', (req, res, next) => {
  res.json('hello ;3');
})
// SECRET_TOKEN :)))
const generateAccessToken = (user) => jwt.sign({ user }, process.env.SECRET_TOKEN, { expiresIn: '1d' });

app.post('/api/auth/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = User.findOne({ email }).lean();
    console.log(user);
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
});

app.get('/api/events', requireAuth.auth(), (req, res, next) => {
  // tại sao lại 200 ? vì không có token hay token lỗi thì 401 hay 403
  // ở requireAuth rồi :> 
  const user = req.user;
  res.status(200).json({
    events: user.events
  });
});

app.post('/api/events', requireAuth.auth(), async (req, res, next) => {
  const user = req.user;
  const { title = '', date = '', description = '' } = req.body;

  // never trust FE even it's my code (")> 
  // i dun wanna use validate libray just for this, so this is a fastest way 
  if (!title.trim() && !date.trim() && !description.trim()) {
    return res.status(400).json({
      message: 'some_field_is_missing_or_wrong_type',
      statusCode: 400,
    });
  }

  if (new Date(date.trim())) {
    return res.status(400).json({
      message: 'date_field_is_not_a_date',
      statusCode: 400,
    });
  }
  try {
    const event = await Event.create({ tiltle, date, description });
    await User.updateOne({ _id: user._id }, { $push: { events: event._id } })

    const user = await User.find({ _id: user._id }).populate('events').lean();
    return res.status(200).json({
      events: user.events,
    });
  } catch (error) {

  }

});



app.listen(process.env.PORT || 3000, () => {
  console.log(`App listening at port ${process.env.PORT || 3000}`)
});
// end of spaghetti code