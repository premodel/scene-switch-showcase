
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
              <h3 className="font-semibold text-blue-800 mb-2">Quick Setup:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                <li>
                  <strong>Make your Google Drive folder public:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Right-click your folder in Google Drive</li>
                    <li>Click "Share" → "General access" → "Anyone with the link"</li>
                    <li>Set permission to "Viewer"</li>
                  </ul>
                </li>
                <li>
                  <strong>Name your images:</strong> <code className="bg-blue-100 px-1 rounded">scene_name-version_name.png</code>
                  <br />
                  <span className="text-xs">Example: kitchen-modern.jpg, kitchen-traditional.jpg</span>
                </li>
                <li>
                  <strong>Get your folder ID:</strong> Copy the long string from your folder's share URL after <code className="bg-blue-100 px-1 rounded">/folders/</code>
                </li>
                <li>
                  <strong>Add to URL:</strong> <code className="bg-blue-100 px-1 rounded">?folderId=YOUR_FOLDER_ID</code>
                </li>
              </ol>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <strong>Note:</strong> This uses a demo API key with limited usage. For production use, get your own Google Drive API key from Google Cloud Console and replace it in the code.
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ImageWidget />
        </div>
        
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>Embeddable widget • Responsive design • Direct Google Drive integration</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
