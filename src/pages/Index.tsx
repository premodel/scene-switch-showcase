
import ImageWidget from "../components/ImageWidget";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folderId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Interactive Scene Viewer</h1>
          <p className="text-lg text-slate-600">
            {folderId 
              ? "Explore different rooms and design variations" 
              : "Dynamic image loading from Google Drive folders"
            }
          </p>
          {!folderId && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-blue-800 mb-2">Setup Instructions:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                <li>Get a Google Drive API key from Google Cloud Console</li>
                <li>Set <code className="bg-blue-100 px-1 rounded">VITE_GOOGLE_DRIVE_API_KEY</code> environment variable</li>
                <li>Make your Google Drive folder publicly accessible</li>
                <li>Name your images: <code className="bg-blue-100 px-1 rounded">scene_name-version_name.png</code></li>
                <li>Add <code className="bg-blue-100 px-1 rounded">?folderId=YOUR_FOLDER_ID</code> to the URL</li>
              </ol>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ImageWidget />
        </div>
        
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>Embeddable widget • Responsive design • Dynamic Google Drive integration</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
