import dotenv from 'dotenv';
dotenv.config();

import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/post.route.js';
import notificationRoutes from './routes/notification.route.js';

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
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);

app.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
  connectMongoDB();
});
