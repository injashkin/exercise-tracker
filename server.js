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
      console.error("Ошибка подключения к БД \n" + err);
    } else console.log("БД подключена");
  }
);

// Создаем схему
var tracker = new mongoose.Schema({
  //_id: String,
  username: String,
  count: Number,
  log: [
    {
      description: String,
      duration: Number,
      date: { type: Date }
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
      data = new Tracker({ username: username, count: 0, log: [] });
      //Сохраняем имя пользователя в БД
      data.save((err, data) => {
        if (err) return console.error(err);
      });
      console.log(data);
      //и выводим из БД имя пользователя и его ИД в формате JSON
      res.json({ username: data.username, _id: data._id });
      //иначе, выводим сообщение
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
  if (!date) date = new Date();
  //Если одно из обязательных полей не указано,
  //выводим сообщение
  if (!userId) {
    res.send("Поле ИД является обязательным");
  } else if (!description) {
    res.send("Поле description является обязательным");
  } else if (!duration) {
    res.send("Поле duration является обязательным");
  }
  //Иначе ищем ИД пользователя в БД
  else {
    let exercise = { description: description, duration: duration, date: date };
    Tracker.findById(userId, (err, data) => {
      if (err) return console.error("Ошибка поиска: " + err);
      if (!data) return res.send("такого ИД не существует");
      //Ищем в журнале упражнение с одинаковым description
      let itemLog = data.log.find(item => item.description === description);
      //Если description найден, то обновляем найденный элемент массива, а count не изменяем
      if (itemLog) {
        data.log[data.count - 1] = exercise;
        data.save(err => {
          if (err) return console.error("Ошибка сохранения: " + err);
        });
      } else {
        //иначе description не найден, поэтому, создаем новый элемент массива, а count увеличиваем на 1
        data.count++;
        data.log[data.count - 1] = exercise;
        data.save(err => {
          if (err) return console.error("Ошибка сохранения: " + err);
        });
      }
      res.json({
        username: data.username,
        description: data.log[data.count - 1].description,
        duration: data.log[data.count - 1].duration,
        _id: data._id,
        date: data.log[data.count - 1].date
      });
    });
  }
});

/*Получаем полный журнал упражнений указанного пользователя*/
app.get("/api/exercise/log/:userId", (req, res) => {
  let userId = req.params.userId;
  Tracker.findById(userId)
    .select("-log._id")
    .exec((err, data) => {
      if (err) return console.error("Ошибка поиска: " + err);
      if (!data) return res.send("такого ИД не существует");
      res.send(data);
    });
});

/**/
// /api/exercise/log?userId=5e80c69539e9e15e3c084ee9&from=2020-01-01&to=2020-04-01&limit=10
app.get("/api/exercise/log/", (req, res) => {
  let userId = req.query.userId;
  let fromDate = new Date(req.query.from);
  let toDate = new Date(req.query.to);
  let limit = req.query.limit;
  Tracker.findById(userId, (err, data) => {
    if (err) return console.error("Ошибка поиска: " + err);
    if (!data) return res.send("такого ИД не существует");
    let log = data.log.filter(
      item => item.date >= fromDate && item.date <= toDate
    ).sort((a, b) => {
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


[{"_id":"5e8092a8e39e720956f1ead7","username":"asd111","__v":0},
{"_id":"5e80c69539e9e15e3c084ee9","username":"asd","__v":23},
{"_id":"5e810b36bcf26f039b6b147b","username":"hgf","__v":1},
{"_id":"5e810c63bcf26f039b6b147c","username":"hgfgf","__v":0},
{"_id":"5e8458157809992471ecaf6f","username":"inja","__v":0},
{"_id":"5e8458417809992471ecaf70","username":"игорь","__v":0}]

*/
