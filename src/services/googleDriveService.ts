
interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
}

export const fetchGoogleDriveFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  console.log('Fetching files from Google Drive folder:', folderId);
  
  const apiKey = 'AIzaSyAFImbwSbOoswBEy-PuRTnE4-hTYsodcbQ';
  
  // Use the EXACT same URL structure as the working curl command
  const baseUrl = 'https://www.googleapis.com/drive/v3/files';
  const params = new URLSearchParams();
  params.set('q', `'${folderId}' in parents and trashed=false`);
  params.set('pageSize', '1000');
  params.set('fields', 'files(id,name,webViewLink,webContentLink,mimeType)');
  params.set('key', apiKey);
  
  const url = `${baseUrl}?${params.toString()}`;
  console.log('Final URL:', url);
  console.log('URL without encoding:', `${baseUrl}?q='${folderId}' in parents and trashed=false&pageSize=1000&fields=files(id,name,webViewLink,webContentLink,mimeType)&key=${apiKey}`);
  
  try {
    console.log('Making fetch request...');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Raw API Response:', JSON.stringify(data, null, 2));
    console.log('Files array:', data.files);
    console.log('Files array length:', data.files?.length || 0);
    
    if (!data.files) {
      console.error('No files property in response');
      return [];
    }
    
    if (data.files.length === 0) {
      console.error('Files array is empty but should contain 18 files according to curl');
      return [];
    }
    
    // Filter for image files
    const imageFiles = data.files.filter((file: any) => 
      file.mimeType && file.mimeType.startsWith('image/')
    );
    
    console.log('Image files found:', imageFiles.length);
    console.log('Image files:', imageFiles.map((f: any) => f.name));
    
    return imageFiles;
    
  } catch (error) {
    console.error('Error in fetchGoogleDriveFiles:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('This might be a CORS issue or network problem');
    }
    throw error;
  }
};

export const getImageUrl = (file: GoogleDriveFile): string => {
  return `https://drive.google.com/uc?id=${file.id}`;
};
