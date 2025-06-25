
interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
}

export const fetchGoogleDriveFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  console.log('=== ATTEMPTING NEW APPROACH ===');
  console.log('Folder ID:', folderId);
  
  // Try direct public folder access without API key first
  try {
    console.log('=== TRYING PUBLIC RSS FEED APPROACH ===');
    const rssUrl = `https://drive.google.com/drive/folders/${folderId}`;
    console.log('RSS URL:', rssUrl);
    
    // This won't work due to CORS, but let's see what happens
    const rssResponse = await fetch(rssUrl);
    console.log('RSS Response status:', rssResponse.status);
  } catch (error) {
    console.log('RSS approach failed (expected due to CORS):', error);
  }
  
  // Try the API with a different approach - use the files.list endpoint directly
  const apiKey = 'AIzaSyAFImbwSbOoswBEy-PuRTnE4-hTYsodcbQ';
  
  try {
    console.log('=== TRYING SIMPLE FILES LIST ===');
    // Just try to list files without any parent query
    const simpleUrl = `https://www.googleapis.com/drive/v3/files?key=${apiKey}&fields=files(id,name,webViewLink,webContentLink,mimeType,parents)&pageSize=1000`;
    console.log('Simple URL:', simpleUrl);
    
    const response = await fetch(simpleUrl);
    console.log('Simple response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Total files accessible:', data.files?.length || 0);
      
      // Log all folder IDs we can see
      const allParents = data.files?.flatMap((f: any) => f.parents || []) || [];
      const uniqueParents = [...new Set(allParents)];
      console.log('All unique parent folder IDs:', uniqueParents);
      console.log('Looking for folder ID:', folderId);
      
      // Check if our folder ID exists in any parent
      const hasOurFolder = uniqueParents.includes(folderId);
      console.log('Our folder ID found in parents:', hasOurFolder);
      
      if (hasOurFolder) {
        const filesInFolder = data.files.filter((f: any) => 
          f.parents && f.parents.includes(folderId) && 
          f.mimeType && f.mimeType.startsWith('image/')
        );
        console.log('Image files in our folder:', filesInFolder.length);
        return filesInFolder;
      }
    } else {
      const errorText = await response.text();
      console.error('Simple API call failed:', response.status, errorText);
    }
  } catch (error) {
    console.error('Simple API approach failed:', error);
  }
  
  // Last resort: try to access the folder differently
  console.log('=== FOLDER ACCESS ISSUE DETECTED ===');
  console.log('The folder might not be accessible via the API even though it\'s "public"');
  console.log('Possible solutions:');
  console.log('1. The folder owner needs to enable "Anyone with the link can view" AND also enable API access');
  console.log('2. The API key needs additional permissions');
  console.log('3. The folder ID might be incorrect');
  
  return [];
};

export const getImageUrl = (file: GoogleDriveFile): string => {
  return `https://drive.google.com/uc?id=${file.id}`;
};
