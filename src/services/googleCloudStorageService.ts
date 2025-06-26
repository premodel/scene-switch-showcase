
interface CloudStorageFile {
  name: string;
  bucket: string;
  contentType: string;
  mediaLink: string;
}

export const fetchCloudStorageFiles = async (bucketName: string, folderPath: string): Promise<CloudStorageFile[]> => {
  console.log('fetchCloudStorageFiles called with:', { bucketName, folderPath });
  
  try {
    // Use the Google Cloud Storage JSON API to list objects
    const prefix = folderPath ? `${folderPath}/` : '';
    const url = `https://storage.googleapis.com/storage/v1/b/${bucketName}/o?prefix=${encodeURIComponent(prefix)}`;
    
    console.log('Making API request to:', url);
    
    const response = await fetch(url);
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch from Cloud Storage: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API Response data:', data);
    
    // Filter for image files and exclude the folder itself
    const imageFiles = (data.items || [])
      .filter((item: any) => {
        const isImage = item.contentType && item.contentType.startsWith('image/');
        const isNotFolder = !item.name.endsWith('/');
        console.log(`File: ${item.name}, contentType: ${item.contentType}, isImage: ${isImage}, isNotFolder: ${isNotFolder}`);
        return isImage && isNotFolder;
      })
      .map((item: any) => ({
        name: item.name.split('/').pop(), // Get just the filename without path
        bucket: bucketName,
        contentType: item.contentType,
        mediaLink: `https://storage.googleapis.com/${bucketName}/${item.name}`
      }));

    console.log('Filtered image files:', imageFiles);
    return imageFiles;
    
  } catch (error) {
    console.error('Error in fetchCloudStorageFiles:', error);
    throw error;
  }
};

export const getCloudStorageImageUrl = (file: CloudStorageFile): string => {
  console.log(`Getting image URL for file: ${file.name}`);
  console.log(`Generated URL: ${file.mediaLink}`);
  return file.mediaLink;
};
