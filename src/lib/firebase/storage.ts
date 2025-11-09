import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a trade screenshot to Firebase Storage
 * @param file - The image file to upload
 * @param userId - The user's ID
 * @param tradeId - The trade's ID
 * @returns The download URL of the uploaded file
 */
export const uploadTradeScreenshot = async (
  file: File,
  userId: string,
  tradeId: string
): Promise<string> => {
  // Create a unique filename with timestamp to avoid collisions
  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;
  const storagePath = `screenshots/${userId}/${tradeId}/${filename}`;
  
  const storageRef = ref(storage, storagePath);
  
  // Upload the file
  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });
  
  // Get and return the download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

/**
 * Delete a trade screenshot from Firebase Storage
 * @param screenshotUrl - The full download URL of the screenshot to delete
 */
export const deleteTradeScreenshot = async (screenshotUrl: string): Promise<void> => {
  try {
    // Extract the storage path from the URL
    const storageRef = ref(storage, screenshotUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting screenshot:', error);
    // Don't throw - screenshot might already be deleted
  }
};

/**
 * Upload multiple screenshots for a trade
 * @param files - Array of image files to upload
 * @param userId - The user's ID
 * @param tradeId - The trade's ID
 * @returns Array of download URLs
 */
export const uploadMultipleScreenshots = async (
  files: File[],
  userId: string,
  tradeId: string
): Promise<string[]> => {
  const uploadPromises = files.map(file => 
    uploadTradeScreenshot(file, userId, tradeId)
  );
  
  return await Promise.all(uploadPromises);
};

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in megabytes (default: 5MB)
 * @returns True if valid, throws error otherwise
 */
export const validateImageFile = (file: File, maxSizeMB = 5): boolean => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).');
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB. Please choose a smaller file.`);
  }
  
  return true;
};
