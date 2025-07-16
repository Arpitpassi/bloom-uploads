import React from 'react'
import { X, Upload, AlertCircle, Loader2 } from 'lucide-react'

interface SponsorInputModalProps {
  onClose: () => void
  onSubmit: (address: string) => void
  error: string
  sponsorWalletAddress: string
  setSponsorWalletAddress: (address: string) => void
}

const SponsorInputModal: React.FC<SponsorInputModalProps> = ({
  onClose,
  onSubmit,
  error,
  sponsorWalletAddress,
  setSponsorWalletAddress,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Sponsor Wallet</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="sponsorAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Sponsor Wallet Address (Optional)
            </label>
            <input
              id="sponsorAddress"
              type="text"
              placeholder="Enter sponsor wallet address"
              value={sponsorWalletAddress}
              onChange={(e) => setSponsorWalletAddress(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => onSubmit(sponsorWalletAddress)}
              className="flex-1 inline-flex items-center justify-center space-x-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Continue Upload</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SponsorInputModal