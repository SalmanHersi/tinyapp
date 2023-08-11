const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080;
const bcrypt = require("bcryptjs");

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
  },
};

const users = {};

const getUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

const urlsForUser = (id) => {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];

  if (user) {
    const userURLs = urlsForUser(user.id);
    const templateVars = { urls: userURLs, user: user };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  if (user) {
    res.render("urls_new", { user });
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];

  if (!user) {
    res.status(401).send("You must be logged in to view this URL.");
  } else if (!url || url.userID !== user.id) {
    res.status(403).send("You do not have permission to view this URL.");
  } else {
    const templateVars = {
      id: shortURL,
      longURL: url.longURL,
      user: user,
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL) {
    res.redirect(longURL.longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register", { user: null });
  }
});

app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login", { user: null });
  }
});

app.post("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  if (user) {
    const longURL = req.body.longURL;
    const shortURL = randomString();
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: user.id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send("You must be logged in to create URLs.");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.cookies.user_id];
  const shortURL = req.params.id;

  if (!user) {
    res.status(401).send("You must be logged in to perform this action.");
  } else if (urlDatabase[shortURL].userID !== user.id) {
    res.status(403).send("You do not have permission to delete this URL.");
  } else {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  const shortURL = req.params.id;
  const updatedLongURL = req.body.updatedLongURL;

  if (!user) {
    res.status(401).send("You must be logged in to perform this action.");
  } else if (urlDatabase[shortURL].userID !== user.id) {
    res.status(403).send("You do not have permission to edit this URL.");
  } else {
    urlDatabase[shortURL].longURL = updatedLongURL;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email);

  if (!user || user.password !== password) {
    return res.status(403).send("Invalid email or password");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("400!!! Yikes");
    return;
  }

  if (getUserByEmail(email)) {
    res.status(400).send("Email already registered.");
    return;
  }
  const userID = randomString();
  users[userID] = {
    id: userID,
    email: email,
    password: password,
  };
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

const randomString = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let str = "";

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * chars.length);
    str = str + chars.charAt(index);
  }

  return str;
};
