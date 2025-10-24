import React, { useState } from 'react';
import {
  Upload,
  FileCode,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Code2,
  Github,
  Globe,
  Sparkles
} from 'lucide-react';
import { reviewCode } from './services/codeReviewer';

function App() {
  const [files, setFiles] = useState([]);
  const [reviewing, setReviewing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const newFiles = uploadedFiles.map(file => ({
      name: file.name,
      content: null,
      file,
      id: Math.random().toString(36).substr(2, 9),
    }));

    newFiles.forEach((fileObj) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFiles(prev => {
          const updated = [...prev];
          const existingIdx = updated.findIndex(f => f.id === fileObj.id);
          if (existingIdx >= 0) {
            updated[existingIdx].content = event.target.result;
          } else {
            updated.push({ ...fileObj, content: event.target.result });
          }
          return updated;
        });
      };
      reader.readAsText(fileObj.file);
    });

    setFiles(prev => [...prev, ...newFiles]);
    setError('');
  };

  // AI-Powered Code Review
  const performAIRreview = async () => {
    if (files.length === 0) {
      setError('Please upload at least one file to review');
      return;
    }

    setReviewing(true);
    setError('');
    setReviews([]);

    try {
      const reviewResults = [];
      
      for (const file of files) {
        if (file.content) {
          try {
            console.log(`Reviewing file: ${file.name}`);
            const aiReview = await reviewCode(file.content, getFileLanguage(file.name));
            
            // Parse AI response and convert to our format
            const analysis = parseAIReview(aiReview, file.content);
            const score = calculateAIScore(analysis);
            
            reviewResults.push({
              filename: file.name,
              score,
              issues: analysis.issues,
              suggestions: analysis.suggestions,
              summary: analysis.summary || generateAISummary(analysis, score),
              rawAIResponse: aiReview // Keep the raw response for display
            });
          } catch (fileError) {
            console.error(`Error reviewing ${file.name}:`, fileError);
            reviewResults.push({
              filename: file.name,
              score: 0,
              issues: [{ 
                severity: 'critical', 
                message: `AI Review failed: ${fileError.message}` 
              }],
              suggestions: [],
              summary: 'Failed to analyze this file'
            });
          }
        }
      }
      
      setReviews(reviewResults);
    } catch (error) {
      console.error('Review error:', error);
      setError(error.message || 'Failed to perform code review. Please check your API key and try again.');
    } finally {
      setReviewing(false);
    }
  };

  // Helper function to detect file language
  const getFileLanguage = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'css': 'css',
      'json': 'json'
    };
    return languageMap[ext] || 'javascript';
  };

  // Parse AI response into structured format
  const parseAIReview = (aiResponse, code) => {
    const lines = code.split('\n');
    const issues = [];
    const suggestions = [];
    
    // Basic parsing of AI response (you can enhance this based on your prompt structure)
    if (aiResponse.includes('Security') || aiResponse.toLowerCase().includes('vulnerability')) {
      issues.push({
        severity: 'high',
        message: 'Security concerns identified by AI',
        line: 1
      });
    }
    
    if (aiResponse.toLowerCase().includes('performance')) {
      suggestions.push({
        severity: 'medium', 
        message: 'Performance improvements suggested by AI',
        line: 1
      });
    }
    
    // Add the raw AI analysis as a suggestion for now
    suggestions.push({
      severity: 'low',
      message: 'AI Analysis Available',
      details: aiResponse
    });

    return {
      issues,
      suggestions,
      summary: extractSummary(aiResponse)
    };
  };

  const extractSummary = (aiResponse) => {
    // Extract first paragraph or create summary from AI response
    const lines = aiResponse.split('\n').filter(line => line.trim());
    return lines[0] || 'AI analysis completed';
  };

  const calculateAIScore = (analysis) => {
    let score = 100;
    score -= analysis.issues.filter(issue => issue.severity === 'critical').length * 20;
    score -= analysis.issues.filter(issue => issue.severity === 'high').length * 10;
    score -= analysis.issues.filter(issue => issue.severity === 'medium').length * 5;
    score -= analysis.suggestions.length * 2;
    return Math.max(0, Math.min(100, score));
  };

  const generateAISummary = (analysis, score) => {
    const critical = analysis.issues.filter(i => i.severity === 'critical').length;
    if (score >= 90) return '✅ Excellent code quality! AI analysis confirms best practices.';
    if (score >= 75) return '👍 Good code quality with AI-suggested improvements.';
    if (critical > 0) return '🚨 Critical issues identified by AI! Immediate review recommended.';
    return '📝 AI analysis suggests several improvements for better code quality.';
  };

  const getSeverityColor = (severity) => ({
    critical: 'text-red-600 bg-red-50 border-red-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-blue-600 bg-blue-50 border-blue-200',
  }[severity] || 'text-gray-600 bg-gray-50 border-gray-200');

  const getScoreColor = (score) =>
    score >= 90 ? 'text-green-600' : score >= 75 ? 'text-blue-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900 text-white">
      {/* Hero Section */}
      <header className="text-center pt-20 pb-16 px-6">
        <div className="flex justify-center mb-6">
          <div className="bg-purple-700/20 p-6 rounded-full border border-purple-500/40">
            <Sparkles className="w-14 h-14 text-purple-400" />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold mb-3 tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          AI-Powered Code Reviewer
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
          Upload your code files and get intelligent AI-powered insights on performance, 
          security, and best practices — now enhanced with OpenAI GPT analysis.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="#upload" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Try AI Review
          </a>
          <a href="https://shreyas-h-portfolio.vercel.app/" target="_blank" className="border border-purple-500/50 hover:bg-purple-800 px-6 py-3 rounded-lg font-semibold transition-all">
            Hire Me
          </a>
        </div>
      </header>

      {/* Upload Section */}
      <section id="upload" className="max-w-5xl mx-auto px-6 mb-20">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <label className="flex flex-col items-center justify-center cursor-pointer group">
            <input
              type="file"
              multiple
              accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.html,.css,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div className="bg-purple-600/20 p-6 rounded-full mb-4 group-hover:bg-purple-600/30 transition-colors">
                <Upload className="w-16 h-16 text-purple-400 group-hover:text-purple-300 transition-colors" />
              </div>
              <span className="text-xl text-white font-semibold mb-2">
                Upload Code Files
              </span>
              <span className="text-gray-400 text-sm text-center">
                Supports JS, TS, Python, Java, C++, Go, Rust, and more
              </span>
            </div>
          </label>

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FileCode className="w-5 h-5" />
                Uploaded Files ({files.length})
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {files.map(file => (
                  <div key={file.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors">
                    <FileCode className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span className="text-gray-300 flex-1 truncate">{file.name}</span>
                    <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                      {getFileLanguage(file.name)}
                    </span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                </div>
              )}

              <button
                onClick={performAIRreview}
                disabled={reviewing || files.length === 0}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50"
              >
                {reviewing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI is Analyzing Code...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Start AI Code Review
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      {reviews.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            AI Review Results
          </h2>
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl mb-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <FileCode className="w-6 h-6 text-purple-400" />
                    {review.filename}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {review.issues.length} issues • {review.suggestions.length} suggestions • AI Powered
                  </p>
                </div>
                <div className="text-center bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className={`text-5xl font-bold ${getScoreColor(review.score)} mb-1`}>
                    {review.score}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">AI Quality Score</div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 mb-6 border border-purple-500/20">
                <p className="text-gray-200 font-medium">{review.summary}</p>
              </div>

              {/* Issues & Suggestions */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Issues */}
                {review.issues.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      Issues ({review.issues.length})
                    </h4>
                    <div className="space-y-2">
                      {review.issues.map((issue, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                          <div className="font-medium">{issue.message}</div>
                          {issue.line && (
                            <div className="text-sm opacity-75 mt-1">Line {issue.line}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {review.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      Suggestions ({review.suggestions.length})
                    </h4>
                    <div className="space-y-2">
                      {review.suggestions.map((suggestion, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${getSeverityColor(suggestion.severity)}`}>
                          <div className="font-medium">{suggestion.message}</div>
                          {suggestion.details && (
                            <div className="text-sm opacity-75 mt-2 whitespace-pre-wrap">
                              {suggestion.details}
                            </div>
                          )}
                          {suggestion.line && (
                            <div className="text-sm opacity-75 mt-1">Line {suggestion.line}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* No Issues Message */}
              {review.issues.length === 0 && review.suggestions.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p>No issues found! Your code looks great according to AI analysis.</p>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* About Section */}
      <section className="text-center py-16 bg-black/30 border-t border-white/10">
        <h2 className="text-3xl font-bold mb-4">Meet the Developer</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-6">
          👋 Hi, I'm <span className="text-purple-400 font-semibold">Shreyash Bhosale</span> — a software developer passionate about 
          AI, automation, and building developer tools. This project showcases my ability to merge full-stack and AI solutions 
          for modern software workflows.
        </p>
        <div className="flex justify-center gap-4">
          <a href="https://github.com/dynamicshreyashh" target="_blank" className="flex items-center gap-2 border border-white/20 px-4 py-2 rounded-lg hover:bg-white/10">
            <Github className="w-5 h-5" /> GitHub
          </a>
          <a href="https://www.linkedin.com/in/shreyash-5a7726245/" target="_blank" className="flex items-center gap-2 border border-white/20 px-4 py-2 rounded-lg hover:bg-white/10">
            <Globe className="w-5 h-5" /> LinkedIn
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t border-white/10">
        <p>© {new Date().getFullYear()} Shreyash Bhosale — AI Code Reviewer</p>
      </footer>
    </div>
  );
}

export default App;