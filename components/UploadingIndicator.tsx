import React from 'react'
  import { Terminal } from 'lucide-react'

  interface UploadingIndicatorProps {
    displayedText: string
    isTextAnimating: boolean
  }

  const UploadingIndicator: React.FC<UploadingIndicatorProps> = ({ displayedText, isTextAnimating }) => {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <Terminal className="h-4 w-4 text-gray-600" />
            </div>
            <span className="font-mono text-sm font-medium">arweave-upload</span>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap max-h-64 overflow-auto">
              {displayedText}
              {isTextAnimating && <span className="animate-pulse">_</span>}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  export default UploadingIndicator