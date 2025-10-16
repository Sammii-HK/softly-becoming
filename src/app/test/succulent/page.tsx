'use client';

import { useState } from 'react';

interface LogEntry {
  timestamp: string;
  message: string;
  data?: any;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface TestResult {
  success: boolean;
  message?: string;
  postId?: string;
  succulentResponse?: any;
  testData?: any;
  logs: string[];
  duration: number;
  error?: string;
}

export default function SucculentTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<TestResult | null>(null);
  const [customContent, setCustomContent] = useState('');
  const [customImageText, setCustomImageText] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const addLog = (message: string, type: LogEntry['type'] = 'info', data?: any) => {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      message,
      type,
      data
    };
    setLogs(prev => [...prev, logEntry]);
  };

  const clearLogs = () => {
    setLogs([]);
    setResult(null);
  };

  const runTest = async (isCustom = false) => {
    setIsRunning(true);
    clearLogs();
    
    addLog('🧪 Starting Succulent connection test...', 'info');

    try {
      let response;
      
      if (isCustom) {
        addLog('📝 Running custom test with provided content', 'info');
        response = await fetch('/api/test/succulent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: customContent || undefined,
            imageText: customImageText || undefined,
            title: customTitle || undefined
          })
        });
      } else {
        addLog('🔄 Running automatic test', 'info');
        response = await fetch('/api/test/succulent');
      }

      const data: TestResult = await response.json();
      
      // Parse and display server logs
      if (data.logs) {
        data.logs.forEach(logLine => {
          if (logLine.includes('✅')) {
            addLog(logLine, 'success');
          } else if (logLine.includes('❌') || logLine.includes('💥')) {
            addLog(logLine, 'error');
          } else if (logLine.includes('📋') || logLine.includes('🎨') || logLine.includes('🖼️')) {
            addLog(logLine, 'info');
          } else {
            addLog(logLine, 'info');
          }
        });
      }

      setResult(data);
      
      if (data.success) {
        addLog(`🎉 Test completed successfully in ${data.duration}ms!`, 'success');
        if (data.postId) {
          addLog(`📝 Post ID: ${data.postId}`, 'success');
        }
      } else {
        addLog(`❌ Test failed: ${data.error || data.message}`, 'error');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`💥 Request failed: ${errorMessage}`, 'error');
      setResult({
        success: false,
        error: errorMessage,
        logs: [],
        duration: 0
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🌸 Succulent Social Test
          </h1>
          <p className="text-gray-600">
            Test your Succulent Social integration and debug any connection issues.
          </p>
        </div>

        {/* Test Controls */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Quick Test */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">🚀 Quick Test</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Run an automatic test with default content to verify your Succulent setup.
            </p>
            <button
              onClick={() => runTest(false)}
              disabled={isRunning}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {isRunning ? '⏳ Testing...' : '🧪 Run Quick Test'}
            </button>
          </div>

          {/* Custom Test */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">🎨 Custom Test</h2>
            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Custom post content (optional)"
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Image text (optional)"
                value={customImageText}
                onChange={(e) => setCustomImageText(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Post title (optional)"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <button
              onClick={() => runTest(true)}
              disabled={isRunning}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {isRunning ? '⏳ Testing...' : '🎯 Run Custom Test'}
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {result && (
          <div className={`rounded-lg shadow-sm border p-6 mb-6 ${
            result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {result.success ? '✅ Test Successful' : '❌ Test Failed'}
              </h2>
              <span className="text-sm text-gray-600">
                Duration: {result.duration}ms
              </span>
            </div>
            
            {result.success && result.postId && (
              <p className="text-green-700 mb-2">
                📝 Post created with ID: <code className="bg-green-100 px-2 py-1 rounded">{result.postId}</code>
              </p>
            )}
            
            {result.error && (
              <p className="text-red-700">
                Error: {result.error}
              </p>
            )}

            {result.testData && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  View Test Data
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                  {JSON.stringify(result.testData, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Live Logs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">📋 Live Logs</h2>
            <button
              onClick={clearLogs}
              disabled={isRunning}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              Clear Logs
            </button>
          </div>
          
          <div className="p-6">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No logs yet. Run a test to see detailed debugging information.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm font-mono">
                    <span className="text-xs text-gray-400 mt-1">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={getLogColor(log.type)}>
                      {getLogIcon(log.type)}
                    </span>
                    <div className="flex-1">
                      <span className={getLogColor(log.type)}>
                        {log.message}
                      </span>
                      {log.data && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs text-gray-600">
                            Show data
                          </summary>
                          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Environment Info */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold mb-3">🔧 Environment Check</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Base URL:</span> {process.env.NEXT_PUBLIC_BASE_URL || 'Not set'}
            </div>
            <div>
              <span className="font-medium">Environment:</span> {process.env.NODE_ENV || 'development'}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Other environment variables are checked securely on the server side during testing.
          </p>
        </div>
      </div>
    </div>
  );
}
