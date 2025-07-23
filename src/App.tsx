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
import { Checkbox } from "../components/ui/checkbox"
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
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check for stored token on app load to restore login
  useEffect(() => {
    const storedToken = localStorage.getItem("googleAuthToken")
    if (storedToken) {
      try {
        const decoded = JSON.parse(atob(storedToken.split('.')[1]))
        const now = Math.floor(Date.now() / 1000)
        if (decoded.exp > now) {
          setIsLoggedIn(true)
          setUserId(decoded.sub)
        } else {
          localStorage.removeItem("googleAuthToken")
        }
      } catch (error) {
        localStorage.removeItem("googleAuthToken")
      }
    }
  }, [])

  // Load or create profile on Google login
  useEffect(() => {
    if (isLoggedIn && userId) {
      const savedProfile = localStorage.getItem("turboUploaderProfile")
      if (savedProfile) {
        const profile = JSON.parse(savedProfile)
        if (profile.userId === userId) {
          // Decrypt existing wallet
          decryptJWK(profile.encryptedJWK, profile.salt, profile.iv, userId)
            .then((jwk) => {
              setUnlockedWallet(jwk)
              setProfileName(profile.name)
              setSavedSponsorAddress(profile.sponsorAddress || "")
              setSponsorWalletAddress(profile.sponsorAddress || "")
              setWalletType("sponsored")
              setHasSponsoredWallet(true)
            })
            .catch(() => {
              setGeneralError("Failed to decrypt wallet. Please try logging in again.")
              handleLogout()
            })
        } else {
          setGeneralError("Profile belongs to a different Google account. Please log in with the correct account.")
          handleLogout()
        }
      } else {
        // Automatically open profile creation for new users
        setShowProfileCreation(true)
      }
    }
  }, [isLoggedIn, userId, setProfileName, setSavedSponsorAddress, setSponsorWalletAddress, setWalletType, setHasSponsoredWallet])

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
    if (keepLoggedIn) {
      localStorage.setItem("googleAuthToken", token)
    }
    setShowLoginModal(false)
  }

  const handleGoogleFailure = () => {
    setGeneralError("Google login failed")
    setShowLoginModal(false)
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
    setProfileName("")
    setSavedSponsorAddress("")
    setSponsorWalletAddress("")
    localStorage.removeItem("googleAuthToken")
  }

  const modifiedGenerateRandomJwk = async () => {
    setShowWalletOptions(false)
    setShowLoginModal(true)
  }

  const modifiedHandleProfileCreation = async (name: string) => {
    if (!name) {
      setGeneralError("Please enter a profile name")
      return
    }
    if (!isLoggedIn || !userId) {
      setGeneralError("Please log in with Google first")
      return
    }
    setIsCreatingProfile(true)
    try {
      const jwk = await arweave.wallets.generate()
      const { encryptedData, salt, iv } = await encryptJWK(jwk, userId)
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
      setGeneralError("")
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
  if (isUploading) {
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
        isLoggedIn={isLoggedIn}
        handleGoogleLogin={() => setShowLoginModal(true)}
        handleLogout={handleLogout}
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
          }}
          onCreate={modifiedHandleProfileCreation}
          isCreating={isCreatingProfile}
          error={generalError}
          profileName={profileName}
          setProfileName={setProfileName}
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

      {showLoginModal && (
        <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log in to Create Sponsored Wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {generalError && (
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>{generalError}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="keepLoggedIn"
                  checked={keepLoggedIn}
                  onCheckedChange={(checked: boolean) => setKeepLoggedIn(checked)}
                />
                <label htmlFor="keepLoggedIn" className="text-sm font-medium text-gray-700">
                  Keep me logged in
                </label>
              </div>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                text="signin"
                shape="pill"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowLoginModal(false)
                  setGeneralError("")
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default App