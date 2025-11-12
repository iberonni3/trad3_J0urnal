import { supabase } from '@/integrations/supabase/client';

/**
 * Upload a trade screenshot to Supabase Storage
 * Uses signed URLs for private bucket access
 */
export const uploadTradeScreenshot = async (
  file: File,
  userId: string,
  tradeId: string
): Promise<string> => {
  try {
    console.log('=== Upload Debug Start ===');
    console.log('File:', file.name, file.size, file.type);
    console.log('UserId:', userId);
    console.log('TradeId:', tradeId);

    const fileExt = file.name.split('.').pop();
    const fileName = `${tradeId}.${fileExt}`;
    // Path structure: {userId}/{tradeId}.{ext}
    const filePath = `${userId}/${fileName}`;

    console.log('Upload path:', filePath);

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('trade-screenshots')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    console.log('Upload response:', { data: uploadData, error: uploadError });

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      throw uploadError;
    }

    console.log('✅ Upload successful');

    // Create a signed URL that expires in 10 years (maximum)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('trade-screenshots')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 years

    if (signedUrlError) {
      console.error('❌ Signed URL creation failed:', signedUrlError);
      throw signedUrlError;
    }

    console.log('✅ Signed URL created:', signedUrlData.signedUrl);
    console.log('=== Upload Debug End ===');

    return signedUrlData.signedUrl;
  } catch (error) {
    console.error('❌ Unexpected error in uploadTradeScreenshot:', error);
    throw error;
  }
};

/**
 * Get a signed URL for an existing file
 * Useful for refreshing expired URLs
 */
export const getSignedUrl = async (filePath: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('trade-screenshots')
    .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 years

  if (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }

  return data.signedUrl;
};

/**
 * Delete a trade screenshot from Supabase Storage
 */
export const deleteTradeScreenshot = async (screenshotUrl: string): Promise<void> => {
  try {
    console.log('Deleting screenshot:', screenshotUrl);

    // Extract the file path from the URL
    const url = new URL(screenshotUrl);
    const pathParts = url.pathname.split('/');
    
    // Find the index where the actual file path starts
    // For signed URLs, look for the pattern: /storage/v1/object/sign/trade-screenshots/...
    let filePath: string;
    
    if (url.pathname.includes('/object/sign/trade-screenshots/')) {
      // Signed URL format
      const signIndex = pathParts.indexOf('trade-screenshots');
      filePath = pathParts.slice(signIndex + 1).join('/');
      // Remove any query parameters from the last part
      filePath = filePath.split('?')[0];
    } else if (url.pathname.includes('/object/public/trade-screenshots/')) {
      // Public URL format
      const publicIndex = pathParts.indexOf('trade-screenshots');
      filePath = pathParts.slice(publicIndex + 1).join('/');
    } else {
      throw new Error('Invalid screenshot URL format');
    }

    console.log('Extracted file path:', filePath);

    const { error } = await supabase.storage
      .from('trade-screenshots')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    console.log('✅ Screenshot deleted successfully');
  } catch (error) {
    console.error('❌ Unexpected error in deleteTradeScreenshot:', error);
    throw error;
  }
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (file: File): void => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit.');
  }
};

/**
 * List all screenshots for a user
 */
export const listUserScreenshots = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.storage
      .from('trade-screenshots')
      .list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error listing screenshots:', error);
      throw error;
    }

    return data.map(file => `${userId}/${file.name}`);
  } catch (error) {
    console.error('❌ Unexpected error in listUserScreenshots:', error);
    throw error;
  }
};