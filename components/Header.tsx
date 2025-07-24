"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LogOut, User, Wallet, Check, Copy, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card" // Import Card components

interface HeaderProps {
  profileName: string
  address: string
  showProfileMenu: boolean
  setShowProfileMenu: (show: boolean) => void
  deleteProfile: () => void
  disconnectWallet: () => void
  copyAddress: () => void
  copySponsorAddress: () => void
  isAddressCopied: boolean
  isSponsorAddressCopied: boolean
  savedSponsorAddress: string
  walletType: "sponsored" | "external" | null
  deleteSponsorAddress: () => void
  connectWallet: () => void
  isLoggedIn: boolean
  handleGoogleLogin: () => void
  handleLogout: () => void
  isMobile: boolean
}

// Toast component for reusable toast UI
const Toast = ({ message, show, type }: { message: string; show: boolean; type: "success" | "error" }) => {
  const bgColorClass = type === "success" ? "bg-pear" : "bg-burntSienna"
  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColorClass} text-white text-sm font-medium py-2 px-4 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <Check className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}

const Header: React.FC<HeaderProps> = ({
  profileName,
  address,
  showProfileMenu,
  setShowProfileMenu,
  deleteProfile,
  disconnectWallet,
  copyAddress,
  copySponsorAddress,
  isAddressCopied,
  isSponsorAddressCopied,
  savedSponsorAddress,
  walletType,
  deleteSponsorAddress,
  connectWallet,
  isLoggedIn,
  handleGoogleLogin,
  handleLogout,
  isMobile,
}) => {
  const [showAddressToast, setShowAddressToast] = useState(false)
  const [showSponsorToast, setShowSponsorToast] = useState(false)
  const [showDeleteProfileToast, setShowDeleteProfileToast] = useState(false)
  const [showDeleteSponsorToast, setShowDeleteSponsorToast] = useState(false)
  const [showDisconnectToast, setShowDisconnectToast] = useState(false)
  const [showLoginToast, setShowLoginToast] = useState(false)
  const [showLogoutToast, setShowLogoutToast] = useState(false)
  const [showConnectToast, setShowConnectToast] = useState(false)

  // Handle toast notifications
  useEffect(() => {
    if (isAddressCopied) {
      setShowAddressToast(true)
      const timer = setTimeout(() => setShowAddressToast(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isAddressCopied])

  useEffect(() => {
    if (isSponsorAddressCopied) {
      setShowSponsorToast(true)
      const timer = setTimeout(() => setShowSponsorToast(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isSponsorAddressCopied])

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    copyAddress()
  }

  const handleCopySponsorAddress = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    copySponsorAddress()
  }

  const handleDeleteProfile = () => {
    deleteProfile()
    setShowDeleteProfileToast(true)
    setTimeout(() => setShowDeleteProfileToast(false), 2000)
  }

  const handleDeleteSponsorAddress = () => {
    deleteSponsorAddress()
    setShowDeleteSponsorToast(true)
    setTimeout(() => setShowDeleteSponsorToast(false), 2000)
  }

  const handleDisconnectWallet = () => {
    disconnectWallet()
    setShowDisconnectToast(true)
    setTimeout(() => setShowDisconnectToast(false), 2000)
  }

  const handleGoogleLoginClick = () => {
    handleGoogleLogin()
    setShowLoginToast(true)
    setTimeout(() => setShowLoginToast(false), 2000)
  }

  const handleLogoutClick = () => {
    handleLogout()
    setShowLogoutToast(true)
    setTimeout(() => setShowLogoutToast(false), 2000)
  }

  const handleConnectWallet = () => {
    connectWallet()
    setShowConnectToast(true)
    setTimeout(() => setShowConnectToast(false), 2000)
  }

  const MenuItem = ({
    onClick,
    icon: Icon,
    children,
    className = "",
  }: {
    onClick: () => void
    icon: React.ComponentType<{ className?: string }>
    children: React.ReactNode
    className?: string
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 ${className}`}
    >
      <Icon className="h-5 w-5 text-gray-500" />
      <span className="text-sm font-medium text-gray-700">{children}</span>
    </button>
  )

  return (
    <>
      <header className="bg-white border-b border-gray-100 py-3 shadow-sm relative z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/placeholder-user.png" alt="Bloom Uploads Logo" className="h-5" />
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-full px-2 py-1 transition-all duration-200"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                <AvatarFallback className="text-sm">{profileName?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">{profileName || "User"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Dropdown Menu */}
      {showProfileMenu && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-10 z-40 transition-opacity duration-300"
            onClick={() => setShowProfileMenu(false)}
          />
          <div className="absolute top-16 right-4 w-80 bg-white shadow-2xl rounded-lg z-50 transition-all duration-300 ease-in-out">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            </div>

            {/* Menu Content */}
            <div className="flex flex-col max-h-[70vh] overflow-y-auto relative">
              {/* Profile Section */}
              {address && (
                <div className="p-4 border-b border-gray-100">
                  <Card className="bg-gray-50 shadow-none border-none">
                    <CardHeader className="p-3 pb-0">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                          <AvatarFallback className="text-lg">{profileName?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold text-gray-900">
                            {profileName || "User"}
                          </CardTitle>
                          <CardDescription className="text-xs font-mono text-gray-500 break-all select-text mt-1">
                            {address || "Not connected"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      {/* Copy Address Button */}
                      <Button
                        onClick={handleCopyAddress}
                        disabled={!address}
                        variant="outline"
                        className="w-full mt-3 text-sm flex items-center justify-center space-x-2 bg-transparent"
                      >
                        <Copy className="h-4 w-4 text-gray-500" />
                        <span>Copy Address</span>
                      </Button>

                      {/* Sponsor Address Section */}
                      {savedSponsorAddress && (
                        <Card className="mt-4 bg-blue-50 shadow-none border-blue-200">
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Sponsor Address:</span>
                                <p className="text-xs font-mono text-gray-600 break-all select-text mt-1">
                                  {savedSponsorAddress}
                                </p>
                              </div>
                              <Button
                                onClick={handleCopySponsorAddress}
                                disabled={!savedSponsorAddress}
                                variant="outline"
                                className="w-full text-sm flex items-center justify-center space-x-2 bg-white"
                              >
                                <Copy className="h-4 w-4 text-gray-500" />
                                <span>Copy Sponsor</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Menu Items */}
              <div className="flex-1">
                {!address && !isLoggedIn && (
                  <MenuItem onClick={handleGoogleLoginClick} icon={User}>
                    Log In with Google
                  </MenuItem>
                )}

                {!address && !isMobile && (
                  <MenuItem onClick={handleConnectWallet} icon={Wallet}>
                    Connect Wallet
                  </MenuItem>
                )}

                {address && walletType === "sponsored" && (
                  <>
                    <MenuItem onClick={handleDeleteProfile} icon={Trash2}>
                      Delete Profile
                    </MenuItem>
                    {savedSponsorAddress && (
                      <MenuItem onClick={handleDeleteSponsorAddress} icon={Trash2}>
                        Remove Sponsor
                      </MenuItem>
                    )}
                  </>
                )}

                {address && walletType === "external" && (
                  <MenuItem onClick={handleDisconnectWallet} icon={LogOut}>
                    Disconnect Wallet
                  </MenuItem>
                )}

                {isLoggedIn && (
                  <MenuItem onClick={handleLogoutClick} icon={LogOut}>
                    Log Out
                  </MenuItem>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <Toast show={showAddressToast} message="Address Copied!" type="success" />
        <Toast show={showSponsorToast} message="Sponsor Address Copied!" type="success" />
        <Toast show={showDeleteProfileToast} message="Profile Deleted!" type="error" />
        <Toast show={showDeleteSponsorToast} message="Sponsor Removed!" type="error" />
        <Toast show={showDisconnectToast} message="Wallet Disconnected!" type="error" />
        <Toast show={showLoginToast} message="Logging In..." type="success" />
        <Toast show={showLogoutToast} message="Logged Out!" type="success" />
        <Toast show={showConnectToast} message="Connecting Wallet..." type="success" />
      </div>
    </>
  )
}

export default Header
