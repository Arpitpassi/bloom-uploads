"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Upload,
  FileText,
  ImageIcon,
  Music,
  Video,
  File,
  Terminal,
  Wallet,
  Globe,
  Zap,
  Copy,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  LogOut,
} from "lucide-react"
import { ArconnectSigner, ArweaveSigner, type TurboAuthenticatedClient, TurboFactory } from "@ardrive/turbo-sdk/web"
import Arweave from "arweave"
import type { JWKInterface } from "arweave/node/lib/wallet"

TurboFactory.setLogLevel("debug")

const arweave = new Arweave({
  host: "arweave.net",
  port: 443,
  protocol: "https",
})

const App = () => {
  const [wallet, setWallet] = useState<JWKInterface | Window["arweaveWallet"] | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [showSponsorInput, setShowSponsorInput] = useState(false)
  const [sponsorWalletAddress, setSponsorWalletAddress] = useState("")
  const [address, setAddress] = useState("")
  const [uploadResult, setUploadResult] = useState<string>("")
  const [showTerminal, setShowTerminal] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [turbo, setTurbo] = useState<TurboAuthenticatedClient | null>(null)
  const [textContent, setTextContent] = useState<string>("")
  const [displayedText, setDisplayedText] = useState<string>("")
  const [isTextAnimating, setIsTextAnimating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [profileName, setProfileName] = useState<string>("")
  const [showProfileCreation, setShowProfileCreation] = useState(false)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [isAddressCopied, setIsAddressCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [generalError, setGeneralError] = useState<string>("")
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [walletType, setWalletType] = useState<"sponsored" | "external" | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const savedProfile = localStorage.getItem("turboUploaderProfile")
    if (savedProfile) {
      const { name, wallet } = JSON.parse(savedProfile)
      setProfileName(name)
      setWallet(wallet)
      setWalletType("sponsored")
      arweave.wallets.getAddress(wallet).then((addr) => setAddress(addr))
    } else {
      setShowWalletOptions(true)
    }
  }, [])

  const saveProfile = (name: string, wallet: JWKInterface) => {
    localStorage.setItem("turboUploaderProfile", JSON.stringify({ name, wallet }))
    setProfileName(name)
  }

  const deleteProfile = () => {
    localStorage.removeItem("turboUploaderProfile")
    setProfileName("")
    setWallet(null)
    setAddress("")
    setTurbo(null)
    setWalletType(null)
    setShowWalletOptions(true)
  }

  const disconnectWallet = () => {
    setWallet(null)
    setAddress("")
    setTurbo(null)
    setProfileName("")
    setWalletType(null)
    localStorage.removeItem("turboUploaderProfile")
    setShowWalletOptions(true)
    setShowProfileMenu(false)
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address).then(() => {
        setIsAddressCopied(true)
        setTimeout(() => setIsAddressCopied(false), 2000)
      })
    }
  }

  const readTextFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve((e.target?.result as string) || "")
      reader.readAsText(file)
    })
  }

  const animateTextContent = (text: string) => {
    setIsTextAnimating(true)
    setDisplayedText("")

    for (let i = 0; i <= text.length; i++) {
      setTimeout(() => {
        setDisplayedText(text.slice(0, i))
        if (i === text.length) {
          setIsTextAnimating(false)
        }
      }, i * 20)
    }
  }

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setUploadStatus("")
    setUploadResult("")
    setErrorMessage("")
    setShowTerminal(false)
    setTextContent("")
    setDisplayedText("")

    if (file.type.startsWith("text/")) {
      const text = await readTextFile(file)
      setTextContent(text.slice(0, 500))
    } else {
      setTextContent(`Selected file: ${file.name}\nSize: ${formatFileSize(file.size)}`)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
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
      handleFileSelect(files[0])
    }
  }

  const getFileIcon = (file: File) => {
    const fileType = file.type.split("/")[0]
    switch (fileType) {
      case "image":
        return <ImageIcon className="w-6 h-6 text-blue-600" />
      case "video":
        return <Video className="w-6 h-6 text-purple-600" />
      case "audio":
        return <Music className="w-6 h-6 text-green-600" />
      case "text":
        return <FileText className="w-6 h-6 text-orange-600" />
      default:
        return <File className="w-6 h-6 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const generateRandomJwk = async () => {
    setShowProfileCreation(true)
    setShowWalletOptions(false)
  }

  const handleProfileCreation = async () => {
    if (!profileName) {
      setGeneralError("Please enter a profile name")
      return
    }
    setIsCreatingProfile(true)
    try {
      const jwk = await arweave.wallets.generate()
      const address = await arweave.wallets.getAddress(jwk)
      saveProfile(profileName, jwk)
      setWallet(jwk)
      setAddress(address)
      setWalletType("sponsored")
      setShowProfileCreation(false)
      setGeneralError("")
      setShowWalletOptions(false)
    } catch (error) {
      const errorMsg = `Error generating wallet: ${error instanceof Error ? error.message : "Unknown error"}`
      setGeneralError(errorMsg)
    } finally {
      setIsCreatingProfile(false)
    }
  }

  const connectWallet = async () => {
    try {
      if (window.arweaveWallet) {
        const requiredPermissions = ["ACCESS_ADDRESS", "ACCESS_PUBLIC_KEY", "SIGN_TRANSACTION", "SIGNATURE"]
        const permissions = await window.arweaveWallet.getPermissions()

        if (requiredPermissions.every((permission) => permissions.includes(permission as any))) {
          setWallet(window.arweaveWallet)
        } else {
          await window.arweaveWallet.connect(requiredPermissions as any)
          setWallet(window.arweaveWallet)
        }

        const addr = await window.arweaveWallet.getActiveAddress()
        setAddress(addr)
        setWalletType("external")
        setShowWalletOptions(false)
        setGeneralError("")
      } else {
        setGeneralError("Arweave wallet not found. Please install an Arweave-compatible wallet.")
      }
    } catch (error) {
      setGeneralError(`Error connecting wallet: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleUploadClick = () => {
    if (wallet) {
      setShowSponsorInput(true)
    } else {
      setShowWalletOptions(true)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !wallet || !turbo) {
      const errorMsg = !selectedFile
        ? "No file selected"
        : !wallet
          ? "No wallet connected"
          : "Turbo client not initialized"
      setGeneralError(errorMsg)
      return
    }

    setIsUploading(true)
    setGeneralError("")
    setUploadStatus("Preparing upload...")
    animateTextContent(
      `Preparing upload...\nConnecting to Arweave network...\nSigning transaction...\nUploading to Arweave...`,
    )

    try {
      const uploadOptions = {
        fileStreamFactory: () => selectedFile.stream(),
        fileSizeFactory: () => selectedFile.size,
        dataItemOpts: {
          tags: [
            { name: "App-Name", value: "TurboUploader" },
            { name: "anchor", value: new Date().toISOString() },
            { name: "Content-Type", value: selectedFile.type || "application/octet-stream" },
          ],
          ...(sponsorWalletAddress ? { paidBy: sponsorWalletAddress } : {}),
        },
        events: {
          onSigningProgress: () => {
            setUploadStatus("Signing transaction...")
          },
          onSigningError: (error: Error) => {
            const errorMsg = `Signing error: ${error.message}`
            setUploadStatus(errorMsg)
            setErrorMessage(errorMsg)
            animateTextContent(errorMsg)
            setIsUploading(false)
            setShowTerminal(true)
          },
          onUploadProgress: () => {
            setUploadStatus("Uploading to Arweave...")
          },
          onUploadError: (error: Error) => {
            let errorMsg = `Upload error: ${error.message}`
            if (error.message.includes("insufficient balance")) {
              errorMsg = "Upload failed: Insufficient balance in wallet or sponsor wallet"
            } else if (error.message.includes("network")) {
              errorMsg = "Upload failed: Network connection issue. Please check your internet connection."
            }
            setUploadStatus(errorMsg)
            setErrorMessage(errorMsg)
            animateTextContent(errorMsg)
            setIsUploading(false)
            setShowTerminal(true)
          },
        },
      }

      const upload = await turbo.uploadFile(uploadOptions)

      if (upload && upload.id) {
        const arweaveUrl = `https://arweave.net/${upload.id}`
        setUploadResult(arweaveUrl)
        setUploadStatus("Upload completed successfully!")
        setErrorMessage("")
        animateTextContent(`Upload completed successfully!\nTransaction ID: ${upload.id}`)
        setTimeout(() => {
          setIsUploading(false)
          setShowTerminal(true)
        }, 1000)
      } else {
        const errorMsg = "Upload failed: No transaction ID received"
        setUploadStatus(errorMsg)
        setErrorMessage(errorMsg)
        animateTextContent(errorMsg)
        setIsUploading(false)
        setShowTerminal(true)
      }
    } catch (error) {
      let errorMsg = `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
      if (error instanceof Error) {
        if (error.message.includes("timeout") || error.message.includes("network")) {
          errorMsg = "Upload failed: Network timeout or connection issue"
        } else if (error.message.includes("invalid signature")) {
          errorMsg = "Upload failed: Invalid transaction signature"
        } else if (error.message.includes("balance")) {
          errorMsg = "Upload failed: Insufficient balance in wallet or sponsor wallet"
        }
      }
      setUploadStatus(errorMsg)
      setErrorMessage(errorMsg)
      animateTextContent(errorMsg)
      setIsUploading(false)
      setShowTerminal(true)
    }
  }

  useEffect(() => {
    if (wallet) {
      setTurbo(
        TurboFactory.authenticated({
          signer: ("connect" in wallet ? new ArconnectSigner(wallet) : new ArweaveSigner(wallet)) as any,
          token: "arweave",
        }),
      )
    }
  }, [wallet])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu && !(event.target as Element).closest(".relative")) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showProfileMenu])

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Bloom Uploads</h1>
                <p className="text-sm text-gray-500">Powered by Arweave</p>
              </div>
            </div>

            {profileName && (
              <div className="relative">
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Welcome, {profileName}</p>
                    {address && (
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500 font-mono truncate max-w-[200px]">{address}</p>
                        <button
                          onClick={copyAddress}
                          className="inline-flex items-center space-x-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          {isAddressCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          <span>{isAddressCopied ? "Copied!" : "Copy"}</span>
                        </button>
                        {walletType === "external" && (
                          <button
                            onClick={disconnectWallet}
                            className="inline-flex items-center space-x-1 rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-200 transition-colors"
                          >
                            <LogOut className="h-3 w-3" />
                            <span>Disconnect</span>
                          </button>
                        )}
                        <button
                          onClick={deleteProfile}
                          className="inline-flex items-center space-x-1 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:hidden">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <span>Profile</span>
                    <div className="flex flex-col space-y-1">
                      <div className="w-4 h-0.5 bg-gray-600 transition-all duration-200"></div>
                      <div className="w-4 h-0.5 bg-gray-600 transition-all duration-200"></div>
                      <div className="w-4 h-0.5 bg-gray-600 transition-all duration-200"></div>
                    </div>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-2 w-80 rounded-lg bg-white border border-gray-200 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Welcome, {profileName}</p>
                        {address && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-2">Wallet Address:</p>
                            <div className="bg-gray-50 rounded-md p-2 break-all">
                              <p className="text-xs font-mono text-gray-700">{address}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => {
                            copyAddress()
                            setShowProfileMenu(false)
                          }}
                          className="w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          {isAddressCopied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span>{isAddressCopied ? "Address Copied!" : "Copy Address"}</span>
                        </button>

                        <button
                          onClick={() => {
                            deleteProfile()
                            setShowProfileMenu(false)
                          }}
                          className="w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Profile</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isUploading && !showTerminal && !showWalletOptions && !showProfileCreation && !showSponsorInput && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-300 ${
                dragOver
                  ? "border-blue-500 bg-blue-50 scale-[1.02]"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
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
                  onClick={handleUploadClick}
                  className="inline-flex items-center space-x-2 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload to Arweave</span>
                </button>
              </div>
            )}
          </div>
        )}

        {isUploading && (
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
        )}

        {showTerminal && (
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
                  onClick={() => {
                    setShowTerminal(false)
                    setSelectedFile(null)
                    setUploadResult("")
                    setTextContent("")
                    setDisplayedText("")
                    setErrorMessage("")
                  }}
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
                  onClick={() => {
                    setShowTerminal(false)
                    setSelectedFile(null)
                    setUploadResult("")
                    setTextContent("")
                    setDisplayedText("")
                    setErrorMessage("")
                  }}
                  className="inline-flex items-center space-x-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-all duration-200"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Another File</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {showWalletOptions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Connect Wallet</h3>
                <button
                  onClick={() => {
                    setShowWalletOptions(false)
                    setGeneralError("")
                  }}
                  className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              {generalError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{generalError}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={generateRandomJwk}
                  className="w-full flex items-center justify-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Create Sponsored Wallet</span>
                </button>

                {!isMobile && (
                  <button
                    onClick={connectWallet}
                    className="w-full flex items-center justify-center space-x-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Connect External Wallet</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showProfileCreation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Create Profile</h3>
                <button
                  onClick={() => {
                    setShowProfileCreation(false)
                    setGeneralError("")
                  }}
                  disabled={isCreatingProfile}
                  className="rounded-lg p-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {generalError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">{generalError}</span>
                    </div>
                  </div>
                )}

                {isCreatingProfile ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <Loader2 className="h-8 w-8 text-gray-600 animate-spin" />
                    <p className="text-sm font-medium text-gray-700">Creating Profile...</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Name
                      </label>
                      <input
                        id="profileName"
                        type="text"
                        placeholder="Enter your name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        disabled={isCreatingProfile}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handleProfileCreation}
                        disabled={isCreatingProfile}
                        className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileCreation(false)
                          setGeneralError("")
                        }}
                        disabled={isCreatingProfile}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {showSponsorInput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Sponsor Wallet</h3>
                <button
                  onClick={() => {
                    setShowSponsorInput(false)
                    setGeneralError("")
                  }}
                  className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {generalError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">{generalError}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="sponsorAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Sponsor Wallet Address (Optional)
                  </label>
                  <input
                    id="sponsorAddress"
                    type="text"
                    placeholder="Enter sponsor wallet address"
                    value={sponsorWalletAddress}
                    onChange={(e) => setSponsorWalletAddress(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowSponsorInput(false)
                      handleUpload()
                    }}
                    className="flex-1 inline-flex items-center justify-center space-x-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span>Continue Upload</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSponsorInput(false)
                      setGeneralError("")
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App