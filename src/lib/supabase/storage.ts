import { supabase } from '@/integrations/supabase/client';

/**
 * Upload a trade screenshot to Supabase Storage
 */
export const uploadTradeScreenshot = async (
  file: File,
  userId: string,
  tradeId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${tradeId}.${fileExt}`;
  const filePath = `trade-screenshots/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('trade-screenshots')
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('trade-screenshots')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Delete a trade screenshot from Supabase Storage
 */
export const deleteTradeScreenshot = async (screenshotUrl: string): Promise<void> => {
  // Extract the file path from the URL
  const url = new URL(screenshotUrl);
  const pathParts = url.pathname.split('/');
  const filePath = pathParts.slice(pathParts.indexOf('trade-screenshots') + 1).join('/');

  const { error } = await supabase.storage
    .from('trade-screenshots')
    .remove([filePath]);

  if (error) throw error;
};
