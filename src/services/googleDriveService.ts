
interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  mimeType: string;
  resourceKey?: string;
}

// List files from Google Drive folder using the correct API endpoint
async function listDriveFolder(folderId: string, apiKey: string) {
  console.log('listDriveFolder called with:', { folderId, apiKeyLength: apiKey?.length });
  
  if (!folderId || folderId.trim() === '') {
    throw new Error('Folder ID is required and cannot be empty');
  }
  
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required and cannot be empty');
  }
  
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const fields = encodeURIComponent('files(id,name,mimeType,resourceKey)');
  
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&supportsAllDrives=true&includeItemsFromAllDrives=true&pageSize=1000&key=${apiKey}`;
  
  console.log('Making API request to:', url);
  
  const res = await fetch(url);
  console.log('API response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('API Error Response:', errorText);
    throw new Error(errorText);
  }
  
  const data = await res.json();
  console.log('API Response data:', data);
  return data.files;
}

export const fetchGoogleDriveFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  console.log('fetchGoogleDriveFiles called with folderId:', folderId);
  
  if (!folderId) {
    throw new Error('No folder ID provided');
  }
  
  try {
    // Your actual API key
    const apiKey = 'AIzaSyAFImbwSbOoswBEy-PuRTnE4-hTYsodcbQ';
    
    console.log('Fetching files from folder:', folderId);
    
    const files = await listDriveFolder(folderId, apiKey);
    console.log('Files retrieved:', files?.length || 0);
    console.log('File details:', files?.map((f: any) => ({ name: f.name, mimeType: f.mimeType, resourceKey: f.resourceKey })));
    
    // Filter for image files
    const imageFiles = files?.filter((file: any) => 
      file.mimeType && file.mimeType.startsWith('image/')
    ) || [];
    
    console.log('Image files found:', imageFiles.length);
    console.log('Image files:', imageFiles.map((f: any) => ({ name: f.name, resourceKey: f.resourceKey })));
    
    // Transform the response to match our interface
    const transformedFiles: GoogleDriveFile[] = imageFiles.map((file: any) => ({
      id: file.id,
      name: file.name,
      webViewLink: `https://drive.google.com/file/d/${file.id}/view`,
      webContentLink: `https://drive.google.com/uc?id=${file.id}`,
      mimeType: file.mimeType,
      resourceKey: file.resourceKey
    }));

    // Log the URLs we're generating for each file
    transformedFiles.forEach(file => {
      const imageUrl = getImageUrl(file);
      console.log(`File: ${file.name}`);
      console.log(`  resourceKey: ${file.resourceKey}`);
      console.log(`  Generated imageUrl: ${imageUrl}`);
    });

    return transformedFiles;
  } catch (error) {
    console.error('Error in fetchGoogleDriveFiles:', error);
    throw error;
  }
};

export const getImageUrl = (file: GoogleDriveFile): string => {
  console.log(`Getting image URL for file: ${file.name}`);
  console.log(`  resourceKey: ${file.resourceKey}`);
  
  // Use the correct Google Drive API endpoint for media streaming
  const apiKey = 'AIzaSyAFImbwSbOoswBEy-PuRTnE4-hTYsodcbQ';
  
  const baseUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&supportsAllDrives=true&key=${apiKey}`;
  
  // Append resourceKey only if it exists
  const finalUrl = file.resourceKey ? `${baseUrl}&resourceKey=${file.resourceKey}` : baseUrl;
  
  console.log(`  Generated URL: ${finalUrl}`);
  return finalUrl;
};
