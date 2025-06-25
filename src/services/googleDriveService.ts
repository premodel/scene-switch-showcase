
interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  mimeType: string;
}

// Since we can't call the API directly due to CORS, we'll use a different approach
// We'll generate the image URLs directly from the folder ID and known file patterns
export const fetchGoogleDriveFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  console.log('Using alternative approach for Google Drive folder:', folderId);
  
  // For now, we'll return mock data to demonstrate the UI
  // In a real implementation, you'd need to either:
  // 1. Use a CORS proxy service
  // 2. Have users manually list their files
  // 3. Use Google Drive's embed API
  
  const mockFiles: GoogleDriveFile[] = [
    {
      id: 'mock1',
      name: 'kitchen-modern.jpg',
      webViewLink: `https://drive.google.com/file/d/mock1/view`,
      webContentLink: `https://drive.google.com/uc?id=mock1`,
      mimeType: 'image/jpeg'
    },
    {
      id: 'mock2', 
      name: 'kitchen-traditional.jpg',
      webViewLink: `https://drive.google.com/file/d/mock2/view`,
      webContentLink: `https://drive.google.com/uc?id=mock2`,
      mimeType: 'image/jpeg'
    },
    {
      id: 'mock3',
      name: 'bedroom-modern.jpg', 
      webViewLink: `https://drive.google.com/file/d/mock3/view`,
      webContentLink: `https://drive.google.com/uc?id=mock3`,
      mimeType: 'image/jpeg'
    },
    {
      id: 'mock4',
      name: 'bedroom-cozy.jpg',
      webViewLink: `https://drive.google.com/file/d/mock4/view`, 
      webContentLink: `https://drive.google.com/uc?id=mock4`,
      mimeType: 'image/jpeg'
    }
  ];

  console.log('Returning mock files for demonstration:', mockFiles);
  return mockFiles;
};

export const getImageUrl = (file: GoogleDriveFile): string => {
  return `https://drive.google.com/uc?id=${file.id}`;
};
