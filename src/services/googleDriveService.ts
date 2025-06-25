
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
    // Call our Supabase edge function to get the files
    const response = await fetch(`https://rviqvqbohxpkbxrwtwwe.supabase.co/functions/v1/google-drive-files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folderId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase function error:', errorText);
      throw new Error(`Failed to fetch files: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Retrieved files from Supabase function:', data.files);
    
    // Transform the response to match our interface
    const transformedFiles: GoogleDriveFile[] = data.files.map((file: any) => ({
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
