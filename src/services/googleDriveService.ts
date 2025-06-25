
interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  mimeType: string;
  resourceKey?: string;
}

// Minimal function: list up to 1000 public files in a folder
async function listDriveFolder(folderId: string, apiKey: string) {
  console.log('listDriveFolder called with:', { folderId, apiKeyLength: apiKey?.length });
  
  if (!folderId || folderId.trim() === '') {
    throw new Error('Folder ID is required and cannot be empty');
  }
  
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required and cannot be empty');
  }
  
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  // Include resourceKey in fields and use proper field syntax
  const fields = encodeURIComponent('files(id,name,mimeType,webContentLink,webViewLink,resourceKey,thumbnailLink)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=1000&key=${apiKey}&supportsAllDrives=true&includeItemsFromAllDrives=true&corpora=allDrives`;
  
  console.log('Making request to URL:', url);

  const res = await fetch(url);
  console.log('Response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('API Error Response:', errorText);
    throw new Error(errorText);
  }
  
  const data = await res.json();
  console.log('API Response data:', data);
  return data.files;  // ← array of metadata objects
}

export const fetchGoogleDriveFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  console.log('fetchGoogleDriveFiles called with folderId:', folderId);
  
  if (!folderId) {
    throw new Error('No folder ID provided');
  }
  
  try {
    // Your actual API key
    const apiKey = 'AIzaSyAFImbwSbOoswBEy-PuRTnE4-hTYsodcbQ';
    
    console.log('Using minimal function to fetch files from folder:', folderId);
    
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
      webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
      webContentLink: file.webContentLink || `https://drive.google.com/uc?id=${file.id}`,
      mimeType: file.mimeType,
      resourceKey: file.resourceKey
    }));

    // Log the URLs we're generating for each file
    transformedFiles.forEach(file => {
      const imageUrl = getImageUrl(file);
      console.log(`File: ${file.name}`);
      console.log(`  webContentLink: ${file.webContentLink}`);
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
  console.log(`  webContentLink: ${file.webContentLink}`);
  console.log(`  resourceKey: ${file.resourceKey}`);
  
  // For shared drive files with resourceKey, use it with webContentLink
  if (file.resourceKey && file.webContentLink) {
    const urlWithResourceKey = `${file.webContentLink}&resourcekey=${file.resourceKey}`;
    console.log(`  Using URL with resourceKey: ${urlWithResourceKey}`);
    return urlWithResourceKey;
  }
  
  // Use webContentLink and convert from download to view for embeddable images
  if (file.webContentLink) {
    const viewUrl = file.webContentLink.replace('export=download', 'export=view');
    console.log(`  Using converted view URL: ${viewUrl}`);
    return viewUrl;
  }
  
  // Fallback to direct URL with resourceKey if available
  if (file.resourceKey) {
    const fallbackUrl = `https://drive.google.com/uc?export=view&id=${file.id}&resourcekey=${file.resourceKey}`;
    console.log(`  Using fallback URL with resourceKey: ${fallbackUrl}`);
    return fallbackUrl;
  }
  
  // Final fallback
  const finalFallback = `https://drive.google.com/uc?export=view&id=${file.id}`;
  console.log(`  Using final fallback URL: ${finalFallback}`);
  return finalFallback;
};
