interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  name?: string
  required?: boolean
  className?: string
  label?: string
}

export function Input({ type = 'text', placeholder, value, onChange, name, required = false, className = '', label }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      />
    </div>
  )
}