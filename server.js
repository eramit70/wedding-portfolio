const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Setup directories
const WISHES_FILE = path.join(__dirname, 'data', 'wishes.json');
const UPLOAD_DIR = path.join(__dirname, 'public', 'img', 'wishes');

if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(path.join(__dirname, 'public'))) fs.mkdirSync(path.join(__dirname, 'public'));
if (!fs.existsSync(path.join(__dirname, 'public', 'img'))) fs.mkdirSync(path.join(__dirname, 'public', 'img'), { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Initialize wishes.json
if (!fs.existsSync(WISHES_FILE)) {
    fs.writeFileSync(WISHES_FILE, JSON.stringify([]));
}

// Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'wish-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve the static frontend
app.use('/public', express.static(path.join(__dirname, 'public'))); // Serve the images

// API: Get all wishes
app.get('/api/wishes', (req, res) => {
    const data = fs.readFileSync(WISHES_FILE, 'utf8');
    res.json(JSON.parse(data));
});

// API: Save a new wish
app.post('/api/wishes', upload.single('photo'), (req, res) => {
    try {
        const { name, msg } = req.body;
        const photoUrl = req.file ? `/public/img/wishes/${req.file.filename}` : null;

        const data = fs.readFileSync(WISHES_FILE, 'utf8');
        const wishes = JSON.parse(data);

        const newWish = {
            id: Date.now(),
            name,
            msg,
            photos: [photoUrl || "https://i.pravatar.cc/150"]
        };

        wishes.unshift(newWish);
        fs.writeFileSync(WISHES_FILE, JSON.stringify(wishes, null, 2));

        res.json({ success: true, wish: newWish });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Failed to save wish" });
    }
});

// API: Save appData (general settings)
app.post('/api/saveData', (req, res) => {
    try {
        const fullDataPath = path.join(__dirname, 'data', 'appData.json');
        fs.writeFileSync(fullDataPath, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.get('/api/loadData', (req, res) => {
    const fullDataPath = path.join(__dirname, 'data', 'appData.json');
    if (fs.existsSync(fullDataPath)) {
        res.json(JSON.parse(fs.readFileSync(fullDataPath, 'utf8')));
    } else {
        res.status(404).json(null);
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
