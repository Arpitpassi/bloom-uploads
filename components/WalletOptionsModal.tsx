import React from 'react'
import { X, Wallet, Globe, AlertCircle } from 'lucide-react'

interface WalletOptionsModalProps {
  onClose: () => void
  onCreateSponsored: () => void
  onConnectExternal: () => void
  error: string
  isMobile: boolean
  hasSponsoredWallet: boolean
}

const WalletOptionsModal: React.FC<WalletOptionsModalProps> = ({
  onClose,
  onCreateSponsored,
  onConnectExternal,
  error,
  isMobile,
  hasSponsoredWallet,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Connect Wallet</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onCreateSponsored}
            className="w-full flex items-center justify-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Wallet className="h-4 w-4" />
            <span>Create Sponsored Wallet</span>
          </button>

          {!isMobile && !hasSponsoredWallet && (
            <button
              onClick={onConnectExternal}
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>Connect External Wallet</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default WalletOptionsModal