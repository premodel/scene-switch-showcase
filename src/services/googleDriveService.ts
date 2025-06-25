
interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  mimeType: string;
}

// Minimal function: list up to 1000 public files in a folder
async function listDriveFolder(folderId: string, apiKey: string) {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const fields = encodeURIComponent('files(id,name,mimeType,webContentLink)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=1000&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()).files;  // ← array of metadata objects
}

export const fetchGoogleDriveFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  console.log('Testing Google Drive API with folder:', folderId);
  
  try {
    // Use a demo API key - replace with your own for production
    const apiKey = 'AIzaSyDemoKey123456789'; // This is just a placeholder
    
    console.log('Using minimal function to fetch files from folder:', folderId);
    
    const files = await listDriveFolder(folderId, apiKey);
    console.log('Files retrieved:', files?.length || 0);
    console.log('File details:', files?.map((f: any) => ({ name: f.name, mimeType: f.mimeType })));
    
    // Filter for image files
    const imageFiles = files?.filter((file: any) => 
      file.mimeType && file.mimeType.startsWith('image/')
    ) || [];
    
    console.log('Image files found:', imageFiles.length);
    console.log('Image files:', imageFiles.map((f: any) => f.name));
    
    // Transform the response to match our interface
    const transformedFiles: GoogleDriveFile[] = imageFiles.map((file: any) => ({
      id: file.id,
      name: file.name,
      webViewLink: `https://drive.google.com/file/d/${file.id}/view`,
      webContentLink: file.webContentLink || `https://drive.google.com/uc?id=${file.id}`,
      mimeType: file.mimeType
    }));

    return transformedFiles;
  } catch (error) {
    console.error('Error in fetchGoogleDriveFiles:', error);
    throw error;
  }
};

export const getImageUrl = (file: GoogleDriveFile): string => {
  return `https://drive.google.com/uc?id=${file.id}`;
};
