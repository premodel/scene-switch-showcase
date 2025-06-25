
interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
}

export const fetchGoogleDriveFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  console.log('Fetching files from Google Drive folder via Supabase:', folderId);
  
  try {
    console.log('Making request to Supabase Edge Function...');
    
    // Check if we have the Supabase URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    console.log('VITE_SUPABASE_URL from env:', supabaseUrl);
    
    if (!supabaseUrl) {
      console.error('VITE_SUPABASE_URL is not set in environment variables');
      throw new Error('Supabase URL not configured. Please set VITE_SUPABASE_URL environment variable.');
    }
    
    const functionUrl = `${supabaseUrl}/functions/v1/google-drive-files`;
    console.log('Function URL:', functionUrl);
    
    const requestBody = JSON.stringify({ folderId });
    console.log('Request body:', requestBody);
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody
    });
    
    console.log('Supabase function response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      ok: response.ok
    });
    
    // Try to get response text first to see what we're dealing with
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    if (!response.ok) {
      console.error('Supabase function error - status:', response.status);
      console.error('Supabase function error - response:', responseText);
      throw new Error(`Backend request failed: ${response.status} - ${responseText}`);
    }
    
    // Try to parse the response
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      console.error('Response text that failed to parse:', responseText);
      throw new Error(`Invalid JSON response from backend: ${responseText}`);
    }
    
    if (!data.files) {
      console.error('No files property in backend response');
      return [];
    }
    
    console.log('Files retrieved from backend:', data.files.length);
    
    return data.files;
    
  } catch (error) {
    console.error('Error in fetchGoogleDriveFiles:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

export const getImageUrl = (file: GoogleDriveFile): string => {
  return `https://drive.google.com/uc?id=${file.id}`;
};
