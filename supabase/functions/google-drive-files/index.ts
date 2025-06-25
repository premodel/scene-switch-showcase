
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Minimal function: list up to 1000 public files in a folder
async function listDriveFolder(folderId: string, apiKey: string) {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const fields = encodeURIComponent('files(id,name,mimeType,webContentLink)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=1000&key=${apiKey}`;

  console.log('Making request to URL:', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()).files;  // ← array of metadata objects
}

serve(async (req) => {
  console.log('Edge function called with method:', req.method)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { folderId } = await req.json()
    console.log('Received folderId:', folderId)
    
    if (!folderId) {
      return new Response(
        JSON.stringify({ error: 'folderId is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the API key from Supabase secrets
    const apiKey = Deno.env.get('GOOGLE_DRIVE_API_KEY')
    console.log('API key exists:', !!apiKey)
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Drive API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Using minimal function to fetch files from folder:', folderId)
    
    const files = await listDriveFolder(folderId, apiKey);
    console.log('Files retrieved:', files?.length || 0);
    console.log('File details:', files?.map((f: any) => ({ name: f.name, mimeType: f.mimeType })));
    
    // Filter for image files
    const imageFiles = files?.filter((file: any) => 
      file.mimeType && file.mimeType.startsWith('image/')
    ) || [];
    
    console.log('Image files found:', imageFiles.length);
    console.log('Image files:', imageFiles.map((f: any) => f.name));
    
    return new Response(
      JSON.stringify({ files: imageFiles }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Error in google-drive-files function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
