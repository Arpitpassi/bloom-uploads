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
import Header from "../components/Header"
import WalletOptionsModal from "../components/WalletOptionsModal"
import ProfileCreationModal from "../components/ProfileCreationModal"
import SponsorInputModal from "../components/SponsorInputModal"
import FileSelector from "../components/FileSelector"
import UploadingIndicator from "../components/UploadingIndicator"
import UploadResults from "../components/UploadResults"
import { useAppLogic } from "../hooks/applogic"
import { GoogleLogin, googleLogout } from '@react-oauth/google'
import { encryptJWK, decryptJWK } from "../lib/cryptoUtils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"

TurboFactory.setLogLevel("debug")

const arweave = new Arweave({
  host: "arweave.net",
  port: 443,
  protocol: "https",
})

const App = () => {
  const {
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
    
    setShowWalletOptions,
    setGeneralError,
    setShowProfileCreation,
    setShowSponsorInput,
    setSponsorWalletAddress,
    setShowTerminal,
    setSelectedFile,
    setUploadResult,
    setTextContent,
    setDisplayedText,
    setErrorMessage,
    setProfileName,
    setShowProfileMenu,
    setWallet,
    setAddress,
    setWalletType,
    setHasSponsoredWallet,
    setSavedSponsorAddress,
    setIsCreatingProfile,
    
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
  } = useAppLogic(arweave)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [unlockedWallet, setUnlockedWallet] = useState<JWKInterface | null>(null)
  const [showPassphraseModal, setShowPassphraseModal] = useState(false)
  const [passphrase, setPassphrase] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load profile for sponsored wallet
  useEffect(() => {
    const savedProfile = localStorage.getItem("turboUploaderProfile")
    if (savedProfile) {
      const { name, userId, sponsorAddress } = JSON.parse(savedProfile)
      setProfileName(name)
      setUserId(userId)
      setSavedSponsorAddress(sponsorAddress || "")
      setSponsorWalletAddress(sponsorAddress || "")
      setWalletType("sponsored")
      setHasSponsoredWallet(true)
      setShowPassphraseModal(true) // Prompt for passphrase to unlock wallet
    }
  }, [setProfileName, setUserId, setSavedSponsorAddress, setSponsorWalletAddress, setWalletType, setHasSponsoredWallet])

  // Sync wallet state with unlocked wallet
  useEffect(() => {
    if (unlockedWallet) {
      setWallet(unlockedWallet)
      arweave.wallets.getAddress(unlockedWallet).then((addr: string) => setAddress(addr))
    } else if (walletType !== "external") {
      setWallet(null)
      setAddress("")
    }
  }, [unlockedWallet, setWallet, setAddress, arweave, walletType])

  const handleGoogleSuccess = (response: any) => {
    const token = response.credential
    const decoded = JSON.parse(atob(token.split('.')[1]))
    setIsLoggedIn(true)
    setUserId(decoded.sub)
  }

  const handleGoogleFailure = () => {
    setGeneralError("Google login failed")
    setShowProfileCreation(false)
  }

  const handleLogout = () => {
    googleLogout()
    setIsLoggedIn(false)
    setUserId(null)
    setUnlockedWallet(null)
    setWallet(null)
    setAddress("")
    setShowProfileMenu(false)
    setWalletType(null)
    setHasSponsoredWallet(false)
  }

  const handlePassphraseSubmit = async () => {
    try {
      const savedProfile = localStorage.getItem("turboUploaderProfile")
      if (savedProfile) {
        const { encryptedJWK, salt, iv } = JSON.parse(savedProfile)
        const jwk = await decryptJWK(encryptedJWK, salt, iv, passphrase)
        setUnlockedWallet(jwk)
        setShowPassphraseModal(false)
        setPassphrase("")
      }
    } catch (error) {
      setGeneralError("Incorrect passphrase")
    }
  }

  const modifiedGenerateRandomJwk = async () => {
    if (!isLoggedIn) {
      setShowWalletOptions(false)
      // Show Google login modal
      setGeneralError("Please log in with Google to create a sponsored wallet")
      return
    }
    setShowProfileCreation(true)
    setShowWalletOptions(false)
  }

  const modifiedHandleProfileCreation = async (name: string) => {
    if (!name || !passphrase) {
      setGeneralError("Please enter both a profile name and passphrase")
      return
    }
    if (!isLoggedIn || !userId) {
      setGeneralError("Please log in with Google first")
      return
    }
    setIsCreatingProfile(true)
    try {
      const jwk = await arweave.wallets.generate()
      const { encryptedData, salt, iv } = await encryptJWK(jwk, passphrase)
      const address = await arweave.wallets.getAddress(jwk)
      const profile = {
        name,
        encryptedJWK: encryptedData,
        salt,
        iv,
        userId,
        sponsorAddress: savedSponsorAddress || ""
      }
      localStorage.setItem("turboUploaderProfile", JSON.stringify(profile))
      setProfileName(name)
      setUnlockedWallet(jwk)
      setWalletType("sponsored")
      setHasSponsoredWallet(true)
      setShowProfileCreation(false)
      setPassphrase("")
      setGeneralError("")
      setShowWalletOptions(false)
    } catch (error: any) {
      setGeneralError(error.message || "Failed to generate wallet")
    } finally {
      setIsCreatingProfile(false)
    }
  }

  const modifiedDisconnectWallet = async () => {
    try {
      await disconnectWallet()
      handleLogout()
    } catch (error: any) {
      setGeneralError(error.message || "Failed to disconnect wallet")
    }
  }

  let mainContent
  if (!isLoggedIn && generalError === "Please log in with Google to create a sponsored wallet") {
    mainContent = (
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <p className="text-lg font-medium">Please log in to create a sponsored wallet</p>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleFailure}
        />
      </div>
    )
  } else if (isUploading) {
    mainContent = <UploadingIndicator displayedText={displayedText} isTextAnimating={isTextAnimating} />
  } else if (showTerminal) {
    mainContent = (
      <UploadResults
        uploadStatus={uploadStatus}
        uploadResult={uploadResult}
        errorMessage={errorMessage}
        selectedFile={selectedFile}
        textContent={textContent}
        formatFileSize={formatFileSize}
        onClose={() => {
          setShowTerminal(false)
          setSelectedFile(null)
          setUploadResult("")
          setTextContent("")
          setDisplayedText("")
          setErrorMessage("")
        }}
      />
    )
  } else {
    mainContent = (
      <div className="space-y-6">
        <FileSelector
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onUpload={handleUploadClick}
          getFileIcon={getFileIcon}
          formatFileSize={formatFileSize}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header
        profileName={profileName}
        address={address}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        deleteProfile={() => {
          deleteProfile()
          handleLogout()
        }}
        disconnectWallet={modifiedDisconnectWallet}
        copyAddress={copyAddress}
        copySponsorAddress={copySponsorAddress}
        isAddressCopied={isAddressCopied}
        isSponsorAddressCopied={isSponsorAddressCopied}
        savedSponsorAddress={savedSponsorAddress}
        walletType={walletType}
        deleteSponsorAddress={deleteSponsorAddress}
        connectWallet={() => setShowWalletOptions(true)}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">{mainContent}</main>

      {showWalletOptions && (
        <WalletOptionsModal
          onClose={() => {
            setShowWalletOptions(false)
            setGeneralError("")
          }}
          onCreateSponsored={modifiedGenerateRandomJwk}
          onConnectExternal={connectWallet}
          error={generalError}
          isMobile={isMobile}
          hasSponsoredWallet={hasSponsoredWallet}
        />
      )}

      {showProfileCreation && (
        <ProfileCreationModal
          onClose={() => {
            setShowProfileCreation(false)
            setGeneralError("")
            setPassphrase("")
          }}
          onCreate={modifiedHandleProfileCreation}
          isCreating={isCreatingProfile}
          error={generalError}
          profileName={profileName}
          setProfileName={setProfileName}
          passphrase={passphrase}
          setPassphrase={setPassphrase}
        />
      )}

      {showSponsorInput && (
        <SponsorInputModal
          onClose={() => {
            setShowSponsorInput(false)
            setGeneralError("")
          }}
          onSubmit={(address: string) => {
            setSponsorWalletAddress(address)
            setShowSponsorInput(false)
            handleUpload()
          }}
          error={generalError}
          sponsorWalletAddress={sponsorWalletAddress}
          setSponsorWalletAddress={setSponsorWalletAddress}
        />
      )}

      {showPassphraseModal && (
        <Dialog open={showPassphraseModal} onOpenChange={setShowPassphraseModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Passphrase</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {generalError && (
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>{generalError}</span>
                </div>
              )}
              <Input
                type="password"
                placeholder="Enter your passphrase"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handlePassphraseSubmit}>Unlock Wallet</Button>
              <Button variant="outline" onClick={() => {
                setShowPassphraseModal(false)
                setPassphrase("")
                setGeneralError("")
              }}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default App