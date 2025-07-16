import React from 'react'
import { Zap, Check, Copy, LogOut, Trash2 } from 'lucide-react'

interface HeaderProps {
  profileName: string
  address: string
  showProfileMenu: boolean
  setShowProfileMenu: (value: boolean) => void
  deleteProfile: () => void
  disconnectWallet: () => void
  copyAddress: () => void
  copySponsorAddress: () => void
  isAddressCopied: boolean
  isSponsorAddressCopied: boolean
  savedSponsorAddress: string
  walletType: "sponsored" | "external" | null
  deleteSponsorAddress: () => void
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
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Bloom Uploads</h1>
              <p className="text-sm text-gray-500">Powered by Turbo</p>
            </div>
          </div>

          {profileName && (
            <div className="relative">
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
                        <div className="bg-gray-50 rounded-md p-2 break-all flex items-center justify-between">
                          <p className="text-xs font-mono text-gray-700">{address}</p>
                          <button
                            onClick={copyAddress}
                            className="rounded-md bg-gray-100 p-1 text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            {isAddressCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {savedSponsorAddress && walletType === "sponsored" && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-2">Sponsor Wallet:</p>
                        <div className="bg-gray-50 rounded-md p-2 break-all flex items-center justify-between">
                          <p className="text-xs font-mono text-gray-700">{savedSponsorAddress}</p>
                          <button
                            onClick={copySponsorAddress}
                            className="rounded-md bg-gray-100 p-1 text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            {isSponsorAddressCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-2">
                    {walletType === "external" && (
                      <button
                        onClick={() => {
                          disconnectWallet()
                          setShowProfileMenu(false)
                        }}
                        className="w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Disconnect Wallet</span>
                      </button>
                    )}

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

                    {savedSponsorAddress && walletType === "sponsored" && (
                      <button
                        onClick={deleteSponsorAddress}
                        className="w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove Sponsor Wallet</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header