
interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  mimeType: string;
}

export const fetchGoogleDriveFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  console.log('Fetching files from Google Drive folder directly:', folderId);
  
  try {
    // Use a public Google Drive API key approach
    // For now, we'll use the public files approach that doesn't require authentication
    const apiKey = 'AIzaSyBq-YfUgFgPlPgGPYmnC9GE9vHvF4K2Jk8'; // This is a demo key, user should replace with their own
    
    console.log('Making direct request to Google Drive API...');
    
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&pageSize=1000&fields=files(id,name,webViewLink,webContentLink,mimeType)&key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('Google Drive API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Drive API error:', errorText);
      
      if (response.status === 403) {
        throw new Error('Google Drive API access denied. Please make sure your folder is publicly accessible and you have a valid API key.');
      }
      
      throw new Error(`Google Drive API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Files retrieved:', data.files?.length || 0);
    
    // Filter for image files
    const imageFiles = data.files?.filter((file: any) => 
      file.mimeType && file.mimeType.startsWith('image/')
    ) || [];
    
    console.log('Image files found:', imageFiles.length);
    
    return imageFiles;
    
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
