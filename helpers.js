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

const findUser = function (email, users) {
  for (let userID in users) {
    if (email === users[userID].email) {
      return users[userID];
    }
  }
  return false;
};

const validateUser = (email, password, users) => {
  if (!findUser(email, users)) {
    return {err: "403: Oops! The e-mail you entered is not in our database.", user: null}
  }
  const loggedUser = findUser(email, users);
  const hashed = loggedUser.password;
  if (bcrypt.compareSync(hashed, password)) {
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