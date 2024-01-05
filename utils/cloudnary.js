const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDNARY_NAME,
    api_key: process.env.CLOUDNARY_API_KEY,
    api_secret: process.env.CLOUDNARY_SECRET_KEY,
});

module.exports = cloudinary;

// const tourData = req.body;
// let uploadResponse;
// if (tourData.imageCover && tourData.imageCover.startsWith('data:image/')) {
//     uploadResponse = await cloudinary.uploader.upload(tourData.imageCover, {
//         upload_preset: "natours-tours"
//     })

//     tourData.imageCover = uploadResponse.secure_url
//     tourData.imageCover_public_id = uploadResponse.public_id
// }