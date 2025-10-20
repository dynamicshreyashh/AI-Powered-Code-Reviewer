import React, { useState } from 'react';
import { Upload, FileCode, AlertCircle, CheckCircle, XCircle, Loader2, Code2 } from 'lucide-react';

function App() {
  const [files, setFiles] = useState([]);
  const [reviewing, setReviewing] = useState(false);
  const [reviews, setReviews] = useState([]);

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const newFiles = uploadedFiles.map(file => ({
      name: file.name,
      content: null,
      file: file,
      id: Math.random().toString(36).substr(2, 9)
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
  };

  const analyzeCode = (code, filename) => {
    const issues = [];
    const suggestions = [];
    const lines = code.split('\n');
    
    // Security checks
    if (code.includes('eval(')) {
      issues.push({ 
        severity: 'high', 
        line: lines.findIndex(l => l.includes('eval(')) + 1, 
        message: 'Avoid using eval() - security risk' 
      });
    }
    
    if (code.match(/password\s*=\s*['"]/i)) {
      issues.push({ 
        severity: 'critical', 
        line: lines.findIndex(l => l.match(/password\s*=\s*['"]/i)) + 1, 
        message: 'Hardcoded credentials detected' 
      });
    }
    
    if (code.includes('innerHTML')) {
      issues.push({ 
        severity: 'medium', 
        line: lines.findIndex(l => l.includes('innerHTML')) + 1, 
        message: 'innerHTML can lead to XSS vulnerabilities' 
      });
    }
    
    // SQL Injection check
    if (code.match(/SELECT.*FROM.*WHERE.*\+/i)) {
      issues.push({ 
        severity: 'critical', 
        message: 'Potential SQL injection vulnerability detected' 
      });
    }
    
    // Code quality checks
    if (code.includes('var ')) {
      suggestions.push({ 
        severity: 'low', 
        line: lines.findIndex(l => l.includes('var ')) + 1, 
        message: 'Use const or let instead of var' 
      });
    }
    
    if (code.includes('console.log')) {
      suggestions.push({ 
        severity: 'low', 
        line: lines.findIndex(l => l.includes('console.log')) + 1, 
        message: 'Remove console.log statements in production' 
      });
    }
    
    // Function complexity
    const functionMatches = code.match(/function\s+\w+\s*\([^)]*\)\s*{/g) || [];
    if (functionMatches.length > 0) {
      const complexity = (code.match(/if|for|while|switch|catch/g) || []).length;
      if (complexity > 10) {
        suggestions.push({ 
          severity: 'medium', 
          message: 'High cyclomatic complexity detected - consider refactoring' 
        });
      }
    }
    
    // Check for error handling
    if (code.includes('fetch(') && !code.includes('catch')) {
      suggestions.push({ 
        severity: 'medium', 
        message: 'Add error handling for async operations' 
      });
    }
    
    // Check for comments
    const commentRatio = (code.match(/\/\//g) || []).length / lines.length;
    if (commentRatio < 0.1 && lines.length > 50) {
      suggestions.push({ 
        severity: 'low', 
        message: 'Consider adding more comments for better maintainability' 
      });
    }

    // Magic numbers
    if (code.match(/\d{3,}/g) && !code.includes('const')) {
      suggestions.push({ 
        severity: 'low', 
        message: 'Extract magic numbers into named constants' 
      });
    }

    return { issues, suggestions };
  };

  const performReview = async () => {
    setReviewing(true);
    setReviews([]);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const reviewResults = files
      .filter(f => f.content)
      .map(file => {
        const analysis = analyzeCode(file.content, file.name);
        const linesOfCode = file.content.split('\n').length;
        const score = Math.max(0, 100 - (analysis.issues.length * 15) - (analysis.suggestions.length * 5));
        
        return {
          filename: file.name,
          score,
          linesOfCode,
          issues: analysis.issues,
          suggestions: analysis.suggestions,
          summary: generateSummary(analysis, score)
        };
      });
    
    setReviews(reviewResults);
    setReviewing(false);
  };

  const generateSummary = (analysis, score) => {
    const critical = analysis.issues.filter(i => i.severity === 'critical').length;
    const high = analysis.issues.filter(i => i.severity === 'high').length;
    
    if (score >= 90) return 'Excellent code quality! Minor improvements suggested.';
    if (score >= 75) return 'Good code quality with some areas for improvement.';
    if (score >= 60) return 'Moderate code quality. Address highlighted issues.';
    if (critical > 0) return 'Critical security issues found! Immediate action required.';
    return 'Significant improvements needed. Review all issues carefully.';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[severity] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code2 className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold text-white">AI Code Review</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Upload your code files for instant automated analysis and suggestions
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <label className="flex flex-col items-center justify-center cursor-pointer group">
              <input
                type="file"
                multiple
                accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.html,.css"
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
                  Support for JS, TS, Python, Java, C++, Go, Rust, and more
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
                      <button
                        onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        aria-label="Remove file"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={performReview}
                  disabled={reviewing || files.length === 0}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50"
                >
                  {reviewing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Code...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Start Review
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {reviews.length > 0 && (
          <div className="max-w-6xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              Review Results
            </h2>
            
            {reviews.map((review, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                      <FileCode className="w-6 h-6 text-purple-400" />
                      {review.filename}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {review.linesOfCode} lines of code • {review.issues.length} issues • {review.suggestions.length} suggestions
                    </p>
                  </div>
                  <div className="text-center sm:text-right bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className={`text-5xl font-bold ${getScoreColor(review.score)} mb-1`}>
                      {review.score}
                    </div>
                    <div className="text-gray-400 text-sm font-medium">Quality Score</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 mb-6 border border-purple-500/20">
                  <p className="text-gray-200 font-medium">{review.summary}</p>
                </div>

                {review.issues.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      Issues Found ({review.issues.length})
                    </h4>
                    <div className="space-y-3">
                      {review.issues.map((issue, i) => (
                        <div key={i} className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <span className="font-bold uppercase text-xs px-2 py-1 rounded bg-white/20 self-start">
                              {issue.severity}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium mb-1">{issue.message}</p>
                              {issue.line && (
                                <p className="text-sm opacity-75">Line: {issue.line}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {review.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                      Suggestions ({review.suggestions.length})
                    </h4>
                    <div className="space-y-3">
                      {review.suggestions.map((suggestion, i) => (
                        <div key={i} className={`p-4 rounded-lg border ${getSeverityColor(suggestion.severity)}`}>
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <span className="font-bold uppercase text-xs px-2 py-1 rounded bg-white/20 self-start">
                              {suggestion.severity}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium mb-1">{suggestion.message}</p>
                              {suggestion.line && (
                                <p className="text-sm opacity-75">Line: {suggestion.line}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>Built with React • Powered by AI Analysis</p>
        </div>
      </div>
    </div>
  );
}

export default App;