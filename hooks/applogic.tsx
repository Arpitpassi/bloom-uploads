"use client"

import { useState, useEffect } from "react"
import { useConnection } from "@arweave-wallet-kit/react"
import { useToast } from "./use-toast"
import { handleUpload } from "./uploadLogic"
import { readTextFile, animateTextContent, getFileIcon, formatFileSize, validateArweaveAddress } from "./utils"
import type { JWKInterface } from "arweave/node/lib/wallet"
import { TurboFactory, type TurboAuthenticatedClient } from "@ardrive/turbo-sdk/web"
import { ArconnectSigner, ArweaveSigner } from "@ardrive/turbo-sdk/web"

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
  const [isProfileCreationInProgress, setIsProfileCreationInProgress] = useState(false)

  const { connect, disconnect, connected } = useConnection()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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

  useEffect(() => {
    if (wallet) {
      setTurbo(
        TurboFactory.authenticated({
          signer: "connect" in wallet ? new ArconnectSigner(wallet) : new ArweaveSigner(wallet),
          token: "arweave",
        })
      )
    } else {
      setTurbo(null)
    }
  }, [wallet])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu && !(event.target as Element).closest(".relative")) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showProfileMenu])

  useEffect(() => {
    if (connected && !isProfileCreationInProgress) {
      setWallet(window.arweaveWallet)
      setWalletType("external")
      window.arweaveWallet.getActiveAddress().then((addr: string) => setAddress(addr))
      setShowWalletOptions(false)
      setGeneralError("")
    } else if (walletType === "external") {
      setWallet(null)
      setAddress("")
      setWalletType(null)
    }
  }, [connected, isProfileCreationInProgress])

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
      setGeneralError("")
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to disconnect wallet", variant: "destructive" })
    }
  }

  const copyAddress = async () => {
    if (!address) {
      toast({ title: "Error", description: "No wallet address to copy", variant: "destructive" })
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
      toast({ title: "Success", description: `Address ${address.slice(0, 10)}... copied to clipboard` })
      setTimeout(() => setIsAddressCopied(false), 2000)
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy address", variant: "destructive" })
    }
  }

  const copySponsorAddress = async () => {
    if (!savedSponsorAddress) {
      toast({ title: "Error", description: "No sponsor address to copy", variant: "destructive" })
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
      toast({ title: "Success", description: `Address ${savedSponsorAddress.slice(0, 10)}... copied to clipboard` })
      setTimeout(() => setIsSponsorAddressCopied(false), 2000)
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy sponsor address", variant: "destructive" })
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

  const generateRandomJwk = async () => {
    setIsProfileCreationInProgress(true)
    setShowProfileCreation(true)
    setShowWalletOptions(false)
    setGeneralError("")
  }

  const handleProfileCreation = async (name: string) => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Please enter a profile name", variant: "destructive" })
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
      setShowWalletOptions(false)
      toast({ title: "Success", description: "Profile created successfully!" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate wallet", variant: "destructive" })
    } finally {
      setIsCreatingProfile(false)
      setIsProfileCreationInProgress(false)
    }
  }

  const handleProfileCreationCancel = () => {
    setShowProfileCreation(false)
    setIsProfileCreationInProgress(false)
    setShowWalletOptions(false)
    setGeneralError("")
  }

  const connectWallet = async () => {
    try {
      setIsProfileCreationInProgress(true)
      await connect()
      setShowWalletOptions(false)
      toast({ title: "Success", description: "Wallet connected successfully!" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to connect wallet", variant: "destructive" })
    } finally {
      setIsProfileCreationInProgress(false)
    }
  }

  const handleUploadClick = () => {
    if (!wallet) {
      setShowWalletOptions(true)
      return
    }
    if (!selectedFile) {
      toast({ title: "Error", description: "No file selected", variant: "destructive" })
      return
    }
    if (!turbo) {
      toast({ title: "Error", description: "Turbo client not initialized", variant: "destructive" })
      return
    }
    if (savedSponsorAddress && walletType === "sponsored") {
      setSponsorWalletAddress(savedSponsorAddress)
      handleUpload({
        selectedFile,
        wallet,
        turbo,
        sponsorWalletAddress: savedSponsorAddress,
        setUploadStatus,
        setIsUploading,
        setUploadResult,
        setErrorMessage,
        animateTextContent: (text) => animateTextContent(text, setDisplayedText, setIsTextAnimating),
        toast,
        validateArweaveAddress,
      })
    } else {
      setShowSponsorInput(true)
    }
  }

  return {
    wallet, selectedFile, uploadStatus, isUploading, showWalletOptions, showSponsorInput, sponsorWalletAddress,
    savedSponsorAddress, address, uploadResult, showTerminal, turbo, textContent, displayedText, isTextAnimating,
    errorMessage, profileName, showProfileCreation, isCreatingProfile, isAddressCopied, isSponsorAddressCopied,
    isMobile, generalError, showProfileMenu, walletType, hasSponsoredWallet,
    setWallet, setSelectedFile, setUploadStatus, setIsUploading, setShowWalletOptions, setShowSponsorInput,
    setSponsorWalletAddress, setSavedSponsorAddress, setAddress, setUploadResult, setShowTerminal, setTurbo,
    setTextContent, setDisplayedText, setIsTextAnimating, setErrorMessage, setProfileName, setShowProfileCreation,
    setIsCreatingProfile, setIsAddressCopied, setIsSponsorAddressCopied, setIsMobile, setGeneralError,
    setShowProfileMenu, setWalletType, setHasSponsoredWallet,
    saveProfile, deleteProfile, deleteSponsorAddress, disconnectWallet, copyAddress, copySponsorAddress,
    handleFileSelect, getFileIcon, formatFileSize, generateRandomJwk, handleProfileCreation,
    handleProfileCreationCancel, connectWallet, handleUploadClick, handleUpload,
  }
}