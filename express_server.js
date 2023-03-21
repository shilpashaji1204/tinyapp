const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");  // Set EJs as the templating engine

// Sample database of shortened URLs
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",       
  "9sm5xK": "http://www.google.com"
}; 

// Middleware to parse the body of incoming requests
app.use(express.urlencoded({ extended: true }));
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


// Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});