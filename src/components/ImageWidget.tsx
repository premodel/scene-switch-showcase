import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { fetchCloudStorageFiles, getCloudStorageImageUrl } from '../services/googleCloudStorageService';
import { parseFileName, groupScenesAndVersions, SceneData, ParsedScene } from '../utils/sceneParser';

const ImageWidget = () => {
  const [searchParams] = useSearchParams();
  const [sceneData, setSceneData] = useState<SceneData[]>([]);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get folder from URL parameters - now required
  const bucketName = 'premodel-assets';
  const folderPath = searchParams.get('folderId');

  useEffect(() => {
    if (!folderPath) {
      setError('folderId parameter is required. Please add ?folderId=YOUR_FOLDER_NAME to the URL.');
      setIsDataLoading(false);
      return;
    }

    const loadImagesFromCloudStorage = async () => {
      try {
        setIsDataLoading(true);
        setError(null);
        
        console.log('Loading images from Cloud Storage bucket:', bucketName, 'folder:', folderPath);
        const files = await fetchCloudStorageFiles(bucketName, folderPath);
        console.log('Retrieved files:', files);
        
        const imageFiles = files.filter(file => {
          const isImage = /\.(png|jpg|jpeg|webp)$/i.test(file.name);
          console.log(`File "${file.name}" is image:`, isImage);
          return isImage;
        });
        
        console.log('Filtered image files:', imageFiles);
        
        const parsedFiles: ParsedScene[] = imageFiles
          .map(file => {
            console.log(`Parsing file: ${file.name}`);
            const parsed = parseFileName(file.name);
            console.log(`Parse result for "${file.name}":`, parsed);
            if (parsed) {
              parsed.imageUrl = getCloudStorageImageUrl(file);
              console.log(`Set image URL for "${file.name}":`, parsed.imageUrl);
            }
            return parsed;
          })
          .filter((file): file is ParsedScene => file !== null);
        
        console.log('Parsed files:', parsedFiles);
        
        if (parsedFiles.length === 0) {
          console.log('No parsed files found. Original files:', files.map(f => f.name));
          setError('No valid scene files found. Make sure your images follow the naming format: scene_name_version_name.jpg');
          setIsDataLoading(false);
          return;
        }
        
        const groupedData = groupScenesAndVersions(parsedFiles);
        console.log('Grouped scene data:', groupedData);
        
        setSceneData(groupedData);
        setSelectedSceneIndex(0);
        setSelectedVersionIndex(0);
      } catch (err) {
        console.error('Error loading images:', err);
        setError(`Failed to load images: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadImagesFromCloudStorage();
  }, [folderPath]);

  const handleSceneChange = (sceneIndex: number) => {
    if (sceneIndex !== selectedSceneIndex) {
      setIsImageLoading(true);
      setSelectedSceneIndex(sceneIndex);
      setSelectedVersionIndex(0);
    }
  };

  const handleVersionChange = (versionIndex: number) => {
    if (versionIndex !== selectedVersionIndex) {
      setIsImageLoading(true);
      setSelectedVersionIndex(versionIndex);
    }
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  if (isDataLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600">Loading images from Cloud Storage...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (sceneData.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center">
        <p className="text-slate-600">No scenes found</p>
      </div>
    );
  }

  const currentScene = sceneData[selectedSceneIndex];
  const currentImage = currentScene.versions[selectedVersionIndex];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Scene Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-700 px-3 py-1.5">Scene:</span>
          {sceneData.map((scene, index) => (
            <button
              key={scene.id}
              onClick={() => handleSceneChange(index)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105",
                selectedSceneIndex === index
                  ? "text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
              style={selectedSceneIndex === index ? { backgroundColor: '#3C3A50' } : {}}
            >
              {scene.name}
            </button>
          ))}
        </div>
      </div>

      {/* Image Display */}
      <div className="relative mb-6 bg-slate-100 rounded-xl overflow-hidden">
        <div className="aspect-[4/3] relative">
          {isImageLoading && (
            <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center z-10">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={currentImage.imageUrl}
            alt={`${currentScene.name} - ${currentImage.name}`}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={() => {
              console.error('Failed to load image:', currentImage.imageUrl);
              setIsImageLoading(false);
            }}
          />
        </div>
      </div>

      {/* Version Selection */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-700 px-3 py-1.5">Version:</span>
          {currentScene.versions.map((version, index) => (
            <button
              key={version.id}
              onClick={() => handleVersionChange(index)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105",
                selectedVersionIndex === index
                  ? "text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
              style={selectedVersionIndex === index ? { backgroundColor: '#FE5A68' } : {}}
            >
              {version.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageWidget;
