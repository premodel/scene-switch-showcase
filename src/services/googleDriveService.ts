
interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
}

interface GoogleDriveResponse {
  files: GoogleDriveFile[];
}

export const fetchGoogleDriveFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  try {
    // Using Google Drive API v3 to list files in a folder
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,webViewLink,webContentLink)&key=${import.meta.env.VITE_GOOGLE_DRIVE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.status}`);
    }
    
    const data: GoogleDriveResponse = await response.json();
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
