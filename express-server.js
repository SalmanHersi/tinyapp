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

// Helper Functions

// Function to retrieve URLs associated with a specific user ID from the URL database
const urlsForUser = (id) => {
  const userURLs = {}; // Initialize an empty object to store user-specific URLs

  // Iterate through each shortURL in the URL database
  for (const shortURL in urlDatabase) {
    // Check if the userID associated with the shortURL matches the provided id
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL]; // Add the URL entry to userURLs
    }
  }

  return userURLs; // Return the object containing user-specific URLs
};

// Function to generate a random string of specified length using a given set of characters
const randomString = () => {
  // Set of characters that can be used in the random string
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~";

  let str = ""; // Initialize an empty string to store the random string

  // Generate a random string of length 6
  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * chars.length); // Generate a random index
    str = str + chars.charAt(index); // Add the character at the random index to the string
  }

  return str; // Return the generated random string
};

// Function to ensure URLs have a valid HTTP or HTTPS prefix
const checkHttps = (url) => {
  // Check if the URL starts with "https://" or "http://"
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return url; // Return the original URL
  }

  // If the URL doesn't have a prefix, add "http://" as the default
  return `http://${url}`;
};

// Backend Code

app.get("/", (req, res) => {
  const userId = req.session.user_id;

  if (userId) {
    res.redirect("/urls");
  } else {
    res.render("login", { user: null });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (!user) {
    const errorMessage = "You must be logged in to view this page.";
    res.status(401).send(errorMessage);
    return;
  }

  const userURLs = urlsForUser(userId);
  const templateVars = { urls: userURLs, user: user };
  res.render("urls_index", templateVars);
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
  const urlObject = urlDatabase[req.params.id];
  if (urlObject) {
    res.redirect(checkHttps(urlObject.longURL));
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
