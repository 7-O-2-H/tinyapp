const { assert } = require('chai');
const bcrypt = require("bcryptjs");

const { findUser, validateUser } = require('../helpers.js');

const inspect = require('util').inspect;

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUser', function() {
  it('should return a user with valid email', function() {
    const user = findUser("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert(user.id === expectedUserID.toString(), console.log(`user = expected user: ${inspect(user.id)}` + ' = ' + expectedUserID + ' .'));
  });
});

describe('validateUser', function() {
  it('should return a valid user', function() {
    const {err, user} = validateUser("user@example.com", bcrypt.hashSync("purple-monkey-dinosaur", 10), testUsers);
    const expectedUserID = testUsers["userRandomID"];
    assert(user === expectedUserID, console.log(`user = expected user: ${inspect(user)} = ${inspect(expectedUserID)}.`));
  });
});