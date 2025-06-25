
interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
}

export const fetchGoogleDriveFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  console.log('Fetching files from Google Drive folder:', folderId);
  
  const apiKey = 'AIzaSyAFImbwSbOoswBEy-PuRTnE4-hTYsodcbQ';
  
  // Build the URL exactly like the working curl command
  // Notice: using + instead of %20 for spaces, and manual encoding
  const query = `'${folderId}'+in+parents+and+trashed=false`;
  const fields = 'files(id,name,webViewLink,webContentLink,mimeType)';
  
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=1000&fields=${fields}&key=${apiKey}`;
  
  console.log('API URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    console.log('Total files found:', data.files?.length || 0);
    
    if (!data.files || data.files.length === 0) {
      return [];
    }
    
    // Filter for image files
    const imageFiles = data.files.filter((file: any) => 
      file.mimeType && file.mimeType.startsWith('image/')
    );
    
    console.log('Image files found:', imageFiles.length);
    console.log('Image files:', imageFiles.map((f: any) => f.name));
    
    return imageFiles;
    
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
};

export const getImageUrl = (file: GoogleDriveFile): string => {
  return `https://drive.google.com/uc?id=${file.id}`;
};
