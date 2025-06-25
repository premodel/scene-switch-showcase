
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
    
    console.log('=== DEBUGGING GOOGLE DRIVE API ===');
    console.log('Folder ID:', folderId);
    console.log('Folder ID type:', typeof folderId);
    console.log('Folder ID length:', folderId.length);
    
    // First, let's test if the API key works at all by listing some files
    console.log('=== TESTING API KEY ===');
    const testUrl = `https://www.googleapis.com/drive/v3/files?pageSize=5&fields=files(id,name,parents)&key=${apiKey}`;
    const testResponse = await fetch(testUrl);
    const testData = await testResponse.json();
    console.log('Test API response:', testData);
    
    // Now try the folder-specific query with different approaches
    console.log('=== TRYING FOLDER-SPECIFIC QUERIES ===');
    
    // Approach 1: Standard format
    const query1 = `'${folderId}' in parents`;
    const url1 = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query1)}&fields=files(id,name,webViewLink,webContentLink,mimeType,parents)&key=${apiKey}`;
    console.log('Approach 1 URL:', url1);
    
    const response1 = await fetch(url1);
    console.log('Approach 1 status:', response1.status);
    
    if (!response1.ok) {
      const errorText1 = await response1.text();
      console.error('Approach 1 error:', errorText1);
      
      // Approach 2: Without quotes
      console.log('=== TRYING APPROACH 2 (no quotes) ===');
      const query2 = `${folderId} in parents`;
      const url2 = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query2)}&fields=files(id,name,webViewLink,webContentLink,mimeType,parents)&key=${apiKey}`;
      console.log('Approach 2 URL:', url2);
      
      const response2 = await fetch(url2);
      console.log('Approach 2 status:', response2.status);
      
      if (!response2.ok) {
        const errorText2 = await response2.text();
        console.error('Approach 2 error:', errorText2);
        throw new Error(`Both query approaches failed. Last error: ${response2.status} - ${errorText2}`);
      }
      
      const data2 = await response2.json();
      console.log('Approach 2 success! Data:', data2);
      return data2.files || [];
    }
    
    const data1: GoogleDriveResponse = await response1.json();
    console.log('=== APPROACH 1 SUCCESS ===');
    console.log('Full response:', JSON.stringify(data1, null, 2));
    
    if (data1.error) {
      console.error('Google Drive API returned error:', data1.error);
      throw new Error(`Google Drive API error: ${data1.error.message}`);
    }
    
    console.log('Files found:', data1.files?.length || 0);
    if (data1.files && data1.files.length > 0) {
      console.log('File names:', data1.files.map(f => f.name));
    }
    
    return data1.files || [];
  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    throw error;
  }
};

export const getImageUrl = (file: GoogleDriveFile): string => {
  // Convert Google Drive file to direct image URL
  return `https://drive.google.com/uc?id=${file.id}`;
};
