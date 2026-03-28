'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large (max 10MB)');
      return;
    }
    setSelectedFile(file);
    setError('');
    setResultPreview(null);
    setOriginalPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/remove', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to process image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultPreview(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (resultPreview) {
      const link = document.createElement('a');
      link.href = resultPreview;
      link.download = 'result.png';
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🖼️ Image Background Remover
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-gray-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {originalPreview ? (
              <img src={originalPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
            ) : (
              <>
                <p className="text-gray-600">Click to upload or drag and drop</p>
                <p className="text-gray-400 text-sm mt-2">PNG, JPG up to 10MB</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          <button
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Remove Background'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {(originalPreview || resultPreview) && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              {originalPreview && (
                <div>
                  <p className="text-gray-500 text-sm mb-2">Original</p>
                  <img src={originalPreview} alt="Original" className="w-full rounded-lg border" />
                </div>
              )}
              {resultPreview && (
                <div>
                  <p className="text-gray-500 text-sm mb-2">Result</p>
                  <div className="bg-[linear-gradient(45deg,#eee_25%,transparent_25%,linear-gradient(-45deg,#eee_25%,transparent_25%,linear-gradient(45deg,transparent_75%,#eee_75%),linear-gradient(-45deg,transparent_75%,#eee_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]">
                    <img src={resultPreview} alt="Result" className="w-full rounded-lg" />
                  </div>
                  <button
                    onClick={downloadResult}
                    className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Download
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}