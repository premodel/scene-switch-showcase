
interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
}

export const fetchGoogleDriveFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  console.log('Fetching files from Google Drive folder via Supabase:', folderId);
  
  try {
    console.log('Making request to Supabase Edge Function...');
    
    // Call our Supabase Edge Function instead of Google's API directly
    const response = await fetch('/functions/v1/google-drive-files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folderId })
    });
    
    console.log('Supabase function response:', {
      status: response.status,
      statusText: response.statusText
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Supabase function error:', errorData);
      throw new Error(`Backend request failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('Backend response data:', data);
    
    if (!data.files) {
      console.error('No files property in backend response');
      return [];
    }
    
    console.log('Files retrieved from backend:', data.files.length);
    
    return data.files;
    
  } catch (error) {
    console.error('Error in fetchGoogleDriveFiles:', error);
    throw error;
  }
};

export const getImageUrl = (file: GoogleDriveFile): string => {
  return `https://drive.google.com/uc?id=${file.id}`;
};
