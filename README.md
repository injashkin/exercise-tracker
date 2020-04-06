# Exercise Tracker REST API

#### Проект микросервиса, часть учебной программы Free Code Camp's

### Пожелания пользователя (User story)

1. Можно создать пользователя, введя в форму имя пользователя (username) и отправив POST запрос по адресу `/api/exercise/new-user`. На этот адрес должен вернуться объект с username и \_id, например, {"username":"Игорь","_id":"Hyyt-HHUL"}.
2. Перейдя по адресу `https://exercise-tracker-injashkin.glitch.me/api/exercise/users` можно получить массив всех пользователей, с той же информацией, что и при создании пользователя.
3. Можно добавить упражнение любому пользователю, введя в форму идентификатор пользователя (userId(\_id)), описание (description), продолжительность (duration) и, необязательно, дату (date). Если дата не указана, будет использоваться текущая дата. Данные из формы будут отправлены с помощью POST запроса по адресу `/api/exercise/add` и на этот же адрес будет возвращен объект упражнения пользователя с такими же добавленными полями, например: `{"_id":"oOfQkPnzw","description":"Бег на месте","duration":3,"date":"Mon Apr 06 2020","username":"Игорь"}`.
4. Можно получить полный журнал упражнений любого пользователя, перейдя по адресу `https://exercise-tracker-injashkin.glitch.me/api/exercise/log?userId=Идентификатор_пользователя`. Приложение вернет объект пользователя, в котором добавлены `log` с массивом и `count` (общее количество упражнений), например: 
`{"_id":"oOfQkPnzw","username":"fsdgfd","count":2,"log":[{"description":"jkjlghjfghfg","duration":5,"date":"Mon Apr 06 2020"},{"description":"dffhgd","duration":2,"date":"Mon Apr 06 2020"}]}`.
5. Можно получить часть журнала любого пользователя, передавая необязательные параметры from&to или limit. (Формат даты yyyy-mm-dd, limit = int). Пример GET запроса: `https://exercise-tracker-injashkin.glitch.me/api/exercise/log?userId=Идентификатор_пользователя&from=гггг-мм-дд&to=гггг-мм-дд&limit=целое_число`
