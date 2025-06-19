
export interface ParsedScene {
  sceneName: string;
  versionName: string;
  fileName: string;
  imageUrl: string;
}

export interface SceneData {
  id: string;
  name: string;
  versions: {
    id: string;
    name: string;
    imageUrl: string;
  }[];
}

export const parseFileName = (fileName: string): ParsedScene | null => {
  // Remove file extension
  const nameWithoutExt = fileName.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  
  // Split by dash to get scene and version
  const parts = nameWithoutExt.split('-');
  if (parts.length !== 2) {
    console.warn(`Invalid filename format: ${fileName}. Expected format: scene_name-version_name.ext`);
    return null;
  }
  
  const [scenePart, versionPart] = parts;
  
  // Convert underscores to spaces for display names
  const sceneName = scenePart.replace(/_/g, ' ');
  const versionName = versionPart.replace(/_/g, ' ');
  
  return {
    sceneName,
    versionName,
    fileName,
    imageUrl: '' // Will be set later
  };
};

export const groupScenesAndVersions = (parsedFiles: ParsedScene[]): SceneData[] => {
  const sceneMap = new Map<string, Map<string, ParsedScene>>();
  
  // Group files by scene and version
  parsedFiles.forEach(file => {
    if (!sceneMap.has(file.sceneName)) {
      sceneMap.set(file.sceneName, new Map());
    }
    sceneMap.get(file.sceneName)!.set(file.versionName, file);
  });
  
  // Convert to the expected data structure
  const scenes: SceneData[] = [];
  sceneMap.forEach((versions, sceneName) => {
    const sceneVersions: SceneData['versions'] = [];
    versions.forEach((file, versionName) => {
      sceneVersions.push({
        id: file.versionName.toLowerCase().replace(/\s+/g, '-'),
        name: file.versionName,
        imageUrl: file.imageUrl
      });
    });
    
    // Sort versions alphabetically
    sceneVersions.sort((a, b) => a.name.localeCompare(b.name));
    
    scenes.push({
      id: sceneName.toLowerCase().replace(/\s+/g, '-'),
      name: sceneName,
      versions: sceneVersions
    });
  });
  
  // Sort scenes alphabetically
  scenes.sort((a, b) => a.name.localeCompare(b.name));
  
  return scenes;
};
