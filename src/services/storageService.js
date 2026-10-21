import { supabase, isSupabaseConfigured } from './supabaseClient';

const BUCKET_NAME = 'saak-media';

/**
 * Upload an image file to Supabase Blob Storage
 * @param {File} file - Browser File object
 * @param {string} folder - Destination folder within bucket (e.g., 'creations' or 'receipts')
 * @returns {Promise<string>} Public CDN URL of the uploaded image
 */
export async function uploadImageBlob(file, folder = 'creations') {
  if (!file) throw new Error('No file provided for upload.');

  // If Supabase credentials are configured, upload to Cloud Object Storage
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
      const cleanFileName = file.name ? file.name.replace(/[^a-zA-Z0-9]/g, '_') : 'image';
      const filePath = `${folder}/${Date.now()}_${cleanFileName}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.warn('Supabase blob upload failed, falling back to local data URL:', error.message);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.error('Error during cloud storage upload:', err);
    }
  }

  // Graceful Local Fallback: Convert to base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
