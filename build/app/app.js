"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// lib/app.ts
require("dotenv").config();
var express = require("express");
var bodyParser = require("body-parser");
var cors_1 = __importDefault(require("cors"));
var email_model_1 = __importDefault(require("../models/email.model"));
var SibApiV3Sdk = require("sib-api-v3-sdk");
var defaultClient = SibApiV3Sdk.ApiClient.instance;
// Configure API key authorization: api-key
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKey.apiKeyPrefix = 'Token';
// Configure API key authorization: partner-key
var partnerKey = defaultClient.authentications["partner-key"];
partnerKey.apiKey = process.env.API_KEY;
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//partnerKey.apiKeyPrefix = 'Token';
var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
// mongoose.connect(process.env.mongoUrl || "mongodb://localhost:27017/email", {
//   useUnifiedTopology: true,
//   useNewUrlParser: true,
//   useCreateIndex: true,
// });
// Create a new express application instance
var app = express();
app.use(bodyParser.json());
var corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};
app.use(cors_1.default(corsOptions));
app.get("/", function (req, res) {
    res.send("Hello World!");
});
app.post("/send-email", function (req, res) {
    var _a;
    try {
        var mailOptions = {
            from: req.body.from || process.env.fromEmail,
            to: req.body.to || process.env.toEmail,
            subject: req.body.subject || "No Subject",
            text: req.body.text || "",
        };
        var email_1 = new email_model_1.default(mailOptions);
        var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = mailOptions.subject || "No Subject",
            sendSmtpEmail.textContent = mailOptions.text || "No text",
            sendSmtpEmail.sender = {
                name: (_a = mailOptions.from.split("")) === null || _a === void 0 ? void 0 : _a[0],
                email: mailOptions.from,
            };
        sendSmtpEmail.to = [{ email: process.env.toEmail, name: "M Sohail" }];
        if (process.env.toEmail2) {
            sendSmtpEmail.to.push({ email: process.env.toEmail2, name: process.env.toEmail2User });
        }
        sendSmtpEmail.params = {
            subject: mailOptions.subject || "No Subject",
        };
        apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
            console.info("API called successfully. Returned data: " + JSON.stringify(data));
            res.status(200).send({ 'success': true });
            email_1.response = data;
            email_1.save();
        }, function (error) {
            console.error(error, 'error while sending email');
            res.status(500).send({ 'success': false, error: error });
            email_1.response = error;
            email_1.save();
        });
    }
    catch (err) {
        console.error(err, 'error while sending email');
        res.status(500).send({ 'success': false, error: err });
    }
});
app.listen(process.env.PORT || 3000, function () {
    console.log("Example app listening on port 3000!");
});
