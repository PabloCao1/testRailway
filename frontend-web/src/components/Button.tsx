import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
}

export function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}