import React, { JSX, useRef, useState } from 'react'
import { Upload, Check } from 'lucide-react'

interface FileSelectorProps {
  selectedFile: File | null
  onFileSelect: (file: File) => void
  onUpload: () => void
  getFileIcon: (file: File) => JSX.Element
  formatFileSize: (bytes: number) => string
}

const FileSelector: React.FC<FileSelectorProps> = ({
  selectedFile,
  onFileSelect,
  onUpload,
  getFileIcon,
  formatFileSize,
}) => {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          dragOver
            ? "border-blue-500 bg-blue-50 scale-[1.01]"
            : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {selectedFile ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-center space-x-3">
              {getFileIcon(selectedFile)}
              <span className="text-lg font-medium truncate max-w-xs">{selectedFile.name}</span>
            </div>
            <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
            <div className="inline-flex items-center space-x-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              <Check className="h-4 w-4" />
              <span>File Ready</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">Drop your file here</p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
            <p className="text-xs text-gray-400">Supports images, text, audio, and video files</p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="text-center">
          <button
            onClick={onUpload}
            className="inline-flex items-center space-x-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Upload className="h-4 w-4" />
            <span>Upload to Arweave</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default FileSelector