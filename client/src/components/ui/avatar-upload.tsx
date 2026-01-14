'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, X, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
  currentAvatar?: string | null
  onAvatarChange: (file: File | null, previewUrl: string | null) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
}

export function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  disabled = false,
  size = 'lg',
  className,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update previewUrl when currentAvatar changes (e.g., after fetching profile)
  useEffect(() => {
    setPreviewUrl(currentAvatar || null)
  }, [currentAvatar])

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB')
      return
    }

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPreviewUrl(result)
      onAvatarChange(file, result)
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onAvatarChange(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Avatar Preview */}
      <div
        className={cn(
          'relative rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100',
          sizeClasses[size],
          isDragging && 'border-blue-400 border-dashed',
          !disabled && 'cursor-pointer hover:border-blue-400 transition-all',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center">
                <Camera className="text-white opacity-0 hover:opacity-100 transition-opacity" size={24} />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <UserIcon className="text-gray-400" size={size === 'xl' ? 64 : size === 'lg' ? 48 : size === 'md' ? 32 : 24} />
          </div>
        )}

        {/* Remove button */}
        {previewUrl && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleRemove()
            }}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload button */}
      {!disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          className="gap-2"
        >
          <Upload size={16} />
          {previewUrl ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
        </Button>
      )}

      {/* Instructions */}
      <p className="text-xs text-gray-500 text-center">
        {!disabled ? (
          <>
            Nhấn hoặc kéo thả ảnh vào đây
            <br />
            (Tối đa 5MB, định dạng JPG, PNG)
          </>
        ) : (
          'Không thể chỉnh sửa'
        )}
      </p>
    </div>
  )
}
