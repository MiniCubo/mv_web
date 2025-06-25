require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

// EJS
app.set('view engine', 'ejs');

// Static files
app.use(express.static('public'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB connection
const mongoUrl = process.env.MONGODB_URI;

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Database model
const Schedule = mongoose.model('Schedule', new mongoose.Schema({
    name: { type: String, required: true },
    startDate: Date,
    days: [{
        dayNumber: Number,
        date: Date,
        image: String,
        comment: String
    }],
    createdAt: { type: Date, default: Date.now }
}));

// Routes
app.get('/', async (req, res) => {
    const schedules = await Schedule.find().sort({ createdAt: -1 });
    res.render('scheduler', { schedules });
});

// Save schedule
app.post('/save-schedule', async (req, res) => {
    try {
        const { name, scheduleData } = req.body;

        const newSchedule = new Schedule({
            name,
            startDate: scheduleData.startDate,
            days: scheduleData.days.map(day => ({
                dayNumber: day.dayNumber,
                date: day.date,
                image: day.image,
                comment: day.comment
            }))
        });

        await newSchedule.save();
        res.json({ success: true, message: 'Schedule saved successfully' });
    } catch (error) {
        console.error('Error saving schedule:', error);
        res.status(500).json({ success: false, message: 'Error saving schedule' });
    }
});

// Load schedule
app.get('/load-schedule/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }
        res.json({ success: true, schedule });
    } catch (error) {
        console.error('Error loading schedule:', error);
        res.status(500).json({ success: false, message: 'Error loading schedule' });
    }
});

// Delete schedule
app.delete('/delete-schedule/:id', async (req, res) => {
    try {
        const result = await Schedule.deleteOne({ _id: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        res.json({ success: true, message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ success: false, message: 'Error deleting schedule' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
