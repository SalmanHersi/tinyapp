// Importing the urlDatabase object from the database module
const { urlDatabase } = require("./database");

// Helper Functions

// A function that searches for a user by their email in the users object
const getUserByEmail = function (email, users) {
  // Iterate through each userId in the users object
  for (const userId in users) {
    // Check if the email of the current user matches the provided email
    if (users[userId].email === email) {
      // If a match is found, return the user object
      return users[userId];
    }
  }
  // If no match is found, return undefined
  return undefined;
};

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
module.exports = {
  getUserByEmail,
  urlsForUser,
  randomString,
  checkHttps,
};
