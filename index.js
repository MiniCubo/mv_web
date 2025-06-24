const express = require('express');
const app = express();
const PORT = 3000;

// EJS
app.set('view engine', 'ejs');

// Static files
app.use(express.static('public'));

// Main page
app.get('/', (req, res) => {
    res.render('scheduler');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
