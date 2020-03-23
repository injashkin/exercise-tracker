const express = require("express");
const app = express();
/** Подключаем пакет body-parser, который 
извлекает из запроса данные форм **/
const bodyParser = require("body-parser");

const cors = require("cors");

const mongoose = require("mongoose");
/**Соединение с базой данных. Параметры подключения 
читаются из переменной окружения MONGOLAB_URI файла .env **/
mongoose.connect(
  process.env.MONGOLAB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    if (err) {
      console.log("Ошибка подключения к БД \n" + err);
    } else console.log("БД подключена");
  }
);

// Создаем схему
var tracker = new mongoose.Schema({
  username: { type: String }
});

//Создаем модель из схемы
var Tracker = mongoose.model("Tracker", tracker);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

/**
// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "not found" });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});
*/

app.post("/api/exercise/new-user", (req, res) => {
  // Получаем из формы имя пользователя
  let username = req.body.username;
  // Ищем имя пользователя в БД
  Tracker.findOne({ username: username }, (err, data) => {
    if (err) return console.error(err);
    //Если имя пользователя не найдено
    if (!data) {
      data = new Tracker({ username: username });
      //Сохраняем имя пользователя в БД
      data.save((err, data) => {
        if (err) return console.error(err);
      });
    }
    //Выводим из БД имя пользователя и его ИД в формате JSON
    res.json({ username: data.username, _id: data._id });
  });
});

app.get("/api/exercise/users", (req, res) => {
  Tracker.find({}, (err, data) => {
    if (err) return console.error(err);
    console.log(data);
    res.json({ data });
  });
});

app.post("/api/exercise/add", (req, res) => {
  // Получаем из формы имя пользователя
  res.json({
    _id: req.body.userId,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
  });
});

app.get("/api/exercise/log:userId", (req, res) => {
  console.log(req.params.userId);
  res.json({});
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Node.js listening ...");
});

/**
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
*/
