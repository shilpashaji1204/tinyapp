const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");  // Set EJs as the templating engine

// Sample database of shortened URLs
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",       
  "9sm5xK": "http://www.google.com"
}; 

// Middleware to parse the body of incoming requests
app.use(express.urlencoded({ extended: true }));

app.post("/login", (req, res) => {
    const { username } = req.body;
    res.cookie("username", username);
    res.redirect("/urls");
  });
  app.get("/urls", (req, res) => {
    const templateVars = {
        urls: urlDatabase,
        username: req.cookies.username
    };
    res.render("urls_index", templateVars);
});

// POST requests to update a URL resource
app.post('/urls/:id', (req, res) => {
    const urlId = req.params.id;
    urlDatabase[urlId] = req.body.longURL;
    res.redirect('/urls');   // redirect the client back to the urls_index page
  });

// POST requests to delete a URL resource
app.post('/urls/:id/delete', (req, res) => {
    const urlId = req.params.id;
    delete urlDatabase[urlId];  // use the delete operator to remove the URL
    res.redirect('/urls');   // redirect the client back to the urls_index page
});

app.post("/urls", (req, res) => {
    console.log(req.body); // Log the POST request body to the console
    res.send("Ok"); // Respond with 'Ok' (we will replace this)
  });

// Route to display the form for creating a new shortened URL
app.get("/urls/new", (req, res) => {
    res.render("urls_new");  // Render the EJS template
  });

    // Route to display the details of a specific shortened URL
    app.get("/urls/:id", (req, res) => {
        const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
        res.render("urls_show", templateVars);  // Render the EJS template with data
    });

// Route to display all shortened URLs in the database
app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);  // Render the EJS template with data
  });

    // Root route that simply displays "Hello!"
app.get("/", (req, res) => {
    res.send("Hello!");
});

// Route that returns the JSON representation of the database
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

// Route that displays "Hello World" in bold
app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Route to handle new short URL creation
app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`);
  });

// Route to redirect short URLs to their long URLs
  app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
  });

// Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

// Function to generate a random 6-character string
  function generateRandomString() {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {

        result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}