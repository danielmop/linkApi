const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');

app.use(bodyParser.json());
app.use(cors());

const dealsRoute = require('./routes/deal');
app.use('/deals', dealsRoute);

mongoose.connect(
    process.env.DB_CONNECTION,
    { useNewUrlParser: true }
);

app.listen(3000);