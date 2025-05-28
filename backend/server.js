const express= require('express');
const multer= require('multer');
const cors= require('cors');
 const path=require('path');

 const app= express();
 app.use(cors());

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
// Initialize multer with the storage configuration
const upload = multer({ storage: storage });
// Serve static files from the 'uploads' directory
app.post('/upload', upload.single('photo'), (req, res) => {
    const description = req.body.description;
        const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'AA' });
    }
    if (!description) {
        return res.status(400).json({ error: 'BB' });
    }

    res.json({
        message: 'File uploaded successfully',
        filename: file.originalname,
        description: description,
    });
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});