
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
    
    console.log('=== TRYING DIRECT FOLDER ACCESS ===');
    console.log('Folder ID:', folderId);
    
    // Try to access the folder directly first
    const folderUrl = `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,mimeType&key=${apiKey}`;
    console.log('Folder access URL:', folderUrl);
    
    const folderResponse = await fetch(folderUrl);
    console.log('Folder response status:', folderResponse.status);
    
    if (!folderResponse.ok) {
      const folderError = await folderResponse.text();
      console.error('Cannot access folder directly:', folderError);
      throw new Error(`Cannot access folder: ${folderResponse.status} - ${folderError}`);
    }
    
    const folderData = await folderResponse.json();
    console.log('Folder data:', folderData);
    
    // Now try to list files without the 'in parents' query - use a simpler approach
    console.log('=== TRYING ALTERNATIVE QUERY METHOD ===');
    
    // Method 1: Try without quotes around folder ID
    const query = `${folderId} in parents`;
    const filesUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink,webContentLink,mimeType,parents)&key=${apiKey}`;
    console.log('Files query URL:', filesUrl);
    
    const filesResponse = await fetch(filesUrl);
    console.log('Files response status:', filesResponse.status);
    
    if (!filesResponse.ok) {
      const filesError = await filesResponse.text();
      console.error('Files query failed:', filesError);
      
      // Fallback: Try to list all files and filter manually (less efficient but might work)
      console.log('=== FALLBACK: LISTING ALL FILES ===');
      const allFilesUrl = `https://www.googleapis.com/drive/v3/files?pageSize=1000&fields=files(id,name,webViewLink,webContentLink,mimeType,parents)&key=${apiKey}`;
      
      const allFilesResponse = await fetch(allFilesUrl);
      if (!allFilesResponse.ok) {
        throw new Error(`All queries failed. Last error: ${filesResponse.status} - ${filesError}`);
      }
      
      const allFilesData = await allFilesResponse.json();
      console.log('All files response:', allFilesData);
      
      // Filter files that have our folder as parent
      const filteredFiles = allFilesData.files?.filter((file: any) => 
        file.parents && file.parents.includes(folderId)
      ) || [];
      
      console.log('Filtered files:', filteredFiles);
      return filteredFiles;
    }
    
    const filesData: GoogleDriveResponse = await filesResponse.json();
    console.log('=== FILES QUERY SUCCESS ===');
    console.log('Files response:', filesData);
    
    if (filesData.error) {
      console.error('Google Drive API returned error:', filesData.error);
      throw new Error(`Google Drive API error: ${filesData.error.message}`);
    }
    
    console.log('Files found:', filesData.files?.length || 0);
    return filesData.files || [];
  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    throw error;
  }
};

export const getImageUrl = (file: GoogleDriveFile): string => {
  // Convert Google Drive file to direct image URL
  return `https://drive.google.com/uc?id=${file.id}`;
};
