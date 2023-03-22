
const express = require("express");
const app = express();
const PORT = 8080; // default port

app.set("view engine", "ejs");

const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    username: req.cookies["username"]
  };
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

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; 
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
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
  const longURL = request.body.newURL;
  const shortURL = request.params.id;
  urlDatabase[shortURL] = longURL;
  response.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});


