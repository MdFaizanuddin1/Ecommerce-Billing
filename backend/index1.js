// {
// // const express = require('express');
// // const dotenv = require('dotenv');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const path = require('path');

// // // Import routes
// // const firmRoutes = require("./routes/firmRoutes");
// // const VenderRoute = require('./routes/venderRoute');
// // const productRoute = require('./routes/productRouter');
// // const userRoute = require('./routes/userRoutes');
// // const cartRoute = require('./routes/cartRoutes');
// // const reviewRouter = require('./routes/reviewRoutes');
// // const addressRouter = require('./routes/addressRoutes');
// // const orderRouter = require('./routes/orderRoutes');
// // const contactRouter = require('./routes/contactRoutes');
// // const wishlistRouter = require('./routes/wishlistRoutes');
// // const Product = require('./models/Product'); // Use the correct name for the model
// // const aadhaarRoutes = require('./routes/aadhaarRoutes');
// // const panRoutes = require('./routes/panRoutes');
// // const captureRoutes = require('./routes/captureImageRoutes');
// // const paymentRoute = require('./routes/paymentRoutes');
// // const fingerprintRoute = require('./routes/fingerprintRoutes');
// // const categoryRoutes = require('./routes/categoryRoutes');

// // const app = express();

// // // Load environment variables
// // dotenv.config();
// // app.use(cors());

// // const PORT = process.env.PORT || 8000; // Use environment variable or default to 8000
// // const MONGO_URI = process.env.MONGO_URI;

// // mongoose.connect(MONGO_URI, {
// //     useNewUrlParser: true,
// //     useUnifiedTopology: true,
// // }).then(() => {
// //     console.log('Connected to MongoDB');
// // }).catch((error) => {
// //     console.error('DB connection failed:', error.message);
// // });

// // // Middleware
// // app.use(express.json()); // for parsing application/json
// // app.use(express.urlencoded({ extended: true }));

// // // Serve static files from the uploads directory
// // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // // Routes
// // app.use('/fingerprint', fingerprintRoute);
// // app.use('/vender', VenderRoute);
// // app.use('/firm', firmRoutes);
// // app.use('/product', productRoute);
// // app.use('/auth', userRoute);
// // app.use('/cart', cartRoute);
// // app.use('/review', reviewRouter);
// // app.use('/api', paymentRoute);
// // app.use('/address', addressRouter);
// // app.use('/order', orderRouter);
// // app.use('/contact', contactRouter);
// // app.use('/wishlist', wishlistRouter);
// // app.use('/aadhaar', aadhaarRoutes);
// // app.use('/pan', panRoutes);
// // app.use('/capture', captureRoutes);
// // app.use('/api/categories', categoryRoutes);

// // // Search Endpoint
// // app.get('/apii/search', async (req, res) => {
// //     const query = req.query.q ? req.query.q.toLowerCase().trim() : '';

// //     try {
// //         const results = await Product.find({
// //             productname: { $regex: new RegExp(query, 'i') } // Ensure case-insensitive search
// //         });

// //         console.log('Search Results:', results); // Log the results
// //         res.json({ results });
// //     } catch (error) {
// //         console.error('Error fetching search results:', error);
// //         res.status(500).json({ message: 'Internal Server Error' });
// //     }
// // });

// // // Health Check Endpoint
// // app.get('/health', (req, res) => {
// //     res.status(200).json({ message: 'Server is healthy' });
// // });

// // // Home Route
// // app.get('/home', (req, res) => {
// //     res.send('<h1>This is Home Page</h1>');
// // });

// // // Error Handling Middleware
// // app.use((err, req, res, next) => {
// //     console.error(err.stack);
// //     res.status(500).json({ message: 'Internal Server Error', error: err.message });
// // });

// // // Start server
// // app.listen(PORT, () => {
// //     console.log(`Server running successfully at http://localhost:${PORT}`);
// // });

// }

import { app } from "./src/app.js";
import dotenv from "dotenv";
import connectDB from "./src/db/connectDb.js";

// config environment files
dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 80001;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`server is running at :${port}`);
    });
  })
  .catch((err) => {
    console.log(`mongo db connection failed !! ${err}`);
  });
