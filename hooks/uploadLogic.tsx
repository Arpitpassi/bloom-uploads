import { TurboAuthenticatedClient } from "@ardrive/turbo-sdk/web"

type UploadParams = {
  selectedFile: File
  wallet: any
  turbo: TurboAuthenticatedClient
  sponsorWalletAddress: string
  setUploadStatus: (status: string) => void
  setIsUploading: (isUploading: boolean) => void
  setUploadResult: (result: string) => void
  setErrorMessage: (message: string) => void
  animateTextContent: (text: string) => void
  toast: (options: any) => void
  validateArweaveAddress: (addr: string) => boolean
}

export const handleUpload = async (params: UploadParams) => {
  const {
    selectedFile, wallet, turbo, sponsorWalletAddress, setUploadStatus, setIsUploading,
    setUploadResult, setErrorMessage, animateTextContent, toast, validateArweaveAddress
  } = params

  if (!selectedFile) {
    toast({ title: "Error", description: "No file selected", variant: "destructive" })
    return
  }
  if (!wallet || !turbo) {
    const errorMsg = !wallet ? "No wallet connected" : "Turbo client not initialized"
    toast({ title: "Error", description: errorMsg, variant: "destructive" })
    return
  }
  if (sponsorWalletAddress && !validateArweaveAddress(sponsorWalletAddress)) {
    toast({ title: "Error", description: "Invalid sponsor wallet address. Must be a valid 43-character Arweave address.", variant: "destructive" })
    return
  }

  setIsUploading(true)
  setUploadStatus("Preparing upload...")
  animateTextContent(`Preparing upload...\nConnecting to Arweave network...\nSigning transaction...\nUploading to Arweave...`)

  try {
    const uploadOptions = {
      fileStreamFactory: () => selectedFile.stream(),
      fileSizeFactory: () => selectedFile.size,
      dataItemOpts: {
        tags: [
          { name: "App-Name", value: "TurboUploader" },
          { name: "anchor", value: new Date().toISOString() },
          { name: "Content-Type", value: selectedFile.type || "application/octet-stream" },
        ],
        ...(sponsorWalletAddress ? { paidBy: sponsorWalletAddress } : {}),
      },
      events: {
        onSigningProgress: () => setUploadStatus("Signing transaction..."),
        onSigningError: (error: Error) => {
          const errorMsg = `Signing error: ${error.message}`
          setUploadStatus(errorMsg)
          setErrorMessage(errorMsg)
          animateTextContent(errorMsg)
          setIsUploading(false)
          toast({ title: "Signing Error", description: error.message, variant: "destructive" })
        },
        onUploadProgress: () => setUploadStatus("Uploading to Arweave..."),
        onUploadError: (error: Error) => {
          let errorMsg = `Upload error: ${error.message}`
          if (error.message.includes("insufficient balance")) errorMsg = "Upload failed: Insufficient balance in wallet or sponsor wallet"
          else if (error.message.includes("network")) errorMsg = "Upload failed: Network connection issue. Please check your internet connection."
          setUploadStatus(errorMsg)
          setErrorMessage(errorMsg)
          animateTextContent(errorMsg)
          setIsUploading(false)
          toast({ title: "Upload Error", description: errorMsg, variant: "destructive" })
        },
      },
    }

    const upload = await turbo.uploadFile(uploadOptions)

    if (upload && upload.id) {
      const arweaveUrl = `https://arweave.net/${upload.id}`
      setUploadResult(arweaveUrl)
      setUploadStatus("Upload completed successfully!")
      setErrorMessage("")
      animateTextContent(`Upload completed successfully!\nTransaction ID: ${upload.id}`)
      toast({ title: "Success", description: "File uploaded successfully!" })
      setTimeout(() => setIsUploading(false), 1000)
    } else {
      const errorMsg = "Upload failed: No transaction ID received"
      setUploadStatus(errorMsg)
      setErrorMessage(errorMsg)
      animateTextContent(errorMsg)
      setIsUploading(false)
      toast({ title: "Error", description: errorMsg, variant: "destructive" })
    }
  } catch (error: any) {
    let errorMsg = `Upload failed: ${error.message}`
    if (error.message.includes("timeout") || error.message.includes("network")) errorMsg = "Upload failed: Network timeout or connection issue"
    else if (error.message.includes("invalid signature")) errorMsg = "Upload failed: Invalid transaction signature"
    else if (error.message.includes("balance")) errorMsg = "Upload failed: Insufficient balance in wallet or sponsor wallet"
    setUploadStatus(errorMsg)
    setErrorMessage(errorMsg)
    animateTextContent(errorMsg)
    setIsUploading(false)
    toast({ title: "Upload Failed", description: errorMsg, variant: "destructive" })
  }
}