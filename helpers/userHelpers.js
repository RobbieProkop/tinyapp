// helper function to verify email
const emailCheck = (email, users) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
};
// helper function to search through the urls of specific users
const urlsForUsers = (id, urlDatabase) => {
  let urls = {};
  //used to filter the urls in the urlDatabase to flatten the urlDatabase
  for (const shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      urls[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return urls;
};
// create a random string to use as new shortURL
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = { emailCheck, urlsForUsers, generateRandomString };
