
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
    
    // Try a simpler approach - just get folder metadata first
    console.log('First, checking if folder exists...')
    const folderCheckUrl = `https://www.googleapis.com/drive/v3/files/${folderId}?key=${apiKey}`
    console.log('Folder check URL:', folderCheckUrl)
    
    const folderResponse = await fetch(folderCheckUrl)
    console.log('Folder check response status:', folderResponse.status)
    
    if (!folderResponse.ok) {
      const folderError = await folderResponse.text()
      console.error('Folder check failed:', folderError)
      return new Response(
        JSON.stringify({ 
          error: `Cannot access folder: ${folderResponse.status}`,
          details: folderError,
          suggestion: 'Make sure the folder is shared publicly with "Anyone with the link can view"'
        }),
        { 
          status: folderResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const folderData = await folderResponse.json()
    console.log('Folder data:', folderData)
    
    // Now try to get files in the folder
    const filesUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&pageSize=1000&fields=files(id,name,webViewLink,webContentLink,mimeType)&key=${apiKey}`
    console.log('Files URL:', filesUrl)
    
    const response = await fetch(filesUrl, {
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
    console.log('Image files:', imageFiles.map((f: any) => f.name))
    
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
