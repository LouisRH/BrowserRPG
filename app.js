const express = require("express");

const configRoutes = require("./routes");
const static = express.static(__dirname + '/public');
const app = express();

app.use("/public", static);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use('/', configRoutes);


app.listen(process.env.PORT || 3000, () => {
    console.log("The application is running on http://localhost:3000");

    if (process && process.send) process.send({done: true});
});

module.exports = app;
