const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// mongoose connection
mongoose.connect('mongodb://localhost:27017/kodequantum', {
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

    // schema
    const ContactSchema = new mongoose.Schema({
        name: String,
        email: String,
        message: String,
    });

    const Contact = mongoose.model('Contact', ContactSchema);

    // routes
    app.post('/api/contact', async (req, res) => {
        try {
            const newContact = new Contact(req.body);
            await newContact.save();
            res.status(201).json({ message: 'Contact saved successfully' });
        }
        catch (err) {
            res.status(500).json({ message: 'Error saving contact', error: err });
        }
    });

    app.listen(5000, () => {
        console.log('Server is running on port 5000');
    });

// we have done with the pm2 for the backend server as the production manager. To start the server with pm2, run the following command in the terminal:
// pm2 start server.js --name "localconnect-backend"

// To view the logs of the server, run:
// pm2 logs localconnect-backend

// To stop the server, run:
// pm2 stop localconnect-backend

// To restart the server, run:
// pm2 restart localconnect-backend

// To view the status of the server, run:
// pm2 status localconnect-backend