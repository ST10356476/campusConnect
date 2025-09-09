import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

interface StudyMaterial {
  _id?: string;
  originalName?: string;
  url?: string;
  fileType?: string;
  fileSize?: number;
  summary?: string;
  flashcards?: { question: string; answer: string }[];
  quiz?: { question: string; options: string[]; answer: string }[];
  createdAt?: string;
  uploadedBy?: any;
}

const StudyMaterialDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/study-materials/${id}`);
        setMaterial(res.data);
      } catch (err: any) {
        setError('Failed to fetch material.');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!material) return <div className="p-8">Material not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-10">
      <Link to="/materials" className="text-purple-600 hover:underline">&larr; Back to Materials</Link>
      <h1 className="text-2xl font-bold mt-4 mb-2">{material.originalName}</h1>
      <p className="text-gray-600 mb-2">Type: {material.fileType}</p>
      <p className="text-gray-600 mb-2">Size: {material.fileSize ? (material.fileSize / 1024).toFixed(2) + ' KB' : 'N/A'}</p>
      {material.summary && <div className="mb-4"><strong>Summary:</strong> <p>{material.summary}</p></div>}
      {material.url && (
        <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download/View File</a>
      )}
      {/* Add more details as needed */}
    </div>
  );
};

export default StudyMaterialDetail;
