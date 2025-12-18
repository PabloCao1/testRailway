import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className={`relative bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] sm:max-h-[85vh] flex flex-col`}>
          <div className="flex items-center justify-between p-4 sm:p-5 border-b flex-shrink-0">
            <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <div className="p-4 sm:p-5 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}
