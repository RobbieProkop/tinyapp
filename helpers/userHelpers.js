const createHelperScope = (bcrypt, users) => {
  // helper function to verify email
  const emailCheck = (email) => {
    for (const userID in users) {
      if (users[userID].email === email) {
        return users[userID];
      }
    }
  };
  // create a random string to use as new shortURL
  const generateRandomString = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  return { emailCheck, generateRandomString };
};

module.exports = createHelperScope;
