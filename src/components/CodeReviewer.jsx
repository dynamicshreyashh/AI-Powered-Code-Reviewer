import { useState } from 'react';
import { reviewCode } from '../services/codeReviewer';

const CodeReviewer = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReview = async () => {
    if (!code.trim()) {
      setError('Please enter some code to review');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await reviewCode(code, language);
      setReview(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setReview('');
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        AI-Powered Code Reviewer
      </h1>

      {/* Language Selection */}
      <div className="flex items-center space-x-4">
        <label className="text-lg font-medium text-gray-700">
          Select Language:
        </label>
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="typescript">TypeScript</option>
          <option value="php">PHP</option>
          <option value="ruby">Ruby</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Input Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Your Code</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here for AI review..."
            className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            spellCheck="false"
          />
        </div>

        {/* Review Output Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">AI Review</h2>
          <div className="h-96 overflow-auto p-4 border border-gray-300 rounded-lg bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : review ? (
              <div className="whitespace-pre-wrap text-sm text-gray-700">
                {review}
              </div>
            ) : (
              <p className="text-gray-500 text-center h-full flex items-center justify-center">
                Your AI-powered code review will appear here...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleReview}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-8 py-3 rounded-lg font-medium transition duration-200"
        >
          {loading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Reviewing Code...
            </span>
          ) : (
            'Review Code with AI'
          )}
        </button>

        <button
          onClick={handleClear}
          disabled={loading}
          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium transition duration-200"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default CodeReviewer;