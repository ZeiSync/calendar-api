// checkout my spaghetti code
require('dotenv').config();
const express = require('express');
const app = express();

const cors = require('cors');
const mongoose = require('mongoose');

const routers = require('./router');

// remember the good old days 
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));


app.get('/', (req, res, next) => {
  res.json('hello ;3');
})

app.use('/api', routers);

app.listen(process.env.PORT || 3000, () => {
  console.log(`App listening at port ${process.env.PORT || 3000}`)
});
// end of spaghetti code