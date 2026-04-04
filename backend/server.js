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

    // Service schema and model
    const ServiceSchema = new mongoose.Schema({
        provider_id: { type: String, required: true },
        category_id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        price: { type: Number, default: 0 },
        price_type: { type: String, default: 'fixed' },
        experience_years: { type: Number, default: 0 },
        is_active: { type: Boolean, default: true },
        created_at: { type: Date, default: Date.now },
    }, { timestamps: true });

    const Service = mongoose.model('Service', ServiceSchema);

    // Service Request schema and model
    const ServiceRequestSchema = new mongoose.Schema({
        taker_id: { type: String, required: true },
        provider_id: { type: String, required: true },
        service_id: { type: String, required: true },
        description: { type: String, required: true },
        address: { type: String, required: true },
        preferred_date: { type: String, default: null },
        preferred_time: { type: String, default: null },
        status: { type: String, default: 'pending' },
        created_at: { type: Date, default: Date.now },
    }, { timestamps: true });

    const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema);

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

    // services endpoints
    app.get('/api/services', async (req, res) => {
        try {
            const filter = { is_active: true };
            if (req.query.provider_id) filter.provider_id = req.query.provider_id;
            if (req.query.category_id) filter.category_id = req.query.category_id;
            const services = await Service.find(filter).sort({ created_at: -1 });
            res.json(services);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching services', error: err });
        }
    });

    app.get('/api/services/:id', async (req, res) => {
        try {
            const service = await Service.findById(req.params.id);
            if (!service) return res.status(404).json({ message: 'Service not found' });
            res.json(service);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching service', error: err });
        }
    });

    app.post('/api/services', async (req, res) => {
        try {
            const payload = {
                provider_id: req.body.provider_id,
                category_id: req.body.category_id,
                title: req.body.title,
                description: req.body.description || '',
                price: Number(req.body.price) || 0,
                price_type: req.body.price_type || 'fixed',
                experience_years: Number(req.body.experience_years) || 0,
                is_active: req.body.is_active !== undefined ? req.body.is_active : true,
            };
            const service = new Service(payload);
            await service.save();
            res.status(201).json(service);
        } catch (err) {
            res.status(500).json({ message: 'Error adding service', error: err });
        }
    });

    app.delete('/api/services/:id', async (req, res) => {
        try {
            const deleted = await Service.findByIdAndDelete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Service not found' });
            res.json({ message: 'Service deleted', id: req.params.id });
        } catch (err) {
            res.status(500).json({ message: 'Error deleting service', error: err });
        }
    });

    // service requests endpoints
    app.get('/api/service-requests', async (req, res) => {
        try {
            const filter = {};
            if (req.query.provider_id) filter.provider_id = req.query.provider_id;
            if (req.query.taker_id) filter.taker_id = req.query.taker_id;
            if (req.query.status) filter.status = req.query.status;
            const requests = await ServiceRequest.find(filter).sort({ created_at: -1 });
            res.json(requests);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching service requests', error: err });
        }
    });

    app.post('/api/service-requests', async (req, res) => {
        try {
            const payload = {
                taker_id: req.body.taker_id,
                provider_id: req.body.provider_id,
                service_id: req.body.service_id,
                description: req.body.description,
                address: req.body.address,
                preferred_date: req.body.preferred_date || null,
                preferred_time: req.body.preferred_time || null,
                status: req.body.status || 'pending',
            };
            const serviceRequest = new ServiceRequest(payload);
            await serviceRequest.save();
            res.status(201).json(serviceRequest);
        } catch (err) {
            res.status(500).json({ message: 'Error creating service request', error: err });
        }
    });

    app.put('/api/service-requests/:id', async (req, res) => {
        try {
            const updated = await ServiceRequest.findByIdAndUpdate(
                req.params.id,
                { status: req.body.status },
                { new: true }
            );
            if (!updated) return res.status(404).json({ message: 'Service request not found' });
            res.json(updated);
        } catch (err) {
            res.status(500).json({ message: 'Error updating service request', error: err });
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