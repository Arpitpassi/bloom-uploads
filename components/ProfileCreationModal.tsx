import React from 'react'
import { X, AlertCircle, Loader2 } from 'lucide-react'
import { Input } from "./ui/input"

interface ProfileCreationModalProps {
  onClose: () => void
  onCreate: (name: string) => void
  isCreating: boolean
  error: string
  profileName: string
  setProfileName: (name: string) => void
}

const ProfileCreationModal: React.FC<ProfileCreationModalProps> = ({
  onClose,
  onCreate,
  isCreating,
  error,
  profileName,
  setProfileName,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Create Profile</h3>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="rounded-lg p-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
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

          {isCreating ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-8 w-8 text-gray-600 animate-spin" />
              <p className="text-sm font-medium text-gray-700">Creating Profile...</p>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Name
                </label>
                <input
                  id="profileName"
                  type="text"
                  placeholder="Enter your name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  disabled={isCreating}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => onCreate(profileName)}
                  disabled={isCreating}
                  className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Profile
                </button>
                <button
                  onClick={onClose}
                  disabled={isCreating}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileCreationModal