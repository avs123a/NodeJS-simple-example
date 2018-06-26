const express = require('express');
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('passport-local');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();

const pug = require('pug');


app.use(session({secret: "test",
resave: true,
saveUninitialized: true

}));
passport.use(new passportLocal.Strategy({
  usernameField: "username",
  passwordField: "password"
  },
  (user, password, done) => {
      
      db.get("select * from user where username = ? and password = ?",
        user, password,
        (err) => {
            if(err)
              return done("invalid login or password!!!");
            else
              return done(null, user);
            });
}));
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

//login form
app.get('/login', (req, res) => {
  res.sendFile(`${__dirname}/login.html`);
})

//login procedure
app.post('/login', passport.authenticate("local", {failureRedirect: '/login'}),
  (req, res) => {res.redirect('/');});


//register form
app.get('/register', (req, res) => {
  res.sendFile(`${__dirname}/signup.html`);
});

//register procedure
app.post('/register', (req, res) => {
  //{failureRedirect: '/register'},
  db.run("insert into user(id, username, password) values(?, ?, ?)",
  Date.now(),
  req.user,
  req.body.password,
  (err) => {
      if(err)
         res.send(err);
      else
         res.redirect("/login");
  });
  
});


//show data
app.get('/', (req, res) => {
    if(req.isAuthenticated()){
    db.all("select * from inventory where resp_person = ?", req.user, (err, rows) => {
      if(err)
        res.send(err);
      else{
        res.send(pug.renderFile('list.pug', {
          "inv_list": rows
        }));
      }
    });
   }else{
     console.log("Unauthenticated user!!!");
     res.redirect('/login');
   }
});

//add data
app.get('/add', (req, res) => {
  res.sendFile(`${__dirname}/add.html`);
})
app.post('/add', (req, res) => {
  db.run("insert into inventory(id, title, resp_person) values(?, ?, ?)",
  Date.now(),
  req.body.title,
  req.user,
  (err) => {
      if(err)
         res.send(err);
      else
         res.redirect("/");
  });
});

//delete data
app.post('/delete', (req, res) => {
  console.log(req.body.delid);
  db.run("delete from inventory where id=?",
  req.body.delid,
  (err) => {
      if(err)
         res.send(err);
      else
         res.redirect("/");
  });
});

app.listen(3000, () => console.log('server started'));