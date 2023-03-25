const { urlDatabase, users } = require("./database");
const bcrypt = require("bcryptjs");

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
    console.log(users[userID]);
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
  const hashed = loggedUser.hashedPassword;
  if (bcrypt.compareSync(password, hashed)) {
    return {err: null, user: loggedUser}
  }
  return {err: "403: Your password is incorrect.", user: null};
};

const userLoggedin = (templateVars) => {
  if (templateVars.user_id) {
    return true;
  }
  return false;
};

module.exports = { verifyUser, validateUser, userLoggedin, findUser };