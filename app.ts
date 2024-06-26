import express = require("express");
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });
import bodyParser = require("body-parser");
import serverless from "serverless-http";
import mongoose from "mongoose";
import cors from 'cors';
import Email from "./models/email.model";
const SibApiV3Sdk = require("sib-api-v3-sdk");
const defaultClient = SibApiV3Sdk.ApiClient.instance;
// Configure API key authorization: api-key
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKey.apiKeyPrefix = 'Token';
import { verifyToken } from './middleware/verify-token';

// Configure API key authorization: partner-key
const partnerKey = defaultClient.authentications["partner-key"];
partnerKey.apiKey = process.env.API_KEY;
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//partnerKey.apiKeyPrefix = 'Token';
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

mongoose.connect(process.env.mongoUrl || "mongodb://localhost:27017/email", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});

// Create a new express application instance
const app: express.Application = express();
app.use(bodyParser.json());
const corsOptions = {
  origin: '*', // Replace with your specific front-end domain or '*' for all
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable credentials if needed
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.use(verifyToken);

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.post("/send-email", (req, res) => {
  try {
    const mailOptions = {
      from: req.body.from || process.env.fromEmail,
      to: req.body.to || process.env.toEmail,
      subject: req.body.subject || "No Subject",
      text: req.body.text || "",
    };
    const email = new Email(mailOptions);
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = mailOptions.subject || "No Subject",
    sendSmtpEmail.textContent =  mailOptions.text || "No text",
    sendSmtpEmail.sender = {
      name: mailOptions.from.split("9")?.[0],
      email: mailOptions.from,
    };
    sendSmtpEmail.to = [{ email: process.env.toEmail, name: "M Sohail" }];
    if (process.env.toEmail2 && req.body.optionalEmail) {
      console.info(req.body.optionalEmail, 'optionalEmail');
      sendSmtpEmail.to.push({ email: process.env.toEmail2, name: process.env.toEmail2User});
    }
    sendSmtpEmail.params = {
      subject: mailOptions.subject || "No Subject",
    };
    apiInstance.sendTransacEmail(sendSmtpEmail).then(
      function (data: any) {
        console.info("API called successfully. Returned data: " + JSON.stringify(data));
        res.status(200).send({ 'success': true });
        email.response = data;
        email.save();
      },
      function (error: any) {
        console.error(error, 'error while sending email');
        res.status(500).send({ 'success': false, error: error });
        email.response = error;
        email.save();
      }
    );
  } catch (err) {
    console.error(err, 'error while sending email');
    res.status(500).send({ 'success': false, error: err });
  }
});

if (process.env.SERVERLESS === 'true') {
  const lambdaHandler = serverless(app);
  module.exports.handler = lambdaHandler;
} else {
  app.listen(process.env.PORT || 3000, function () {
    console.log("Example app listening on port 3000!");
  });
}