
interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
}

interface GoogleDriveResponse {
  files: GoogleDriveFile[];
  error?: {
    code: number;
    message: string;
    errors: Array<{
      domain: string;
      reason: string;
      message: string;
    }>;
  };
}

export const fetchGoogleDriveFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  try {
    const apiKey = 'AIzaSyAFImbwSbOoswBEy-PuRTnE4-hTYsodcbQ';
    
    // Using Google Drive API v3 to list files in a folder
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,webViewLink,webContentLink)&key=${apiKey}`;
    
    console.log('Making request to Google Drive API...');
    console.log('Folder ID:', folderId);
    console.log('API URL:', url);
    
    const response = await fetch(url);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Google Drive API error: ${response.status} - ${errorText}`);
    }
    
    const data: GoogleDriveResponse = await response.json();
    console.log('Raw Google Drive API response:', data);
    
    if (data.error) {
      console.error('Google Drive API returned error:', data.error);
      throw new Error(`Google Drive API error: ${data.error.message}`);
    }
    
    console.log('Number of files returned:', data.files?.length || 0);
    console.log('File names:', data.files?.map(f => f.name) || []);
    
    if (!data.files || data.files.length === 0) {
      console.warn('No files found in folder. This could mean:');
      console.warn('1. The folder is empty');
      console.warn('2. The folder ID is incorrect');
      console.warn('3. The folder is not publicly accessible');
      console.warn('4. The API key does not have permission to access this folder');
    }
    
    return data.files || [];
  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    throw error;
  }
};

export const getImageUrl = (file: GoogleDriveFile): string => {
  // Convert Google Drive file to direct image URL
  return `https://drive.google.com/uc?id=${file.id}`;
};
