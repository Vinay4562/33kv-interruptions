const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const Interruption = require('./models/Interruption');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('Database connection error:', err));

// Initialize session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Apply CORS middleware
app.use(cors({
    origin: 'https://33kv-interruptions-o0mzf28x8-vinay-kumars-projects-f1559f4a.vercel.app', // Your frontend URL
    credentials: true
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Define credentials
const credentials = {
    "220/132/33KV Tandur": { username: "tandur220kv", password: "tandur@V514" },
    "220KV SS Chandanavally": { username: "chandanavally220kv", password: "chandanavally@V168" },
    "132/33KV Kodangal": { username: "kodangal132kv", password: "kodangal@V784" },
    "132/33KV Kanakamamidi": { username: "kanakamamidi132kv", password: "kanakamamidi@V642" },
    "132/33KVSS Parigi": { username: "parigi132kv", password: "parigi@V326" },
    "132/33KVSS Puttapahad": { username: "puttapahad132kv", password: "puttapahad@V198" },
    "132/33KVSS  SRIRANGAPUR": { username: "srirangapur132kv", password: "srirangapur@V446" },
    "132/33KVSS  Vikarabad": { username: "vikarabad132kv", password: "vikarabad@V156" },
    "132/33KV Donthanpally": { username: "donthanpally132kv", password: "donthanpally@V848" }
};

// Passport.js configuration
passport.use(new LocalStrategy((username, password, done) => {
    const substation = Object.keys(credentials).find(substation => credentials[substation].username === username);
    if (substation && credentials[substation].password === password) {
        return done(null, { username, substation });
    } else {
        return done(null, false, { message: 'Invalid username or password' });
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.username);
});

passport.deserializeUser((username, done) => {
    const substation = Object.keys(credentials).find(substation => credentials[substation].username === username);
    done(null, { username, substation });
});

// Login route
app.post('/login', (req, res, next) => {
    console.log('Login request received:', req.body);
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Authentication error:', err);
            return next(err);
        }
        if (!user) {
            console.log('Authentication failed:', info.message);
            return res.status(401).json({ success: false, message: info.message || 'Authentication failed' });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return next(err);
            }
            console.log('Login successful:', user);
            res.json({ success: true, substation: user.substation });
        });
    })(req, res, next);
});

// Logout route
app.post('/api/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Logged out successfully' });
        });
    });
});

// CRUD Operations for Interruptions
app.get('/api/interruptions', async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        let query = {};
        if (fromDate && toDate) {
            query.fromDatetime = { $gte: new Date(fromDate), $lte: new Date(toDate) };
        }
        const interruptions = await Interruption.find(query);
        res.json(interruptions);
    } catch (err) {
        console.error('Get Interruptions error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Express.js route handling the filter request
app.get('/filter-feeders', (req, res) => {
    const userSubstation = req.session.substation;
    
    // Fetch feeders based on the user's substation
    Feeders.find({ substation: userSubstation }, (err, feeders) => {
      if (err) {
        return res.status(500).send('Error retrieving feeders.');
      }
      res.json(feeders);
    });
});

// Create new interruption
app.post('/api/interruptions', async (req, res) => {
    try {
        const interruption = new Interruption(req.body);
        await interruption.save();
        res.status(201).json(interruption);
    } catch (err) {
        console.error('Post Interruption error:', err);
        res.status(400).json({ message: 'Invalid data' });
    }
});

// Update existing interruption
app.put('/api/interruptions/:id', async (req, res) => {
    try {
        const interruption = await Interruption.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!interruption) {
            return res.status(404).json({ message: 'Interruption not found' });
        }
        res.json(interruption);
    } catch (err) {
        console.error('Update Interruption error:', err);
        res.status(400).json({ message: 'Invalid data' });
    }
});

// Delete an interruption
app.delete('/api/interruptions/:id', async (req, res) => {
    try {
        const interruption = await Interruption.findByIdAndDelete(req.params.id);
        if (!interruption) {
            return res.status(404).json({ message: 'Interruption not found' });
        }
        res.status(204).end();
    } catch (err) {
        console.error('Delete Interruption error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Catch-all error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
