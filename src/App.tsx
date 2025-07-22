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

  const fileInputRef = useRef<HTMLInputElement>(null)

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
        deleteProfile={deleteProfile}
        disconnectWallet={disconnectWallet}
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
          onCreateSponsored={generateRandomJwk}
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
          onCreate={handleProfileCreation}
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
          onSubmit={(address: React.SetStateAction<string>) => {
            setSponsorWalletAddress(address)
            setShowSponsorInput(false)
            handleUpload()
          }}
          error={generalError}
          sponsorWalletAddress={sponsorWalletAddress}
          setSponsorWalletAddress={setSponsorWalletAddress}
        />
      )}
    </div>
  )
}

export default App