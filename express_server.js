const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const getUserByEmail = require("./helpers");
const app = express();
app.set("view engine", "ejs");  // Set EJs as the templating engine

// Middleware to parse the body of incoming requests
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}));

const PORT = 8080; // default port 8080


// Sample database of shortened URLs
const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW",
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
    },
};



// Database

const database = {
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


const urlsForUser = function (id, urlDatabase) {
    const userURLs = {};
    for (let shortURL in urlDatabase) {
        if (urlDatabase[shortURL].userID === id) {
            userURLs[shortURL] = urlDatabase[shortURL];
        }
    }
    return userURLs;
};

//Display the register form
app.get('/register', (req, res) => {
  
    if (req.session.user_id) {
        res.redirect('/urls');
    } else {
        res.render('register', { user: req.session.user_id });
    }
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
    } else if (getUserByEmail(email, database)) {
        res.status(400).send("This email is already registered.");
    } else {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = {
            id,
            email,
            password: hashedPassword,
        };
        database[id] = newUser;
        console.log(database);
        req.session.user_id = id;
        res.redirect("/urls");
    }
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const user = getUserByEmail(email, database);
    if (!user || !bcrypt.compare(password, user.password)) {
        res.status(403).send("Invalid email or password");
    } else {
        const id = user.id;
        req.session.user_id = id;
        res.redirect("/urls");
    }


});

app.get('/login', function (req, res) {
    if (req.session.user_id) {
        res.redirect('/urls');
    } else {
        res.render('login', { user: req.user });
    }
});

app.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
});

// Route to display the details of a specific shortened URL
app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id];
    if (longURL) {
        res.redirect(longURL);
    } else {
        res.status(404).render("error", { error: "This short URL does not exist." });
    }
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

// Middleware function to check if user is logged in
const requireLogin = (req, res, next) => {
    const userId = req.session.user_id;
    if (!userId) {
        res.status(401).render("error", { message: "You must be logged in to view this page" });
    } else {
        next();
    }
};

// Route to display the form for creating a new shortened URL
app.get("/urls/new", requireLogin, (req, res) => {
    const user = database[req.session.user_id]
    const templateVars = { user }
    res.render("urls_new", templateVars);  // Render the EJS template
});

// Route to handle new short URL creation
app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
        longURL: req.body.longURL,
        userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
});

// Route to display all shortened URLs in the database
app.get("/urls", (req, res) => {
    const userURLs = {};
    if (!req.session.user_id) {
        res.status(401).render("error", { errorMessage: "Unauthorized access" });
        return;
    }
    for (const shortURL in urlDatabase) {
        const url = urlDatabase[shortURL];
        if (url.userID === req.session.user_id) {
            userURLs[shortURL] = url;
        }
    }
    const templateVars = {
        urls: userURLs,
        user: database[req.session.user_id]
    };
    res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const url = urlDatabase[shortURL];
    if (!url) {
        res.status(404).render("error", { errorMessage: "Short URL not found" });
    } else if (url.userID !== req.session.user_id) {
        res.status(403).render("error", { errorMessage: "Unauthorized access" });
    } else {
        const templateVars = {
            shortURL: shortURL,
            longURL: url.longURL,
            user: database[req.session.user_id]
        };
        res.render("urls_show", templateVars);
    }
});

app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const url = urlDatabase[shortURL];
    if (!url) {
        res.status(404).render("error", { errorMessage: "Short URL not found" });
    } else if (url.userID !== req.session.user_id) {
        res.status(403).render("error", { errorMessage: "Unauthorized access" });
    } else {
        urlDatabase[shortURL].longURL = req.body.longURL;
        res.redirect("/urls");
    }
});

app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL;
    const url = urlDatabase[shortURL];
    if (!url) {
        res.status(404).render("error", { errorMessage: "Short URL not found" });
    } else if (url.userID !== req.session.user_id) {
        res.status(403).render("error", { errorMessage: "Unauthorized access" });
    } else {
        delete urlDatabase[shortURL];
        res.redirect("/urls");
    }
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