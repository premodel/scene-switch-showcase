
export interface ParsedScene {
  sceneName: string;
  versionName: string;
  fileName: string;
  imageUrl: string;
  order: number;
}

export interface SceneData {
  id: string;
  name: string;
  order: number;
  versions: {
    id: string;
    name: string;
    imageUrl: string;
  }[];
}

export const parseFileName = (fileName: string): ParsedScene | null => {
  // Remove file extension
  const nameWithoutExt = fileName.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  
  // Split by underscore to get order, scene and version
  const parts = nameWithoutExt.split('_');
  if (parts.length !== 3) {
    console.warn(`Invalid filename format: ${fileName}. Expected format: order_scene_name_version_name.ext`);
    return null;
  }
  
  const [orderPart, scenePart, versionPart] = parts;
  
  // Parse the order number
  const order = parseInt(orderPart, 10);
  if (isNaN(order)) {
    console.warn(`Invalid order number in filename: ${fileName}. Order must be a number.`);
    return null;
  }
  
  // Convert dashes to spaces for display names
  const sceneName = scenePart.replace(/-/g, ' ');
  const versionName = versionPart.replace(/-/g, ' ');
  
  return {
    sceneName,
    versionName,
    fileName,
    imageUrl: '', // Will be set later
    order
  };
};

export const groupScenesAndVersions = (parsedFiles: ParsedScene[]): SceneData[] => {
  const sceneMap = new Map<string, { versions: Map<string, ParsedScene>; order: number }>();
  
  // Group files by scene and version
  parsedFiles.forEach(file => {
    if (!sceneMap.has(file.sceneName)) {
      sceneMap.set(file.sceneName, { versions: new Map(), order: file.order });
    }
    sceneMap.get(file.sceneName)!.versions.set(file.versionName, file);
  });
  
  // Convert to the expected data structure
  const scenes: SceneData[] = [];
  sceneMap.forEach((sceneData, sceneName) => {
    const sceneVersions: SceneData['versions'] = [];
    sceneData.versions.forEach((file, versionName) => {
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
      order: sceneData.order,
      versions: sceneVersions
    });
  });
  
  // Sort scenes by order number
  scenes.sort((a, b) => a.order - b.order);
  
  return scenes;
};
