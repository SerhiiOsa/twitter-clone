export const prepareUserResponse = (userData) => {
    return {
        _id: userData._id,
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        followers: userData.followers,
        following: userData.following,
        profileImg: userData.profileImg,
        coverImg: userData.coverImg,
    };
};
