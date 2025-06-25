
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
    
    console.log('=== FETCHING FILES FROM FOLDER ===');
    console.log('Folder ID:', folderId);
    
    // Try multiple query approaches
    const queryApproaches = [
      // Method 1: Standard parent query with quotes
      `'${folderId}' in parents`,
      // Method 2: Standard parent query without quotes  
      `${folderId} in parents`,
      // Method 3: Direct parent equality
      `parents = '${folderId}'`
    ];
    
    for (let i = 0; i < queryApproaches.length; i++) {
      const query = queryApproaches[i];
      console.log(`=== TRYING QUERY METHOD ${i + 1} ===`);
      console.log('Query:', query);
      
      const filesUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink,webContentLink,mimeType)&key=${apiKey}`;
      console.log('Request URL:', filesUrl);
      
      try {
        const response = await fetch(filesUrl);
        console.log(`Method ${i + 1} response status:`, response.status);
        
        if (response.ok) {
          const data: GoogleDriveResponse = await response.json();
          console.log(`Method ${i + 1} response:`, data);
          
          if (data.files && data.files.length > 0) {
            console.log(`SUCCESS! Found ${data.files.length} files with method ${i + 1}`);
            return data.files;
          } else {
            console.log(`Method ${i + 1} returned empty files array`);
          }
        } else {
          const errorText = await response.text();
          console.error(`Method ${i + 1} failed:`, response.status, errorText);
        }
      } catch (error) {
        console.error(`Method ${i + 1} threw error:`, error);
      }
    }
    
    // If all specific queries failed, try listing all accessible files
    console.log('=== FALLBACK: LISTING ALL ACCESSIBLE FILES ===');
    const allFilesUrl = `https://www.googleapis.com/drive/v3/files?pageSize=1000&fields=files(id,name,webViewLink,webContentLink,mimeType,parents)&key=${apiKey}`;
    
    const allFilesResponse = await fetch(allFilesUrl);
    console.log('All files response status:', allFilesResponse.status);
    
    if (allFilesResponse.ok) {
      const allFilesData = await allFilesResponse.json();
      console.log('All files count:', allFilesData.files?.length || 0);
      
      // Filter files that have our folder as parent
      const filteredFiles = allFilesData.files?.filter((file: any) => 
        file.parents && file.parents.includes(folderId)
      ) || [];
      
      console.log('Filtered files for our folder:', filteredFiles.length);
      
      if (filteredFiles.length > 0) {
        return filteredFiles;
      }
      
      // If no files found in our folder, log all folder IDs for debugging
      const uniqueParents = [...new Set(allFilesData.files?.flatMap((f: any) => f.parents || []) || [])];
      console.log('All unique folder IDs found:', uniqueParents);
      console.log('Looking for folder ID:', folderId);
    }
    
    console.log('=== NO FILES FOUND WITH ANY METHOD ===');
    return [];
    
  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    throw error;
  }
};

export const getImageUrl = (file: GoogleDriveFile): string => {
  // Convert Google Drive file to direct image URL
  return `https://drive.google.com/uc?id=${file.id}`;
};
