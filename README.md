TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).
Final Product
![preview](/docs/screenshot1.png)
![preview2](/docs/screenshot2.png)
Dependencies

    Node.js
    Express
    EJS
    bcryptjs
    cookie-session

Getting Started

    Install all dependencies using the following command:

npm install

Run the development web server:

    npm start

    Open your web browser and navigate to http://localhost:8080 to access TinyApp.

Features

    Users can register and log in to their accounts.
    Logged-in users can shorten long URLs.
    Shortened URLs are associated with the user who created them.
    Users can view and manage their list of shortened URLs.
    URLs can be edited or deleted by their creators.
    Shortened URLs redirect to their original long URLs when clicked.
    User authentication and password hashing are implemented using bcryptjs and cookie-session.

Usage

    Register a new account or log in if you already have one.
    Create a new shortened URL by providing the long URL.
    Manage your list of shortened URLs on the "My URLs" page.
    Edit or delete your shortened URLs as needed.
    Click on a shortened URL to be redirected to its original long URL.

Credits

This project was developed by Salman Hersi. It was created as part of the curriculum for Lighthouse Labs.
