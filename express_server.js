const { Template } = require("ejs");
const express = require("express");
const { redirect } = require("express/lib/response");
const app = express();
const PORT = process.env.PORT || 8080;
const { response } = require("express");

//cookies! Yum! this encrypt cookies
const cookieSession = require("cookie-session");
//testing cookies. change to random secret later
app.use(
  cookieSession({
    name: "userID",
    keys: ["longStringToMakeCookieSecure"],
  })
);
//middleware to parse data -- express has a parser built in
app.use(express.urlencoded({ extended: true }));

//middleware -- this logs are status codes and requests. Pretty cool
const morgan = require("morgan");
const { cookie } = require("request");
app.use(morgan("dev"));

//password hashing
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

//sets the view to ejs
app.set("view engine", "ejs");

// object containing urls
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
const users = {};

// import helper funcitons
const {
  emailCheck,
  urlsForUsers,
  generateRandomString,
} = require("./helpers/userHelpers");
// ------------------------------------------------------------
//POST
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, salt);
  //if no email or password has been passed, throw na error
  if (!email || !password) {
    res.status(400).send("Please enter a valid Email and Password");
  } else if (emailCheck(email, users)) {
    //has the email already been registered?
    return res.status(400).send("Email already exists");
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email,
      password: hashedPassword,
    };
    req.session.userID = users[userID].id;
    res.redirect("/urls");
  }
});

//for login (if no cookie is present)
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = emailCheck(email, users);
  //check if a correct user (email) has been passed through
  if (!user || !password) {
    return res.status(401).send("Incorrect Email or Password");
  }
  // check if password is wrong! but very very unsecure
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).send("Incorrect Email or Password");
  }
  req.session.userID = user.id;
  res.redirect("/urls");
});

// for logout (if a cookie is present)
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//page containing all urls
app.post("/urls", (req, res) => {
  const newURL = generateRandomString();
  urlDatabase[newURL] = {
    longURL: req.body.longURL,
    userID: req.session.userID,
  };
  res.redirect(`/urls/${newURL}`);
});

// used to tell the browser which link to delete when button is clicked
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userID;
  const { shortURL } = req.params;
  if (userID !== urlDatabase[shortURL].userID) {
    return console.log("Unathorized delete");
  }
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

// used to edit a URL, then redirects to the urls page
app.post("/urls/:id", (req, res) => {
  if (!req.session.userID) res.status(401).send("Unauthorized link");
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

// ------------------------------------------------------------
//GET
// renders and gets the register page
app.get("/register", (req, res) => {
  if (req.session.userID) res.redirect("/urls");
  const userID = req.session.userID;
  const user = users[userID];
  const templateVars = { user };
  res.render("register", templateVars);
});

// renders and gets the login page
app.get("/login", (req, res) => {
  if (req.session.userID) res.redirect("/urls");
  console.log("userID cookie", req.session.userID);
  const userID = req.session.userID;
  const user = users[userID];
  const templateVars = { user };
  res.render("login", templateVars);
});
// asks to GET the urls page from the server
app.get("/urls", (req, res) => {
  console.log("res.session cookie line 185", req.session);
  if (!req.session.userID) {
    return res
      .status(401)
      .send(
        "<h2>Please log in first!</h2><br><h3><a href='/login'>Login Here</a></h3><h3><a href='/register'>Sign Up here</a></h3>"
      );
  }
  const userID = req.session.userID;
  const user = users[userID];
  const templateVars = {
    user,
    urls: urlsForUsers(userID, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

// used to get the page to input a new url
app.get("/urls/new", (req, res) => {
  if (!req.session.userID) {
    res
      .status(401)
      .send(
        "<h2>Please log in first!</h2><br><h3><a href='/login'>Login Here</a></h3><h3><a href='/register'>Sign Up here</a></h3>"
      );
  }
  const userID = req.session.userID;
  const user = users[userID];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// get the page based on the shorturl
app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const userID = req.session.userID;
  const user = users[userID];
  if (!urlDatabase[shortURL]) {
    return res.status(401).send("<h2>Please enter a valid link!</h2>");
  }
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send("<h2>Unauthorized Link!</h2>");
  }
  //creating an object
  const templateVars = {
    user,
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

// links externally the shortURL to the actual longURL website
app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = urlDatabase[shortURL];
  res.redirect(longURL);
});

// catch all for errors
app.get("*", (req, res) => res.redirect("/register"));

// connect to the port
app.listen(PORT, () => console.log(`TinyApp Listening on Port: ${PORT}`));
