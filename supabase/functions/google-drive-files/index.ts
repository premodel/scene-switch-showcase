
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Fetching files from Google Drive folder:', folderId)
    
    // Fixed query - remove quotes around folder ID and use proper syntax
    const url = `https://www.googleapis.com/drive/v3/files?q=${folderId} in parents and trashed=false&pageSize=1000&fields=files(id,name,webViewLink,webContentLink,mimeType)&key=${apiKey}`
    
    console.log('Making request to Google Drive API with URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })
    
    console.log('Google Drive API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Drive API error response:', errorText)
      return new Response(
        JSON.stringify({ error: `Google Drive API error: ${response.status} - ${errorText}` }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const data = await response.json()
    console.log('Raw API response:', JSON.stringify(data, null, 2))
    console.log('Files retrieved:', data.files?.length || 0)
    
    // Filter for image files
    const imageFiles = data.files?.filter((file: any) => 
      file.mimeType && file.mimeType.startsWith('image/')
    ) || []
    
    console.log('Image files found:', imageFiles.length)
    console.log('Image files:', imageFiles.map(f => f.name))
    
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
