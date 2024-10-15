const express = require('express');
const path = require('path');
const router = require('./routes/myroutes');
const session = require('express-session');

const app = express();
const port = 3000;


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views')); //อ้างอิง views ที่อยู่ใน floder views

app.use(express.static(path.join(__dirname,'public'))); //อ้างอิงไฟล์ static ใน floder public
app.use(express.urlencoded({extended:true}));
app.use(session({secret: 'secret',resave: false,saveUninitialized: true})); //ใช้งาน session

app.use((req, res, next) => {
    // ถ้าผู้ใช้ล็อกอิน ให้ส่ง username ไปกับ response
    if (req.session.user) {
        res.locals.username = req.session.user.username;
    } else {
        res.locals.username = null; // ตั้งค่าเป็น null ถ้าไม่มีผู้ใช้ล็อกอิน
    }
    next();
});

app.use(router);


app.listen(port,()=>{
    console.log(`Server running at http://localhost:${port}`)
})

