"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// lib/app.ts
require('dotenv').config();
var express = require("express");
var bodyParser = require("body-parser");
var mongoose_1 = __importDefault(require("mongoose"));
var nodemailer_1 = __importDefault(require("nodemailer"));
var nodemailer_smtp_transport_1 = __importDefault(require("nodemailer-smtp-transport"));
var email_model_1 = __importDefault(require("../models/email.model"));
mongoose_1.default.connect(process.env.mongoUrl || 'mongodb://localhost:27017/email', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
});
var transporter = nodemailer_1.default.createTransport(nodemailer_smtp_transport_1.default({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.emailUser,
        pass: process.env.emailPassword,
    }
}));
// Create a new express application instance
var app = express();
app.use(bodyParser.json());
app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.post('/send-email', function (req, res) {
    var mailOptions = {
        from: req.body.from,
        to: process.env.toEmail,
        subject: req.body.subject || 'No Subject',
        text: req.body.text || '',
    };
    var email = new email_model_1.default(mailOptions);
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            email.error = JSON.stringify(error);
            res.status(500).send({ msg: 'Email Sending Failed' });
        }
        else {
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
