'use client';

import { useState, useCallback, useRef } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = useCallback((file: File) => {
    // 验证文件类型
    if (!file.type.match(/^image\/(png|jpe?g)$/i)) {
      setError('仅支持 PNG/JPG 格式');
      return;
    }
    // 验证文件大小
    if (file.size > 10 * 1024 * 1024) {
      setError('文件过大，最大支持 10MB');
      return;
    }
    setSelectedFile(file);
    setError('');
    setResultPreview(null);
    setOriginalPreview(URL.createObjectURL(file));
  }, []);

  // 处理拖拽
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // 处理上传
  const handleUpload = async () => {
    if (!selectedFile) return;

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
        throw new Error(err.error || '处理失败，请重试');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultPreview(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '处理失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 下载结果
  const downloadResult = () => {
    if (resultPreview) {
      const link = document.createElement('a');
      link.href = resultPreview;
      link.download = 'removed-bg.png';
      link.click();
    }
  };

  // 重置
  const handleReset = () => {
    setSelectedFile(null);
    setOriginalPreview(null);
    setResultPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Image Background Remover</h1>
          </div>
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{session.user?.email}</span>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              登录 Google
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {originalPreview ? (
            <img 
              src={originalPreview} 
              alt="Preview" 
              className="max-h-48 mx-auto rounded-lg" 
            />
          ) : (
            <>
              <div className="text-4xl mb-4">📁</div>
              <p className="text-gray-600 mb-2">
                点击选择图片 或 拖拽到此处上传
              </p>
              <p className="text-gray-400 text-sm">
                支持 PNG、JPG，最大 10MB
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Actions */}
        {(selectedFile || resultPreview) && (
          <div className="mt-6 flex gap-4 justify-center">
            {!resultPreview ? (
              <button
                onClick={handleUpload}
                disabled={loading || !selectedFile}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    处理中...
                  </span>
                ) : '移除背景'}
              </button>
            ) : (
              <>
                <button
                  onClick={downloadResult}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  下载结果
                </button>
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  重置
                </button>
              </>
            )}
          </div>
        )}

        {/* Preview Area */}
        {(originalPreview || resultPreview) && (
          <div className="mt-8 grid grid-cols-2 gap-6">
            {originalPreview && (
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-3">原图</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img src={originalPreview} alt="Original" className="w-full" />
                </div>
              </div>
            )}
            {resultPreview && (
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-3">处理后</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-[linear-gradient(45deg,#eee_25%,transparent_25%,linear-gradient(-45deg,#eee_25%,transparent_25%,linear-gradient(45deg,transparent_75%,#eee_75%),linear-gradient(-45deg,transparent_75%,#eee_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]">
                  <img src={resultPreview} alt="Result" className="w-full" />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-4 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-400 text-sm">
          Powered by Remove.bg API
        </div>
      </footer>
    </div>
  );
}