
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
    
    // Debug: Let's try multiple query approaches
    console.log('=== DEBUGGING GOOGLE DRIVE API ===');
    console.log('Folder ID:', folderId);
    console.log('Folder ID type:', typeof folderId);
    console.log('Folder ID length:', folderId.length);
    
    // Try the standard query format
    const query = `'${folderId}' in parents`;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodedQuery}&fields=files(id,name,webViewLink,webContentLink,mimeType,parents)&key=${apiKey}`;
    
    console.log('Query:', query);
    console.log('Encoded query:', encodedQuery);
    console.log('Full URL:', url);
    
    const response = await fetch(url);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Google Drive API error: ${response.status} - ${errorText}`);
    }
    
    const data: GoogleDriveResponse = await response.json();
    console.log('=== FULL API RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error('Google Drive API returned error:', data.error);
      throw new Error(`Google Drive API error: ${data.error.message}`);
    }
    
    console.log('Files array:', data.files);
    console.log('Number of files:', data.files?.length || 0);
    
    if (!data.files || data.files.length === 0) {
      console.warn('=== EMPTY FOLDER DEBUGGING ===');
      console.warn('No files found. Possible reasons:');
      console.warn('1. Folder is actually empty');
      console.warn('2. Folder ID is incorrect');
      console.warn('3. Folder is not publicly accessible');
      console.warn('4. Files exist but are in a subfolder');
      console.warn(`5. Try visiting: https://drive.google.com/drive/folders/${folderId}`);
      
      // Let's also try a query without the folder restriction to test API key
      console.warn('=== TESTING API KEY WITH UNRESTRICTED QUERY ===');
      const testUrl = `https://www.googleapis.com/drive/v3/files?fields=files(id,name)&key=${apiKey}`;
      try {
        const testResponse = await fetch(testUrl);
        const testData = await testResponse.json();
        console.log('Test query result (your files):', testData);
      } catch (testError) {
        console.error('Test query failed:', testError);
      }
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
