
import { supabase } from "@/integrations/supabase/client";

interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  mimeType: string;
}

export const fetchGoogleDriveFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  console.log('Fetching files from Google Drive folder via Supabase:', folderId);
  
  try {
    console.log('Making request to Supabase Edge Function...');
    
    const { data, error } = await supabase.functions.invoke('google-drive-files', {
      body: { folderId }
    });
    
    console.log('Supabase function response:', { data, error });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Backend request failed: ${error.message}`);
    }
    
    if (!data || !data.files) {
      console.error('No files data received from Supabase function');
      throw new Error('No files data received from backend');
    }
    
    console.log('Files retrieved via Supabase:', data.files.length);
    return data.files;
    
  } catch (error) {
    console.error('Error in fetchGoogleDriveFiles:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

export const getImageUrl = (file: GoogleDriveFile): string => {
  return `https://drive.google.com/uc?id=${file.id}`;
};
