import {cloudinary} from '../config/cloudinary.config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path. dirname(__filename);

// Upload single file to Cloudinary
export const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file. path, {
      folder: 'travel_crud', // Creates a folder in Cloudinary
      resource_type: 'auto',
    });
    
    // Delete the temporary file after upload
    fs.unlinkSync(file.path);
    
    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    // Delete temp file if upload fails
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw new Error(`Cloudinary upload failed: ${error. message}`);
  }
};

// Upload multiple files to Cloudinary
export const uploadMultipleToCloudinary = async (files) => {
  try {
    const uploadPromises = files.map(file =>
      cloudinary.uploader. upload(file.path, {
        folder: 'travel_crud',
        resource_type: 'auto',
      })
    );

    const results = await Promise.all(uploadPromises);

    // Delete temporary files
    files.forEach(file => {
      if (fs.existsSync(file. path)) {
        fs.unlinkSync(file.path);
      }
    });

    return results.map(result => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
  } catch (error) {
    // Delete temp files if upload fails
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};