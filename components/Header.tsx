"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { LogOut, User, Wallet, Check, Copy, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"

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

// Improved Toast component with proper stacking and colors
const Toast = ({ 
  message, 
  show, 
  type, 
  index = 0 
}: { 
  message: string
  show: boolean
  type: "success" | "error"
  index?: number
}) => {
  const bgColorClass = type === "success" 
    ? "bg-green-500 border-green-600" 
    : "bg-red-500 border-red-600"
  
  return (
    <div
      className={`
        fixed right-4 bg-white border-2 ${bgColorClass} text-white text-sm font-medium 
        py-3 px-4 rounded-lg shadow-lg flex items-center space-x-2 
        transition-all duration-300 ease-in-out z-50
        ${show 
          ? "opacity-100 translate-x-0" 
          : "opacity-0 translate-x-full pointer-events-none"
        }
      `}
      style={{
        bottom: `${16 + (index * 60)}px`, // Stack toasts vertically
      }}
    >
      <div className={`w-2 h-2 rounded-full ${type === "success" ? "bg-green-200" : "bg-red-200"}`} />
      <span className="text-white font-medium">{message}</span>
    </div>
  )
}

// Toast manager for handling multiple toasts
const ToastManager = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: "success" | "error"
    show: boolean
  }>>([])

  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now().toString()
    const newToast = { id, message, type, show: true }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => 
        prev.map(toast => 
          toast.id === id ? { ...toast, show: false } : toast
        )
      )
      
      // Remove from array after animation
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, 300)
    }, 3000)
  }

  // Expose addToast function globally for use in header
  useEffect(() => {
    (window as any).headerToast = addToast
    return () => {
      delete (window as any).headerToast
    }
  }, [])

  return (
    <>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          show={toast.show}
          type={toast.type}
          index={index}
        />
      ))}
    </>
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
  const showToast = (message: string, type: "success" | "error") => {
    if ((window as any).headerToast) {
      (window as any).headerToast(message, type)
    }
  }

  // Handle toast notifications with improved UX
  useEffect(() => {
    if (isAddressCopied) {
      showToast("Address Copied!", "success")
    }
  }, [isAddressCopied])

  useEffect(() => {
    if (isSponsorAddressCopied) {
      showToast("Sponsor Address Copied!", "success")
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
    showToast("Profile Deleted!", "error")
    setShowProfileMenu(false)
  }

  const handleDeleteSponsorAddress = () => {
    deleteSponsorAddress()
    showToast("Sponsor Removed!", "error")
  }

  const handleDisconnectWallet = () => {
    disconnectWallet()
    showToast("Wallet Disconnected!", "error")
    setShowProfileMenu(false)
  }

  const handleGoogleLoginClick = () => {
    handleGoogleLogin()
    showToast("Logging In...", "success")
    setShowProfileMenu(false)
  }

  const handleLogoutClick = () => {
    handleLogout()
    showToast("Logged Out!", "success")
    setShowProfileMenu(false)
  }

  const handleConnectWallet = () => {
    connectWallet()
    setShowProfileMenu(false)
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
      <ToastManager />
      
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
    </>
  )
}

export default Header