const { assert } = require("chai");

const { emailCheck, urlsForUsers } = require("../helpers/userHelpers");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("emailCheck", function () {
  it("should return a user with valid email", function () {
    const user = emailCheck("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(expectedUserID, user.id);
  });
});

const urlDatabase = {
  "9sm5xK": {
    longURL: "https://nepallife.org",
    userID: "9sm5xK",
  },
  b2xVn2: {
    longURL: "https://dhamma.org",
    userID: "b2xVn2",
  },
};

describe("urlsForUsers", function () {
  it("should return a user with valid email", function () {
    const user = urlsForUsers("b2xVn2", urlDatabase);
    const expectedUserURL = {
      b2xVn2: "https://dhamma.org",
    };
    // Write your assert statement here
    assert.deepEqual(user, expectedUserURL);
  });
});
