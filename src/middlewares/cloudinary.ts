import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = 'default',
  options: any = {}
) => {
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
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        uploadData, 
        uploadOptions, 
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      originalDetails: result
    };
  } catch (error) {
    console.error('Cloudinary Upload Error Details:', error);
    throw new Error(`Gagal mengunggah gambar: ${error}`);
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    return result;
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    throw new Error('Gagal menghapus gambar');
  }
};

export default cloudinary;