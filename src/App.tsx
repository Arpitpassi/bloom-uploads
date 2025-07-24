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
import { useToast } from "../hooks/use-toast"

TurboFactory.setLogLevel("debug")

const arweave = new Arweave({
  host: "arweave.net",
  port: 443,
  protocol: "https",
})

const App = () => {
  const { toast } = useToast()
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
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [isAppInstalled, setIsAppInstalled] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope)
          if (registration.active) {
            console.log('Service Worker is active')
          } else {
            console.log('Service Worker is not active yet')
          }
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error)
          setGeneralError('Failed to register service worker. PWA installation may not work.')
          toast({
            title: "Service Worker Error",
            description: "Failed to register service worker. PWA installation may not work.",
            variant: "destructive",
          })
        })
    } else {
      console.warn('Service Worker not supported in this browser')
      setGeneralError('Service Worker not supported. PWA installation is unavailable.')
      toast({
        title: "Service Worker Error",
        description: "Service Worker not supported. PWA installation is unavailable.",
        variant: "destructive",
      })
    }
  }, [setGeneralError, toast])

  // PWA install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired')
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
      // Verify manifest and service worker status
      fetch('/manifest.json')
        .then(response => {
          if (!response.ok) {
            console.error('Manifest fetch failed:', response.statusText)
            setGeneralError('Failed to load manifest.json')
            toast({
              title: "PWA Error",
              description: "Failed to load manifest.json",
              variant: "destructive",
            })
          } else {
            console.log('Manifest fetched successfully')
          }
        })
        .catch(error => {
          console.error('Error fetching manifest:', error)
          setGeneralError('Error accessing manifest.json')
          toast({
            title: "PWA Error",
            description: "Error accessing manifest.json",
            variant: "destructive",
          })
        })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      console.log('App installed')
      setIsAppInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    })

    // Debug PWA eligibility
    if (!navigator.serviceWorker) {
      console.warn('Service Worker API not available')
      setGeneralError('Service Worker API not available')
      toast({
        title: "PWA Error",
        description: "Service Worker API not available",
        variant: "destructive",
      })
    }
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('PWA requires secure context (HTTPS or localhost)')
      setGeneralError('PWA requires secure context (HTTPS or localhost)')
      toast({
        title: "PWA Error",
        description: "PWA requires secure context (HTTPS or localhost)",
        variant: "destructive",
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', () => {})
    }
  }, [setGeneralError, toast])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

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
              toast({
                title: "Wallet Error",
                description: "Failed to decrypt wallet. Please try logging in again.",
                variant: "destructive",
              })
              handleLogout()
            })
        } else {
          setGeneralError("Profile belongs to a different Google account. Please log in with the correct account.")
          toast({
            title: "Profile Error",
            description: "Profile belongs to a different Google account. Please log in with the correct account.",
            variant: "destructive",
          })
          handleLogout()
        }
      } else {
        setShowProfileCreation(true)
      }
    }
  }, [isLoggedIn, userId, setProfileName, setSavedSponsorAddress, setSponsorWalletAddress, setWalletType, setHasSponsoredWallet, toast])

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
    toast({
      title: "Login Error",
      description: "Google login failed",
      variant: "destructive",
    })
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
      toast({
        title: "Profile Creation Error",
        description: "Please enter a profile name",
        variant: "destructive",
      })
      return
    }
    if (!isLoggedIn || !userId) {
      setGeneralError("Please log in with Google first")
      toast({
        title: "Profile Creation Error",
        description: "Please log in with Google first",
        variant: "destructive",
      })
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
      toast({
        title: "Profile Created",
        description: `Profile "${name}" created successfully`,
      })
    } catch (error: any) {
      setGeneralError(error.message || "Failed to generate wallet")
      toast({
        title: "Profile Creation Error",
        description: error.message || "Failed to generate wallet",
        variant: "destructive",
      })
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
      toast({
        title: "Wallet Error",
        description: error.message || "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.error('No deferred prompt available')
      setGeneralError('Installation prompt not available. Ensure manifest and service worker are correctly configured.')
      toast({
        title: "PWA Installation Error",
        description: "Installation prompt not available. Ensure manifest and service worker are correctly configured.",
        variant: "destructive",
      })
      return
    }
    try {
      console.log('Triggering install prompt')
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('Install prompt outcome:', outcome)
      if (outcome === 'accepted') {
        setIsAppInstalled(true)
        setShowInstallPrompt(false)
        console.log('PWA installation accepted')
        toast({
          title: "App Installed",
          description: "Bloom Uploads has been installed successfully!",
        })
      } else {
        console.log('PWA installation dismissed')
        toast({
          title: "Installation Cancelled",
          description: "App installation was cancelled.",
        })
      }
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error triggering install prompt:', error)
      setGeneralError('Failed to trigger installation prompt. Please try again.')
      toast({
        title: "PWA Installation Error",
        description: "Failed to trigger installation prompt. Please try again.",
        variant: "destructive",
      })
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
        {isOffline && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-yellow-700">You are offline. Some features may be unavailable.</span>
            </div>
          </div>
        )}
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
        connectWallet={connectWallet}
        isLoggedIn={isLoggedIn}
        handleGoogleLogin={() => setShowLoginModal(true)}
        handleLogout={handleLogout}
        handleInstallClick={handleInstallClick}
        isAppInstalled={isAppInstalled}
        isMobile={isMobile}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mainContent}
      </main>

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