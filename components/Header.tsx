import React from 'react'
import { Menu, Copy, Trash2, LogOut, User, Wallet, Check } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'

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
  walletType: 'sponsored' | 'external' | null
  deleteSponsorAddress: () => void
  connectWallet: () => void
  isLoggedIn: boolean
  handleGoogleLogin: () => void
  handleLogout: () => void
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
}) => {
  // Function to shorten wallet addresses for display
  const shortenAddress = (addr: string) => {
    if (!addr) return 'Not connected'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bloom Uploads</h1>

        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2"
          >
            <User className="h-5 w-5" />
            <span>{profileName || 'Profile'}</span>
          </Button>

          {showProfileMenu && (
            <DropdownMenu open={showProfileMenu} onOpenChange={setShowProfileMenu}>
              <DropdownMenuTrigger asChild>
                <span />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2">
                {!address && !isLoggedIn && (
                  <DropdownMenuItem onClick={handleGoogleLogin}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log In</span>
                  </DropdownMenuItem>
                )}
                {address && (
                  <>
                    <div className="px-3 py-2 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">Wallet Address:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-gray-600">{shortenAddress(address)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyAddress}
                            disabled={!address}
                            className="p-1"
                          >
                            {isAddressCopied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {savedSponsorAddress && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">Sponsor Address:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-gray-600">{shortenAddress(savedSponsorAddress)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={copySponsorAddress}
                              disabled={!savedSponsorAddress}
                              className="p-1"
                            >
                              {isSponsorAddressCopied ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    {walletType === 'sponsored' && (
                      <>
                        <DropdownMenuItem onClick={deleteProfile}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Profile</span>
                        </DropdownMenuItem>
                        {savedSponsorAddress && (
                          <DropdownMenuItem onClick={deleteSponsorAddress}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Remove Sponsor</span>
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    {walletType === 'external' && (
                      <DropdownMenuItem onClick={disconnectWallet}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Disconnect Wallet</span>
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {!address && (
                  <DropdownMenuItem onClick={connectWallet}>
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Connect Wallet</span>
                  </DropdownMenuItem>
                )}
                {isLoggedIn && (
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header