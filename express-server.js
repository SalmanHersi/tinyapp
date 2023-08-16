const express = require("express");
const app = express();
const { getUserByEmail } = require("./helpers");
const cookieSession = require("cookie-session");
const PORT = 8080;
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur";
const hashedPassword = bcrypt.hashSync(password, 10);

app.use(
  cookieSession({
    name: "session",
    keys: ["secret-key"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
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

const urlsForUser = (id) => {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

const randomString = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~";
  let str = "";

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * chars.length);
    str = str + chars.charAt(index);
  }

  return str;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;

  const user = users[userId];

  if (userId) {
    const userURLs = urlsForUser(userId);
    const templateVars = { urls: userURLs, user: user };

    res.render("urls_index", templateVars);
  } else {
    res.redirect("login");
  }
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.render("urls_new", { user });
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
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
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register", { user: null });
  }
});
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login", { user });
  }
});

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
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
  const user = users[req.session.user_id];
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
  const user = users[req.session.user_id];
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

  const user = getUserByEmail(email, users);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid email or password");
  }

  req.session["user_id"] = user.id;

  res.redirect("/urls");
});
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("400!!! Yikes");
    return;
  }

  if (getUserByEmail(email, users)) {
    res.status(400).send("Email already registered.");
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const userID = randomString();
  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword,
  };
  req.session["user_id"] = userID;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
