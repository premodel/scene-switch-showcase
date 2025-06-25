
import ImageWidget from "../components/ImageWidget";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folderId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ImageWidget />
        </div>
      </div>
    </div>
  );
};

export default Index;
