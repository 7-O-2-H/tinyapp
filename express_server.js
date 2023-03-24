const express = require("express");
const app = express();
const PORT = 8080; // default port

app.set("view engine", "ejs");

const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "fG7t6I",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "fG7t6I",
  },
};

let users = {
  fG7t6I: {
    id: "fG7t6I",
    email: "loser@hmail.ca",
    password: "dataBr"
  }
};

const verifyUser =  (templateVars) => {
  let usersURLs = {};
  const currentUser = templateVars.user_id.id;
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === currentUser) {
      usersURLs[url] = urlDatabase[url];
    }
  }
  return usersURLs;
}

const findUser = function (email) {
  for (let userID in users) {
    if (email === users[userID].email) {
      return users[userID];
    }
  }
  return false;
};

const validateUser = (email, password) => {
  if (!findUser(email)) {
    return {err: "403: Oops! The e-mail you entered is not in our database.", user: null}
  }
  const loggedUser = findUser(email);
  if (loggedUser.password !== password) {
    return {err: "403: Your password is incorrect.", user: null};
  }
  return {err: null, user: loggedUser}
};

const userLoggedin = (templateVars) => {
  if (templateVars.user_id) {
    return true;
  }
  return false;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get("/urls", (req, res) => {
  const templateVars = { 
    user_id: req.cookies["user_id"],
  };

  if (!userLoggedin(templateVars)) {
    res.send("you must be loggin in to view URLs");
    return;
  }
  const usersURLs = verifyUser(templateVars);
  templateVars.urls = usersURLs;
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user_id: req.cookies["user_id"]}
  if (userLoggedin(templateVars)) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const ID = req.params.id;
  const templateVars = { 
    id: ID,
    longURL: urlDatabase[ID].longURL,
    user_id: req.cookies["user_id"]
  };
  if (!templateVars.id) {
    res.send("You must be logged in to create Tiny URLs");
    return;
  }
  res.render("urls_show", templateVars);
});

function generateRandomString() {
  const randOptions = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // full set of 62 alphanumeric characters to select from
  let randString = ''; // randomized string to be returned
  for (let i = 0; i < 6; i ++) {
    const randomizer = Math.floor(Math.random() * 62); //random number between 0 and 62
    randString += randOptions[randomizer];
  }
  return randString;
};

app.post("/urls/new", (req, res) => {
  const templateVars = { 
    user_id: req.cookies["user_id"]
  };
  if (!userLoggedin(templateVars)) {
    res.send("You must be logged in to create new Tiny URLs.")
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

app.get("/u/:id", (req, res) => {
  const templateVars = { 
    user_id: req.cookies["user_id"]
  };
  if (!userLoggedin(templateVars)) {
    res.send("You must be logged in to view Tiny URLs");
    return;
  }
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(`/urls/${longURL}`);
});


app.post('/urls/:id/delete', (request, response) => {
  const key  = request.params.id;
  delete urlDatabase[key];
  response.redirect('/urls');
});

app.post('/urls/:id/edit', (request, response) => {
  const templateVars = { 
    user_id: request.cookies["user_id"]
  };
  if (!userLoggedin(templateVars)) {
    response.send("You must be logged in to create Tiny URLs");
    return;
  }
  const longUrl = request.body.newURL;
  const shortURL = request.params.id;
  console.log(shortURL);
  urlDatabase[shortURL].longURL = longUrl;
  response.redirect('/urls');
});


app.post('/login', (req, res) => {
  const {email, password} = req.body;
  const {err, user} = validateUser(email, password);
  if(err) {
    res.status(403).send(err);
    return;
  }
  res.cookie("user_id", user);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = { 
    user_id: req.cookies["user_id"]
  };
  if (userLoggedin(templateVars)) {
    res.redirect('/urls');
    return;
  } else {
   res.render("urls_login", templateVars);
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  const templateVars = { 
    user_id: req.cookies["user_id"]
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
  };

  if (findUser(email)) {
    res.status(400).send("400: This e-mail already has a registered account.");
    return;
  }
  const userRandomID = generateRandomString();

  users[userRandomID] = {
    id: userRandomID,
    email: email,
    password: password,
  };
  res.cookie('user_id', users[userRandomID]);
  res.redirect('/urls');
});