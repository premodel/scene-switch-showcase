
import ImageWidget from "../components/ImageWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Interactive Scene Viewer</h1>
          <p className="text-lg text-slate-600">Explore different rooms and design variations</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ImageWidget />
        </div>
        
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>Embeddable widget • Responsive design • Interactive navigation</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
