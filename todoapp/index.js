const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const db = require('./config/mongoose');
const passport = require('passport');
require('./config/passport_local_strategy'); // just require, no need to store in variable

const Task = require('./model/task');
const userController = require('./controller/user-controller');

const app = express();
const port = 8000;

// ---------- View Engine & Layout Setup ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

// ---------- Middleware ----------
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'assets')));

// ---------- Session Configuration ----------
app.use(session({
    name: 'todo',
    secret: 'your_secret_key', // use dotenv in real apps
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
        httpOnly: true
    },
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/todo_development',
        ttl: 14 * 24 * 60 * 60
    })
}));

// ---------- Passport ----------
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

// ---------- Routes ----------
app.get('/',passport.checkAuthentication, async (req, res) => {
    try {
        if(!req.user){
            return res.redirect('/users/sign-in');
        }
        const tasks = await Task.find({user:req.user._id});
        return res.render('home', {
            title: "Todo App",
            todo_list: tasks
        });
    } catch (err) {
        console.error("Error fetching tasks:", err);
        return res.status(500).send("Internal Server Error or You have left a field empty");
    }
});

app.get('/delete-task', async (req, res) => {
    try {
        const id = req.query.id;
        if (id) {
            await Task.findByIdAndDelete(id);
        }
        return res.redirect('/');
    } catch (err) {
        console.error("Error deleting task:", err);
        return res.status(500).send("Internal Server Error");
    }
});

app.post('/add-task', async (req, res) => {
    try {
        if(req.isAuthenticated()){
        const newTask = await Task.create({
            task: req.body.task,
            date: req.body.date,
            category: req.body.category,
            user:req.user._id
        });
        console.log('New Task:', newTask);
        return res.redirect('/');
    }else{
        return res.redirect('/');
    }
    } catch (err) {
        console.error("Error adding task:", err);
        return res.status(500).send("Internal Server Error");
    }
});

// ---------- User Routes ----------
app.get('/users/sign-up', userController.SignUp);
app.get('/users/sign-in', userController.signIn);
app.post('/users/create', userController.create);
app.post('/users/create-session', userController.createSession);
app.get('/users/sign-out',userController.destroySession);

// ---------- Server ----------
app.listen(port, (err) => {
    if (err) {
        return console.error("Server Error:", err);
    }
    console.log(`Server is running on http://localhost:${port}`);
});
