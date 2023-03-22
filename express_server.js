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

// Database

const users = {
    userRandomID: {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    },
    user2RandomID: {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk",
    },
  };

  function getUserByEmail(email, users) {
    for (const userId in users) {
      const user = users[userId];
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }
function urlsForUser(userId, urlDatabase)
{
    const urls = [];
    for (const shortURL in urlDatabase) {
        const urlentry = urlDatabase[shortURL];
        if(urlentry.userID === userId)
        {
            urls.push(urlentry);
        }
    }
    return urls;
}
  
//Display the register form
app.get('/register', (req, res) => {
    res.render('register');
  });
 
  app.post("/register", (req, res) => {
    const id = generateRandomString();
    const { email, password } = req.body;
    const newUser = {
      id,
      email,
      password,
    };
    if (!email || !password) {
      res.status(400).send("Please provide both email and password.");
    } else if (getUserByEmail(email, users)) {
      res.status(400).send("This email is already registered.");
    } else {
      users[id] = newUser;
      console.log(users);
      res.cookie("user_id", id);
      res.redirect("/urls");
    }
  });

app.post("/login", (req, res) => {
    const { username } = req.body;
    res.cookie("username", username);
    res.redirect("/urls");
  });
 // app.get("/urls", (req, res) => {
//    const templateVars = {
//        urls: urlDatabase,
//        username: req.cookies.username
//    };
//    res.render("urls_index", templateVars);
// });

app.post('/logout', (req, res) => {
    res.clearCookie('username');
    res.redirect('/urls');
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

// app.post("/urls", (req, res) => {
//     console.log(req.body); // Log the POST request body to the console
//     res.send("Ok"); // Respond with 'Ok' (we will replace this)
//   });

// Route to display the form for creating a new shortened URL
app.get("/urls/new", (req, res) => {
    const user = users[req.cookies.user_id]
    const templateVars = {user}
    res.render("urls_new",templateVars);  // Render the EJS template
  });

    // Route to display the details of a specific shortened URL
    app.get("/urls/:id", (req, res) => {
        const user = users[req.cookies.user_id]
        const templateVars = { id: req.params.id, user, longURL: urlDatabase[req.params.id] };
        res.render("urls_show", templateVars);  // Render the EJS template with data
    });

// Route to display all shortened URLs in the database
app.get("/urls", (req, res) => {
    const user = users[req.cookies.user_id]
    console.log("inside /urls", users);
    console.log(req.cookies);
    const templateVars = { urls: urlsForUser(req.cookies.user_id, urlDatabase), user };
    res.render("urls_index", templateVars);
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