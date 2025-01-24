import dotenv from 'dotenv';
dotenv.config();

import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

import connectMongoDB from './db/connectMongoDB.js';
import config from './config/index.js';

cloudinary.config(config.cloudinary);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
  connectMongoDB();
});
