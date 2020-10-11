// lib/app.ts
require('dotenv').config()
import express = require('express');
import bodyParser =  require('body-parser');
import  mongoose  from 'mongoose';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import Email, { IEmail } from '../models/email.model';

mongoose.connect(process.env.mongoUrl || 'mongodb://localhost:27017/email', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});

var transporter = nodemailer.createTransport(smtpTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { 
    user: process.env.emailUser,
    pass: process.env.emailPassword,
  }
}))

// Create a new express application instance
const app: express.Application = express();
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/send-email', (req, res) => {
  const mailOptions = {
    from: req.body.from,
    to: process.env.toEmail,
    subject: req.body.subject || 'No Subject',
    text: req.body.text || '',
  };
  let email = new Email(mailOptions);
  transporter.sendMail(mailOptions, function(error: any, info: { response: string; }) {
    if (error) {
        console.log(error);
        email.error = JSON.stringify(error)
        res.status(500).send({msg: 'Email Sending Failed'});
    } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send({ msg: info.response });
    }
    email.response = JSON.stringify(info);
    email.save();
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});