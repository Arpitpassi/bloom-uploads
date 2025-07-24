import React from 'react'
import { LogOut, User, Wallet, Check, Copy, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'

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
  const shortenAddress = (addr: string) => {
    if (!addr) return 'Not connected'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <header className="bg-white border-b border-gray-100 py-3 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/placeholder-user.png" alt="Bloom Uploads Logo" className="h-5" />
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-2 transition-all duration-200"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
              <AvatarFallback>{profileName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{profileName || 'Profile'}</span>
          </Button>

          {showProfileMenu && (
            <DropdownMenu open={showProfileMenu} onOpenChange={setShowProfileMenu}>
              <DropdownMenuTrigger asChild>
                <span />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 p-4 bg-white shadow-lg rounded-lg border border-gray-100 mt-2">
                {!address && !isLoggedIn && (
                  <DropdownMenuItem onClick={handleGoogleLogin} className="px-3 py-2 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log In with Google</span>
                  </DropdownMenuItem>
                )}
                {address && (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                        <AvatarFallback>{profileName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{profileName || 'User'}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-mono text-gray-500">{shortenAddress(address)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyAddress}
                            disabled={!address}
                            className="p-1 hover:bg-gray-100"
                          >
                            {isAddressCopied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    {savedSponsorAddress && (
                      <div className="px-3 py-2 text-sm">
                        <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2">
                          <span className="font-medium text-gray-700">Sponsor:</span>
                          <span className="font-mono text-gray-600 truncate">{shortenAddress(savedSponsorAddress)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copySponsorAddress}
                            disabled={!savedSponsorAddress}
                            className="p-1 hover:bg-gray-100"
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
                    <DropdownMenuSeparator className="my-2" />
                    {walletType === 'sponsored' && (
                      <>
                        <DropdownMenuItem onClick={deleteProfile} className="px-3 py-2 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Profile</span>
                        </DropdownMenuItem>
                        {savedSponsorAddress && (
                          <DropdownMenuItem onClick={deleteSponsorAddress} className="px-3 py-2 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Remove Sponsor</span>
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    {walletType === 'external' && (
                      <DropdownMenuItem onClick={disconnectWallet} className="px-3 py-2 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Disconnect Wallet</span>
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {!address && (
                  <DropdownMenuItem onClick={connectWallet} className="px-3 py-2 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700">
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Connect Wallet</span>
                  </DropdownMenuItem>
                )}
                {isLoggedIn && (
                  <DropdownMenuItem onClick={handleLogout} className="px-3 py-2 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700">
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