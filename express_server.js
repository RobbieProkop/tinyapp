const { Template } = require("ejs");
const express = require("express");
const { redirect } = require("express/lib/response");
const app = express();
const PORT = 8080;
const { response } = require("express");

//middleware to parse data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// middleware
const morgan = require("morgan");
app.use(morgan("dev"));

//sets the view to ejs
app.set("view engine", "ejs");

//object   holding website info
let urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// create a random string to use as new shortURL
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

//adding pages with urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  console.log(shortURL);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log("This will delete");
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

// a posrt request for
app.post("/urls/:id", (req, res) => {
  // console.log("Testing");
  const newURL = req.params.id;
  urlDatabase[newURL] = req.body.longURL;
  res.redirect("/urls");
});

// gets
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
  };
  res.render("urls_show", templateVars);
});

// used to open the link that's been passed through
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// catch all for errors
// app.get("*", (req, res) => {
//   // response.status(404);
//   // response.send("my custom 404 page");
//   // same thing, just shorthand
//   return response.status(404).send("my custom 404 page");
// });

// connect to the port
app.listen(PORT, () => {
  console.log(`Test App Listening on Port: ${PORT}`);
});
