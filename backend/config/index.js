import dotenv from 'dotenv';
dotenv.config();

export default {
    tokenExpIn: '15d',
    cookie: {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
    },
    minPasswordLength: 6,
};
