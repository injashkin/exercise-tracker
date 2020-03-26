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
  username: String,
  count: Number,
  log: [
    {
      description: String,
      duration: Number,
      date: { type: Date, default: Date.now() }
    }
  ]
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

/*Обрабатываем POST запрос из первой формы,
которая создает нового пользователя*/
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
      //и выводим из БД имя пользователя и его ИД в формате JSON
      res.json({ username: data.username, _id: data._id });
      //иначе, имя пользователя уже существует в БД
    } else res.send("имя пользователя уже занято");
  });
});

/*Перейдя по адресу https://exercise-tracker-injashkin.glitch.me/api/exercise/users 
получаем массив всех пользователей, с username и _id.*/
app.get("/api/exercise/users", (req, res) => {
  Tracker.find({})
    .select("_id username __v")
    .exec((err, data) => {
      if (err) return console.error(err);
      res.send(data);
    });
});

/*Обрабатываем POST запрос из второй формы,
которая добавляет упражнение*/
app.post("/api/exercise/add", (req, res) => {
  // Получаем из формы ИД пользователя
  let userId = req.body.userId;
  //описание упражнения
  let description = req.body.description;
  //время выполнения
  let duration = req.body.duration;
  //дату
  let date = req.body.date;
  //если дата не указана, назначаем текущую дату
  if (!date) date = Date.now();
  //Ищем пользователя в БД по его ИД
  Tracker.findByIdAndUpdate(
    { _id: userId },
    //и обновляем или добавляем поля:
    { log: [{ description: description, duration: duration, date: date }] },
    { new: true },
    (err, data) => {
      if (err) return console.error(err);
      if (!data) return res.send("такого ИД не существует");
      res.json({
        username: data.username,
        description: data.log[0].description,
        duration: data.log[0].duration,
        _id: data._id,
        date: data.log[0].date
      });
    }
  );
});

/**/
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
