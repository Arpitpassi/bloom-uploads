import React from 'react'
import { Terminal, X, AlertCircle, Check, Upload } from 'lucide-react'

interface UploadResultsProps {
  uploadStatus: string
  uploadResult: string
  errorMessage: string
  selectedFile: File | null
  textContent: string
  formatFileSize: (bytes: number) => string
  onClose: () => void
}

const UploadResults: React.FC<UploadResultsProps> = ({
  uploadStatus,
  uploadResult,
  errorMessage,
  selectedFile,
  textContent,
  formatFileSize,
  onClose,
}) => {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <Terminal className="h-4 w-4 text-gray-600" />
            </div>
            <span className="font-mono text-sm font-medium">Upload Results</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            {errorMessage ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <Check className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium">Status: {errorMessage ? "Failed" : "Success"}</span>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">File:</span> {selectedFile?.name}
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">Size:</span> {selectedFile && formatFileSize(selectedFile.size)}
          </div>

          {uploadResult && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Transaction:</span> {uploadResult.split("/").pop()}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <span className="font-medium">Error:</span> {errorMessage}
            </div>
          )}
        </div>

        {uploadResult && !errorMessage && (
          <div className="mt-4 rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-700 mb-2">🌐 File available at:</p>
            <a
              href={uploadResult}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-blue-600 hover:text-blue-800 underline break-all transition-colors"
            >
              {uploadResult}
            </a>
          </div>
        )}

        {selectedFile?.type.startsWith("text/") && textContent && !errorMessage && (
          <div className="mt-4 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">File Preview:</h3>
            <pre className="text-xs font-mono text-gray-600 whitespace-pre-wrap max-h-64 overflow-auto bg-gray-50 p-3 rounded">
              {textContent}
            </pre>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="inline-flex items-center space-x-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-all duration-200"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Another File</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadResults