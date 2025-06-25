import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { fetchGoogleDriveFiles, getImageUrl } from '../services/googleDriveService';
import { parseFileName, groupScenesAndVersions, SceneData, ParsedScene } from '../utils/sceneParser';

const ImageWidget = () => {
  const [searchParams] = useSearchParams();
  const [sceneData, setSceneData] = useState<SceneData[]>([]);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const folderId = searchParams.get('folderId');

  useEffect(() => {
    const loadImagesFromDrive = async () => {
      if (!folderId) {
        setError('No Google Drive folder ID provided. Add ?folderId=YOUR_FOLDER_ID to the URL');
        setIsDataLoading(false);
        return;
      }

      try {
        setIsDataLoading(true);
        setError(null);
        
        console.log('Loading demo data for folder:', folderId);
        const files = await fetchGoogleDriveFiles(folderId);
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
              parsed.imageUrl = getImageUrl(file);
              console.log(`Set image URL for "${file.name}":`, parsed.imageUrl);
            }
            return parsed;
          })
          .filter((file): file is ParsedScene => file !== null);
        
        console.log('Parsed files:', parsedFiles);
        
        if (parsedFiles.length === 0) {
          console.log('No parsed files found. Original files:', files.map(f => f.name));
          setError('This is demo data. In a real implementation, Google Drive API access requires a backend service to handle CORS restrictions.');
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

    loadImagesFromDrive();
  }, [folderId]);

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
        <p className="text-slate-600">Loading demo data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-amber-800 font-semibold mb-2">Demo Mode</h3>
          <p className="text-amber-600 text-sm">{error}</p>
          <div className="mt-4 text-left bg-amber-100 p-4 rounded text-sm">
            <p className="font-medium mb-2">To implement real Google Drive integration:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Use a backend service (like Supabase Edge Functions)</li>
              <li>Or use a CORS proxy service</li>
              <li>Or implement Google Drive's Picker API</li>
              <li>Or have users manually upload files</li>
            </ol>
          </div>
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
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Scene:</span>
          <div className="flex gap-2 flex-wrap">
            {sceneData.map((scene, index) => (
              <button
                key={scene.id}
                onClick={() => handleSceneChange(index)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105",
                  selectedSceneIndex === index
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                {scene.name}
              </button>
            ))}
          </div>
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">{currentScene.name}</h3>
              <p className="text-sm text-slate-600">{currentImage.name}</p>
              <p className="text-xs text-slate-500 mt-2">Demo placeholder image</p>
            </div>
          </div>
        </div>
      </div>

      {/* Version Selection */}
      <div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Version:</span>
          <div className="flex gap-2 flex-wrap">
            {currentScene.versions.map((version, index) => (
              <button
                key={version.id}
                onClick={() => handleVersionChange(index)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105",
                  selectedVersionIndex === index
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                {version.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Selection Info */}
      <div className="mt-4 text-center text-sm text-slate-500">
        Currently viewing: <span className="font-medium">{currentScene.name}</span> • <span className="font-medium">{currentImage.name}</span>
      </div>
    </div>
  );
};

export default ImageWidget;
