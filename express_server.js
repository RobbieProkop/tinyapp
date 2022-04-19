const { Template } = require("ejs");
const express = require("express");
const { redirect } = require("express/lib/response");
const app = express();
const PORT = process.env.PORT || 8080;
const { response } = require("express");

//cookies! Yum!
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//middleware to parse data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// middleware
//this logs are status codes and requests. Pretty cool
const morgan = require("morgan");
const { cookie } = require("request");
app.use(morgan("dev"));

//sets the view to ejs
app.set("view engine", "ejs");

// variable containing urls
let urlDatabase = {
  "9sm5xK": "https://nepallife.org",
  b2xVn2: "https://dhamma.org",
};

// create a random string to use as new shortURL
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

//for login (if no cookie is present)
app.post("/login", (req, res) => {
  const cookieID = req.body.username;
  res.cookie("username", cookieID);
  // redirect to a specified page
  res.redirect("/urls");
});

// for logout (if a cookie is present)
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  //must render a .ejs file to be readable html
  // .render can send variables to the front end from the server if it is not present in the HTML
  // res.render("/urls_index.ejs");
  res.redirect("/urls");
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

// asks to GET the urls page from the server
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
  console.log(req.cookies["username"]);
});

// used to get the page to input a new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// get the page based on the shorturl
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //creating an object
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    username: req.cookies["username"],
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
