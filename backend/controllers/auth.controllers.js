import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils/generateToken.js';
import config from '../config/index.js';
import { prepareUserResponse } from '../lib/utils/prepareUserResponse.js';
import { isValidEmail } from '../lib/utils/isValidEmail.js';

export const signup = async (req, res) => {
    try {
        const { username, fullName, email, password } = req.body;

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username is already taken' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email is already taken' });
        }

        if (password.length < config.minPasswordLength) {
            return res
                .status(400)
                .json({ error: 'Password must be at least 6 characters long' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            fullName,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            await newUser.save();

            const token = generateToken(newUser._id);
            res.cookie('jwt', token, config.cookie);

            const userResponse = prepareUserResponse(newUser);
            res.status(201).json(userResponse);
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error in signup controller: ', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user?.password || ''
        );

        if (!user || !isPasswordCorrect) {
            return res
                .status(400)
                .json({ error: 'Invalid username or password' });
        }

        const token = generateToken(user._id);
        res.cookie('jwt', token, config.cookie);

        const userResponse = prepareUserResponse(user);
        res.status(200).json(userResponse);
    } catch (error) {
        console.error('Error in login controller: ', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie('jwt', '', { maxAge: 0 });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error in logout controller: ', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMe = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error('Error in getMe controller: ', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
