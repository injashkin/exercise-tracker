const express = require("express");
const app = express();
/** Подключаем пакет body-parser, который 
извлекает из запроса данные форм **/
const bodyParser = require("body-parser");

const cors = require("cors");

const mongoose = require("mongoose");

var Exercises = require("./models/exsercises");
var Users = require("./models/users");
/**Соединение с базой данных. Параметры подключения 
читаются из переменной окружения MONGOLAB_URI файла .env **/
mongoose.connect(
  process.env.MONGOLAB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    if (err) {
      console.error("Ошибка подключения к БД \n" + err);
    } else console.log("БД подключена");
  }
);

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
  Users.findOne({ username: username }, (err, data) => {
    if (err) return console.error(err);
    //Если имя пользователя не найдено
    if (!data) {
      data = new Users({
        _id: new mongoose.Types.ObjectId(),
        username: username
      });
      //Сохраняем имя пользователя в БД
      data.save((err, data) => {
        if (err) return console.error(err);
      });
      //и выводим из БД имя пользователя и его ИД в формате JSON
      res.json({ username: data.username, _id: data._id });
      //Если имя пользователя найдено, выводим сообщение
    } else res.send("имя пользователя уже занято");
  });
});

/*Перейдя по адресу https://exercise-tracker-injashkin.glitch.me/api/exercise/users 
получаем массив всех пользователей, с username и _id.*/
app.get("/api/exercise/users", (req, res) => {
  Users.find({}, (err, data) => {
    if (err) return console.error(err);
    res.send(data);
  });
});

/*Обрабатываем POST запрос из второй формы,
которая добавляет упражнение*/
app.post("/api/exercise/add", (req, res) => {
  //если дата в форме не указана, назначаем текущую дату
  if (!req.body.date) {
    req.body.date = new Date();
  }

  //Если одно из обязательных полей не указано,
  //выводим сообщение
  if (!req.body.userId) {
    res.send("Поле ИД является обязательным");
  } else if (!req.body.description) {
    res.send("Поле description является обязательным");
  } else if (!req.body.duration) {
    res.send("Поле duration является обязательным");
  }
  //Если все обязательные поля формы заполнены ищем ИД пользователя в БД
  else {
    Users.findById(req.body.userId, (err, dataUser) => {
      if (err) return console.error("Ошибка поиска: " + err);
      if (!dataUser) return res.send("такого ИД не существует");

      const exercise = new Exercises(req.body);
      exercise.username = dataUser.username;
      exercise.save((err, data) => {
        if (err) return console.error("Ошибка сохранения: " + err);
        res.json({
          _id: data.userId,
          username: data.username,
          description: data.description,
          duration: data.duration,
          date: data.date
        });
      });
    });
  }
});

/*Перейдя по адресу 
https://exercise-tracker-injashkin.glitch.me/api/exercise/log/Идентификатор_пользователя,
получаем полный журнал упражнений указанного пользователя. 
Данный вариант не входит в User story*/
app.get("/api/exercise/log/:userId", (req, res) => {
  let userId = req.params.userId;
  Exercises.find({ userId: userId }, (err, data) => {
    if (err) return console.error("Ошибка поиска: " + err);
    if (!data) return res.send("такого ИД не существует");
    res.json({
      _id: data[0].userId,
      username: data[0].username,
      log: data.map(e => ({
        description: e.description,
        duration: e.duration,
        date: e.date
      }))
    });
  });
});

/**/
// /api/exercise/log?userId=5e80c69539e9e15e3c084ee9&from=2020-01-01&to=2020-04-01&limit=10
app.get("/api/exercise/log/", (req, res) => {
  let userId = req.query.userId;
  let fromDate = new Date(req.query.from);
  let toDate = new Date(req.query.to);
  let limit = req.query.limit;
  Exercises.findById(userId, (err, data) => {
    if (err) return console.error("Ошибка поиска: " + err);
    if (!data) return res.send("такого ИД не существует");
    let log = data.log
      .filter(item => item.date >= fromDate && item.date <= toDate)
      .sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    res.send(data);
  });
  //.where("log.duration").gt(3).lt(5)
  //quer.gt(new Date(fromDate));
  //quer.lt(new Date(toDate));
  //console.log(quer);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Node.js listening ...");
});

/**
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
*/
