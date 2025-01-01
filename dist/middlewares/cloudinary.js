"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadToCloudinary = async (file, folder = 'default', options = {}) => {
    try {
        const uploadOptions = {
            folder: folder,
            resource_type: 'auto',
            ...options
        };
        // file buffer ke base64
        const uploadData = file.buffer
            ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
            : file.path;
        // Upload lengkap
        const result = await new Promise((resolve, reject) => {
            cloudinary_1.v2.uploader.upload(uploadData, uploadOptions, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
        return {
            url: result.secure_url,
            publicId: result.public_id,
            originalDetails: result
        };
    }
    catch (error) {
        console.error('Cloudinary Upload Error Details:', error);
        throw new Error(`Gagal mengunggah gambar: ${error}`);
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await new Promise((resolve, reject) => {
            cloudinary_1.v2.uploader.destroy(publicId, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
        return result;
    }
    catch (error) {
        console.error('Cloudinary Delete Error:', error);
        throw new Error('Gagal menghapus gambar');
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.default = cloudinary_1.v2;
