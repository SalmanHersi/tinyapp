const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "password",
  },
};

const getUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/urls", (req, res) => {
  const templateVars = {
    longURL: urlDatabase[req.params.id],
    id: req.params.id,
  };
  res.send("Ok");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect("/url");
  } else {
    res.status(404);
  }
});

// app.post("/urls/:id", (req, res) => {
//   const id = req.params.id;
//   const updatedLongURL = req.body.updatedLongURL;

//   if (urlDatabase[id]) {
//     urlDatabase[id] = updatedLongURL;
//     res.redirect("/urls");
//   } else {
//     res.status(404);
//   }
// });

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const updatedLongURL = req.body.updatedLongURL;

  if (urlDatabase[id]) {
    urlDatabase[id] = updatedLongURL;
    res.redirect("/urls");
  } else {
    res.status(404);
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
  const userID = randomString(); // Use your random ID generator
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
