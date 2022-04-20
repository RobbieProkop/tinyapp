const { Template } = require("ejs");
const express = require("express");
const { redirect } = require("express/lib/response");
const app = express();
const PORT = process.env.PORT || 8080;
const { response } = require("express");

//cookies! Yum!
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//middleware to parse data -- express has a parser built in
app.use(express.urlencoded({ extended: true }));

// middleware
//this logs are status codes and requests. Pretty cool
const morgan = require("morgan");
const { cookie } = require("request");
app.use(morgan("dev"));

//sets the view to ejs
app.set("view engine", "ejs");

// object containing urls
let urlDatabase = {
  "9sm5xK": "https://nepallife.org",
  b2xVn2: "https://dhamma.org",
};

//object to contain users
const users = {};

// create a random string to use as new shortURL
const generateRandomString = () => {
  // return Math.random().toString(36).slice(2, 8);¥
  return Math.random().toString(36).substring(2, 8);
};

// ------------------------------------------------------------
//POST
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter a valid Email and Password", 400);
  } else if (emailCheck(req.body.email)) {
    return res.status(400).send("Email already exists");
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password,
    };
    // users[id] = user;
    // console.log(user);
    res.cookie("userID", users[userID].id);
    res.redirect("/urls");
  }
});

// const emailCheck = (email) => {
//   for (const userID in users) {
//     const user = users[userID]
//     console.log(users[userID]);
//     if (user.email === email) {
//       return user;
//     }
//   }
// };
const emailCheck = (email) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
};
//for login (if no cookie is present)
app.post("/login", (req, res) => {
  const userID = req.cookies["userID"];
  const password = req.body.password;
  const user = emailCheck(req.body.email);
  if (!user) {
    return res.status(403).send("User cannot be found");
  }
  // check if password is wrong! but very very unsecure
  if (user.password !== password) {
    return res.status(401).send("Incorrect Username Email or Password");
  }
  // const cookieID = req.body.userID;
  res.cookie("userID", user.id);
  // redirect to a specified page
  res.redirect("/urls");
});

// for logout (if a cookie is present)
app.post("/logout", (req, res) => {
  res.clearCookie("userID");

  // res.render("/urls_index.ejs");
  res.redirect("/login");
});

//page containing all urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  console.log(shortURL);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// used to tell the brwoser which link to delete when button is clicked
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log("This will delete");
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

// used to edit a URL, then redirects to the urls page
app.post("/urls/:id", (req, res) => {
  // console.log("Testing");
  const newURL = req.params.id;
  urlDatabase[newURL] = req.body.longURL;
  res.redirect("/urls");
});

// ------------------------------------------------------------
//GET

app.get("/register", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  const templateVars = {
    user,
  };
  //must render a .ejs file to be readable html
  // .render can send variables to the front end from the server if it is not present in the HTML
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  const templateVars = {
    user,
  };
  res.render("login", templateVars);
});
// asks to GET the urls page from the server
app.get("/urls", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  const templateVars = {
    user,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

// used to get the page to input a new url
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

// get the page based on the shorturl
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies["userID"];
  const user = users[userID];
  //creating an object
  const templateVars = {
    user,
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
  };
  res.render("urls_show", templateVars);
});

// links externally the shortURL to the actual longURL website
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// catch all for errors
app.get("/404", (req, res) => {
  // response.status(404);
  // response.send("my custom 404 page");
  // same thing, just shorthand
  return res.status(404).send("my custom 404 page");
});

// connect to the port
app.listen(PORT, () => {
  console.log(`Test App Listening on Port: ${PORT}`);
});
