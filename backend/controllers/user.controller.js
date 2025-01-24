import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

import User from '../models/user.model.js';
import Notifiation from '../models/notification.model.js';
import config from '../config/index.js';

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserProfile: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    const usersFollowedByMeIds = currentUser.following;

    const users = await User.aggregate([
      { $match: { _id: { $ne: currentUser._id } } },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowedByMeIds.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error('Error in suggestedUsers: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    const usertoModify = await User.findById(id);
    const currentUser = req.user;
    if (id === currentUser._id.toString()) {
      return res
        .status(400)
        .json({ error: 'You cannot follow/unfollow yourself' });
    }

    if (!usertoModify || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      //Unfollow the user
      await User.findByIdAndUpdate(id, {
        $pull: { followers: currentUser._id },
      });
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: id },
      });

      res.status(200).json({ message: 'User unfollowed successfully' });
    } else {
      //Follow the user
      await User.findByIdAndUpdate(id, {
        $push: { followers: currentUser._id },
      });
      await User.findByIdAndUpdate(currentUser._id, {
        $push: { following: id },
      });

      const notification = new Notifiation({
        type: 'follow',
        from: currentUser._id,
        to: usertoModify._id,
      });
      await notification.save();

      res.status(200).json({ message: 'User followed successfully' });
    }
  } catch (error) {
    console.error('Error in followUnfollowUser: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      username,
      fullName,
      email,
      currentPassword,
      newPassword,
      bio,
      link,
    } = req.body;
    let { profileImg, coverImg } = req.body;

    if (
      (!currentPassword && newPassword) ||
      (currentPassword && !newPassword)
    ) {
      return res.status(400).json({
        error: 'Please provide both current password and new password',
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          error: 'Current password is incorrect',
        });
      }

      if (newPassword.length < config.minPasswordLength) {
        return res
          .status(400)
          .json({ error: 'Password must be at least 6 characters long' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split('/').pop().split('.')[0]
        );
      }

      const uploadResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split('/').pop().split('.')[0]
        );
      }

      const uploadResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error in updateUser: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
