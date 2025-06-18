
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface SceneData {
  id: string;
  name: string;
  versions: {
    id: string;
    name: string;
    imageUrl: string;
  }[];
}

const sceneData: SceneData[] = [
  {
    id: 'master-bedroom',
    name: 'Master Bedroom',
    versions: [
      {
        id: 'opt-a',
        name: 'Opt A',
        imageUrl: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop'
      },
      {
        id: 'opt-b',
        name: 'Opt B',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop'
      },
      {
        id: 'opt-c',
        name: 'Opt C',
        imageUrl: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop'
      }
    ]
  },
  {
    id: 'northeast-bedroom',
    name: 'Northeast Bedroom',
    versions: [
      {
        id: 'opt-a',
        name: 'Opt A',
        imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop'
      },
      {
        id: 'opt-b',
        name: 'Opt B',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop'
      },
      {
        id: 'opt-c',
        name: 'Opt C',
        imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop'
      }
    ]
  },
  {
    id: 'southeast-bedroom',
    name: 'Southeast Bedroom',
    versions: [
      {
        id: 'opt-a',
        name: 'Opt A',
        imageUrl: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop'
      },
      {
        id: 'opt-b',
        name: 'Opt B',
        imageUrl: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop'
      },
      {
        id: 'opt-c',
        name: 'Opt C',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop'
      }
    ]
  }
];

const ImageWidget = () => {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const currentScene = sceneData[selectedSceneIndex];
  const currentImage = currentScene.versions[selectedVersionIndex];

  const handleSceneChange = (sceneIndex: number) => {
    if (sceneIndex !== selectedSceneIndex) {
      setIsImageLoading(true);
      setSelectedSceneIndex(sceneIndex);
      setSelectedVersionIndex(0); // Reset to first version when changing scene
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
          <img
            src={currentImage.imageUrl}
            alt={`${currentScene.name} - ${currentImage.name}`}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              isImageLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={handleImageLoad}
          />
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
