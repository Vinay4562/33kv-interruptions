const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const Interruption = require('./models/Interruption');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Fix typo

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('Database connection error:', err));

// Initialize session
app.use(session({
    secret: process.env.SESSION_SECRET || 'chantichanti2255', // Ensure this is set
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

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

const credentials = {
    "220/132/33KV Tandur": { username: "tandurUser", password: "tandurPass" },
    "220KV SS Chandanavally": { username: "chandanavallyUser", password: "chandanavallyPass" },
    "132/33KV Kodangal": { username: "kodangalUser", password: "kodangalPass" },
    "132/33KV Kanakamamidi": { username: "kanakamamidiUser", password: "kanakamamidiPass" },
    "132/33KVSS Parigi": { username: "parigiUser", password: "parigiPass" },
    "132/33KVSS Puttapahad": { username: "puttapahadUser", password: "puttapahadPass" },
    "132/33KVSS SRIRANGAPUR": { username: "srirangapurUser", password: "srirangapurPass" },
    "132/33KVSS Vikarabad": { username: "vikarabadUser", password: "vikarabadPass" },
    "132/33KV Donthanpally": { username: "donthanpallyUser", password: "donthanpallyPass" }
};

app.get('/interruption.html', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'interruption.html'));
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login.html'); // Redirect to login page if not authenticated
}


// Login route
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ success: false, message: info.message });
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.json({ success: true, substation: user.substation });
        });
    })(req, res, next);
});


// Logout route
app.post('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout error' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        
        // Prevent caching
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

app.get('/api/check-auth', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
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

app.get('/filter-feeders', async (req, res) => {
    const userSubstation = req.session.substation;
    
    try {
        // Fetch feeders based on the user's substation
        const feeders = await Feeders.find({ substation: userSubstation });
        res.json(feeders);
    } catch (err) {
        res.status(500).send('Error retrieving feeders.');
    }
});

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
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
