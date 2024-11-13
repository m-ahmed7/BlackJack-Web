const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Directory to store uploaded images
const app = express();
const port = process.env.PORT || 3000;
const mongoURI = 'mongodb://localhost:27017/RealMadrid';
const client = new mongodb.MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'your_secret_key', // Change this to a strong random string
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));
// MongoDB Connection
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process on connection error
    }
}
connectToDatabase();
// Middleware to check if user is authenticated
function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
// set base path
const basePath = '/M00898450';

// Serve static files from the 'public' directory
app.use('/M00898450', express.static('public'));

// Routes
app.post(`${basePath}/register`, async (req, res) => {
    try {
        const db = client.db('RealMadrid');
        const collection = db.collection('Users');
        const { username, email, password, age } = req.body;
        const user = { username, email, password, age };
        await collection.insertOne(user);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
app.post(`${basePath}/login`, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and Password are required' });
        }

        const db = client.db('RealMadrid');
        const collection = db.collection('Users');
        const user = await collection.findOne({ username: username });

        if (user) {
            // Check if the password matches
            if (user.password === password) {
                // Set user session
                req.session.user = user;
                return res.status(200).json({ message: 'Login successful', username: user.username });
            } else {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            return res.status(401).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});
app.get(`${basePath}/refresh`, requireLogin, async (req, res) => {
    try {
        const { username } = req.query; // Get the username from the request query parameters
        await client.connect();
        const db = client.db('RealMadrid');

        // Fetch following count
        const followingCollection = db.collection('Following');
        const followingUser = await followingCollection.findOne({ username: username });
        const followingCount = followingUser ? followingUser.following.length : 0;

        // Fetch posts count for the specified user
        const postsCollection = db.collection('Posts');
        const userPostsCount = await postsCollection.countDocuments({ username: username });

        res.json({ following: followingCount, posts: userPostsCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post(`${basePath}/uploadPost`, requireLogin, async (req, res) => {
    try {
        const { content, imageURL } = req.body;
        const username = req.session.user.username;
        const date = new Date().toISOString().slice(0, 10);

        const db = client.db('RealMadrid');
        const postsCollection = db.collection('Posts');

        await postsCollection.insertOne({ username, content, date, imageURL });
        res.status(201).json({ message: 'Post uploaded successfully' });
    } catch (error) { }
});
app.post(`${basePath}/uploadPhoto`, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const imageURL = req.file.path.replace(/\\/g, '/');
        res.status(200).json({ imageUrl: imageURL });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ message: 'Failed to upload photo' });
    }
});
app.get(`${basePath}/posts`, requireLogin, async (req, res) => {
    try {
        const db = client.db('RealMadrid');
        const postsCollection = db.collection('Posts');

        const loggedInUsername = req.session.user.username;
        const userPosts = await postsCollection.find({ username: loggedInUsername }).toArray();

        res.json({ posts: userPosts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
});
app.get(`${basePath}/currentDate`, (req, res) => {
    const currentDate = getCurrentDate();
    res.json({ currentDate });
});
app.get(`${basePath}/search`, async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword) {
            return res.status(400).json({ message: 'Search keyword is required' });
        }

        await client.connect();
        const db = client.db('RealMadrid');
        const usersCollection = db.collection('Users');
        const postsCollection = db.collection('Posts');

        // Search for users with matching usernames
        const users = await usersCollection.find({ username: { $regex: keyword, $options: 'i' } }).toArray();

        // Search for posts containing the keyword in content
        const posts = await postsCollection.find({ content: { $regex: keyword, $options: 'i' } }).toArray();

        res.json({ users, posts });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ message: 'Failed to search' });
    } finally {
        await client.close();
    }
});
app.get(`${basePath}/allshow`, async (req, res) => {
    try {
        const db = client.db('RealMadrid');
        const postsCollection = db.collection('Posts');

        const allPosts = await postsCollection.find({}).toArray();

        res.json({ posts: allPosts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
});
app.get(`${basePath}/allforwards`, async (req, res) => {
    try {
        const db = client.db('RealMadrid');
        const forwardsCollection = db.collection('Forwards');

        const allForwards = await forwardsCollection.find({}).toArray();

        res.json({ forwards: allForwards });
    } catch (error) {
        console.error('Error fetching forwards:', error);
        res.status(500).json({ message: 'Failed to fetch forwards' });
    }
});
app.get(`${basePath}/allmidfielders`, async (req, res) => {
    try {
        const db = client.db('RealMadrid');
        const midfieldersCollection = db.collection('Midfielders');

        const allMidfielders = await midfieldersCollection.find({}).toArray();

        res.json({ midfielders: allMidfielders });
    } catch (error) {
        console.error('Error fetching midfielders:', error);
        res.status(500).json({ message: 'Failed to fetch midfielders' });
    }
});
app.get(`${basePath}/alldefenders`, async (req, res) => {
    try {
        const db = client.db('RealMadrid');
        const defendersCollection = db.collection('Defenders');

        const allDefenders = await defendersCollection.find({}).toArray();

        res.json({ defenders: allDefenders });
    } catch (error) {
        console.error('Error fetching defenders:', error);
        res.status(500).json({ message: 'Failed to fetch defenders' });
    }
});
app.get(`${basePath}/allgoalkeepers`, async (req, res) => {
    try {
        const db = client.db('RealMadrid');
        const goalkeepersCollection = db.collection('GK');

        const allGoalkeepers = await goalkeepersCollection.find({}).toArray();

        res.json({ goalkeepers: allGoalkeepers });
    } catch (error) {
        console.error('Error fetching goalkeepers:', error);
        res.status(500).json({ message: 'Failed to fetch goalkeepers' });
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/M00898450`);
});