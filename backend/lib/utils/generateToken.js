import jwt from 'jsonwebtoken';
import config from '../../config/index.js';

export const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: config.tokenExpIn,
    });
};
