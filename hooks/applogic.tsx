"use client"

import { useState, useEffect } from "react"
import { ImageIcon, Video, Music, FileText, File } from "lucide-react"
import { ArconnectSigner, ArweaveSigner, TurboFactory, type TurboAuthenticatedClient } from "@ardrive/turbo-sdk/web"
import type { JWKInterface } from "arweave/node/lib/wallet"
import { useConnection } from "@arweave-wallet-kit/react"
import { useUser } from "./useUser"
import { useToast } from "./use-toast"

type TurboSigner = ArconnectSigner | ArweaveSigner

export const useAppLogic = (arweave: any) => {
  const { toast } = useToast()
  const [wallet, setWallet] = useState<JWKInterface | Window["arweaveWallet"] | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [showSponsorInput, setShowSponsorInput] = useState(false)
  const [sponsorWalletAddress, setSponsorWalletAddress] = useState("")
  const [savedSponsorAddress, setSavedSponsorAddress] = useState("")
  const [address, setAddress] = useState("")
  const [uploadResult, setUploadResult] = useState<string>("")
  const [showTerminal, setShowTerminal] = useState(false)
  const [turbo, setTurbo] = useState<TurboAuthenticatedClient | null>(null)
  const [textContent, setTextContent] = useState<string>("")
  const [displayedText, setDisplayedText] = useState<string>("")
  const [isTextAnimating, setIsTextAnimating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [profileName, setProfileName] = useState<string>("")
  const [showProfileCreation, setShowProfileCreation] = useState(false)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [isAddressCopied, setIsAddressCopied] = useState(false)
  const [isSponsorAddressCopied, setIsSponsorAddressCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [generalError, setGeneralError] = useState<string>("")
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [walletType, setWalletType] = useState<"sponsored" | "external" | null>(null)
  const [hasSponsoredWallet, setHasSponsoredWallet] = useState(false)

  const { connect, disconnect } = useConnection()
  const { connected } = useUser()

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Profile loading effect
  useEffect(() => {
    const savedProfile = localStorage.getItem("turboUploaderProfile")
    if (savedProfile) {
      const { name, wallet, sponsorAddress } = JSON.parse(savedProfile)
      setProfileName(name)
      setWallet(wallet)
      setSavedSponsorAddress(sponsorAddress || "")
      setSponsorWalletAddress(sponsorAddress || "")
      setWalletType("sponsored")
      setHasSponsoredWallet(true)
      arweave.wallets.getAddress(wallet).then((addr: string) => setAddress(addr))
    }
  }, [arweave])

  // Turbo client initialization effect
  useEffect(() => {
    if (wallet) {
      setTurbo(
        TurboFactory.authenticated({
          signer: "connect" in wallet ? new ArconnectSigner(wallet) : new ArweaveSigner(wallet),
          token: "arweave",
        })
      )
    }
  }, [wallet])

  // Profile menu outside click effect
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

  // Wallet state sync with Arweave Wallet Kit
  useEffect(() => {
    if (connected) {
      setWallet(window.arweaveWallet)
      setWalletType("external")
      window.arweaveWallet.getActiveAddress().then((addr: string) => setAddress(addr))
      setShowWalletOptions(false)
    } else if (walletType === "external") {
      setWallet(null)
      setAddress("")
      setWalletType(null)
    }
  }, [connected])

  // Utility functions
  const saveProfile = (name: string, wallet: JWKInterface, sponsorAddress: string = "") => {
    localStorage.setItem("turboUploaderProfile", JSON.stringify({ name, wallet, sponsorAddress }))
    setProfileName(name)
    setSavedSponsorAddress(sponsorAddress)
  }

  const deleteProfile = () => {
    localStorage.removeItem("turboUploaderProfile")
    setProfileName("")
    setWallet(null)
    setAddress("")
    setTurbo(null)
    setWalletType(null)
    setHasSponsoredWallet(false)
    setSavedSponsorAddress("")
    setSponsorWalletAddress("")
    setShowWalletOptions(false)
  }

  const deleteSponsorAddress = () => {
    const savedProfile = localStorage.getItem("turboUploaderProfile")
    if (savedProfile) {
      const { name, wallet } = JSON.parse(savedProfile)
      saveProfile(name, wallet)
      setSavedSponsorAddress("")
      setSponsorWalletAddress("")
    }
  }

  const disconnectWallet = async () => {
    try {
      await disconnect()
      setWallet(null)
      setAddress("")
      setTurbo(null)
      setProfileName("")
      setWalletType(null)
      setSavedSponsorAddress("")
      setSponsorWalletAddress("")
      setShowWalletOptions(false)
    } catch (error: any) {
      setGeneralError(error.message || "Failed to disconnect wallet")
    }
  }

  const copyAddress = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "No wallet address to copy",
        variant: "destructive",
      })
      return
    }
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(address)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = address
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }
      setIsAddressCopied(true)
      toast({
        title: "Success",
        description: `Address ${address.slice(0, 10)}... copied to clipboard`,
      })
      setTimeout(() => setIsAddressCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy address:", error)
      toast({
        title: "Error",
        description: `Failed to copy address: ${error instanceof Error ? error.message : String(error)}. Select the address manually.`,
        variant: "destructive",
      })
    }
  }

  const copySponsorAddress = async () => {
    if (!savedSponsorAddress) {
      toast({
        title: "Error",
        description: "No sponsor address to copy",
        variant: "destructive",
      })
      return
    }
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(savedSponsorAddress)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = savedSponsorAddress
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }
      setIsSponsorAddressCopied(true)
      toast({
        title: "Success",
        description: `Address ${savedSponsorAddress.slice(0, 10)}... copied to clipboard`,
      })
      setTimeout(() => setIsSponsorAddressCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy sponsor address:", error)
      toast({
        title: "Error",
        description: `Failed to copy address: ${error instanceof Error ? error.message : String(error)}. Select the address manually.`,
        variant: "destructive",
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

  const handleProfileCreation = async (name: string) => {
    if (!name) {
      setGeneralError("Please enter a profile name")
      return
    }
    setIsCreatingProfile(true)
    try {
      const jwk = await arweave.wallets.generate()
      const address = await arweave.wallets.getAddress(jwk)
      saveProfile(name, jwk, savedSponsorAddress)
      setWallet(jwk)
      setAddress(address)
      setWalletType("sponsored")
      setHasSponsoredWallet(true)
      setShowProfileCreation(false)
      setGeneralError("")
      setShowWalletOptions(false)
    } catch (error: any) {
      setGeneralError(error.message || "Failed to generate wallet")
    } finally {
      setIsCreatingProfile(false)
    }
  }

  const connectWallet = async () => {
    try {
      await connect()
      setShowWalletOptions(false)
    } catch (error: any) {
      setGeneralError(error.message || "Failed to connect wallet")
    }
  }

  const validateArweaveAddress = (addr: string): boolean => {
    return /^[a-zA-Z0-9_-]{43}$/.test(addr)
  }

  const handleUploadClick = () => {
    if (!wallet) {
      setShowWalletOptions(true)
      return
    }
    if (savedSponsorAddress && walletType === "sponsored") {
      setSponsorWalletAddress(savedSponsorAddress)
      handleUpload()
    } else {
      setShowSponsorInput(true)
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

    if (sponsorWalletAddress && !validateArweaveAddress(sponsorWalletAddress)) {
      setGeneralError("Invalid sponsor wallet address. Must be a valid 43-character Arweave address.")
      return
    }

    setIsUploading(true)
    setGeneralError("")
    setUploadStatus("Preparing upload...")
    animateTextContent(
      `Preparing upload...\nConnecting to Arweave network...\nSigning transaction...\nUploading to Arweave...`,
    )

    try {
      if (sponsorWalletAddress && walletType === "sponsored") {
        const savedProfile = localStorage.getItem("turboUploaderProfile")
        if (savedProfile) {
          const { name, wallet } = JSON.parse(savedProfile)
          saveProfile(name, wallet, sponsorWalletAddress)
        }
      }

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
    } catch (error: any) {
      let errorMsg = `Upload failed: ${error.message}`
      if (error.message.includes("timeout") || error.message.includes("network")) {
        errorMsg = "Upload failed: Network timeout or connection issue"
      } else if (error.message.includes("invalid signature")) {
        errorMsg = "Upload failed: Invalid transaction signature"
      } else if (error.message.includes("balance")) {
        errorMsg = "Upload failed: Insufficient balance in wallet or sponsor wallet"
      }
      setUploadStatus(errorMsg)
      setErrorMessage(errorMsg)
      animateTextContent(errorMsg)
      setIsUploading(false)
      setShowTerminal(true)
    }
  }

  return {
    wallet,
    selectedFile,
    uploadStatus,
    isUploading,
    showWalletOptions,
    showSponsorInput,
    sponsorWalletAddress,
    savedSponsorAddress,
    address,
    uploadResult,
    showTerminal,
    turbo,
    textContent,
    displayedText,
    isTextAnimating,
    errorMessage,
    profileName,
    showProfileCreation,
    isCreatingProfile,
    isAddressCopied,
    isSponsorAddressCopied,
    isMobile,
    generalError,
    showProfileMenu,
    walletType,
    hasSponsoredWallet,
    
    setWallet,
    setSelectedFile,
    setUploadStatus,
    setIsUploading,
    setShowWalletOptions,
    setShowSponsorInput,
    setSponsorWalletAddress,
    setSavedSponsorAddress,
    setAddress,
    setUploadResult,
    setShowTerminal,
    setTurbo,
    setTextContent,
    setDisplayedText,
    setIsTextAnimating,
    setErrorMessage,
    setProfileName,
    setShowProfileCreation,
    setIsCreatingProfile,
    setIsAddressCopied,
    setIsSponsorAddressCopied,
    setIsMobile,
    setGeneralError,
    setShowProfileMenu,
    setWalletType,
    setHasSponsoredWallet,
    
    saveProfile,
    deleteProfile,
    deleteSponsorAddress,
    disconnectWallet,
    copyAddress,
    copySponsorAddress,
    handleFileSelect,
    getFileIcon,
    formatFileSize,
    generateRandomJwk,
    handleProfileCreation,
    connectWallet,
    handleUploadClick,
    handleUpload,
  }
}