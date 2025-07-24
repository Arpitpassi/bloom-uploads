import { ImageIcon, Video, Music, FileText, File } from "lucide-react"

export const readTextFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve((e.target?.result as string) || "")
    reader.readAsText(file)
  })
}

export const animateTextContent = (text: string, setDisplayedText: (text: string) => void, setIsTextAnimating: (isAnimating: boolean) => void) => {
  setIsTextAnimating(true)
  setDisplayedText("")
  for (let i = 0; i <= text.length; i++) {
    setTimeout(() => {
      setDisplayedText(text.slice(0, i))
      if (i === text.length) setIsTextAnimating(false)
    }, i * 20)
  }
}

export const getFileIcon = (file: File) => {
  const fileType = file.type.split("/")[0]
  switch (fileType) {
    case "image": return <ImageIcon className="w-6 h-6 text-blue-600" />
    case "video": return <Video className="w-6 h-6 text-purple-600" />
    case "audio": return <Music className="w-6 h-6 text-green-600" />
    case "text": return <FileText className="w-6 h-6 text-orange-600" />
    default: return <File className="w-6 h-6 text-gray-600" />
  }
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const validateArweaveAddress = (addr: string): boolean => {
  return /^[a-zA-Z0-9_-]{43}$/.test(addr)
}