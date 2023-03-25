const express = require("express"); //express
const app = express();
const PORT = 8080; // default port

// import database, helpers
const { urlDatabase, users } = require("./database");
const { verifyUser, validateUser, userLoggedin, findUser, generateRandomString } = require("./helpers");

app.set("view engine", "ejs"); //ejs

// cookie session
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],

  maxAge: 24 * 60 * 60 * 1000
}));

//bcrypt

const bcrypt = require("bcryptjs");

app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//urls home/view

app.get("/urls", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
  };
  if (!userLoggedin(templateVars)) {
    res.send("you must be loggin in to view URLs");
    return;
  }
  const usersURLs = verifyUser(templateVars);
  templateVars.urls = usersURLs;
  res.render("urls_index", templateVars);
});

//urls add new

app.get("/urls/new", (req, res) => {
  const templateVars = {user_id: req.session.user_id};
  if (userLoggedin(templateVars)) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id
  };
  if (!userLoggedin(templateVars)) {
    res.send("You must be logged in to create new Tiny URLs.");
    return;
  }
  const longUrl = req.body.longURL;
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: longUrl,
    userID: templateVars.user_id.id,
  };
  res.redirect(`/urls/${shortUrl}`);
});

//urls view/edit

app.get("/urls/:id", (req, res) => {
  const ID = req.params.id;
  const templateVars = {
    id: ID,
    longURL: urlDatabase[ID].longURL,
    user_id: req.session.user_id
  };
  if (!templateVars.id) {
    res.send("You must be logged in to create Tiny URLs");
    return;
  }
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id
  };
  if (!userLoggedin(templateVars)) {
    res.send("You must be logged in to view Tiny URLs");
    return;
  }
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(`/urls/${longURL}`);
});

app.post('/urls/:id/edit', (request, response) => {
  const templateVars = {
    user_id: request.session.user_id
  };
  if (!userLoggedin(templateVars)) {
    response.send("You must be logged in to create Tiny URLs");
    return;
  }
  const longUrl = request.body.newURL;
  const shortURL = request.params.id;
  urlDatabase[shortURL].longURL = longUrl;
  response.redirect('/urls');
});

//urls delete

app.post('/urls/:id/delete', (request, response) => {
  const key  = request.params.id;
  delete urlDatabase[key];
  response.redirect('/urls');
});

//login/logout

app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id
  };
  if (userLoggedin(templateVars)) {
    res.redirect('/urls');
    return;
  } else {
    res.render("urls_login", templateVars);
  }
});

app.post('/login', (req, res) => {
  let {email, password} = req.body;
  password = bcrypt.hashSync(password, 10);
  const {err, user} = validateUser(email, password, users);
  if (err) {
    res.status(403).send(err);
    return;
  }
  req.session.user_id = user;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
});

//register

app.get('/register', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id
  };
  if (userLoggedin(templateVars)) {
    res.redirect('/urls');
    return;
  }
  res.render("urls_register", templateVars);
  
});

app.post('/register', (req, res) => {
  const {email, password} = req.body;
  
  if (email === '' || password === '') {
    res.status(400).send("400: Invalid email.");
    return;
  }
  
  if (findUser(email, users)) {
    res.status(400).send("400: This e-mail already has a registered account.");
    return;
  }

  const userRandomID = generateRandomString();

  users[userRandomID] = {
    id: userRandomID,
    email: email,
    password: password,
  };
  const hashedUser = {
    id: userRandomID,
    email: email,
    password: bcrypt.hashSync(password, 10),
  };
  req.session.user_id = hashedUser;
  res.redirect('/urls');
});