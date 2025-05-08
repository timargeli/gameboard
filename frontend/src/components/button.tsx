import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
  variant?: 'default' | 'delete'
  disabled?: boolean
  background?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  disabled = false,
  background = '',
  ...props
}) => (
  <button
    style={{
      background:
        background ||
        (disabled
          ? variant === 'delete'
            ? '#f8bbbb'
            : '#ffe066'
          : variant === 'delete'
          ? '#e53935'
          : '#ffd700'),
      color: disabled ? '#aaa' : variant === 'delete' || background ? '#fff' : '#333',
      border: '2px solid #fff',
      borderRadius: 12,
      padding: '12px 32px',
      fontFamily: 'Montserrat, Arial, sans-serif',
      fontWeight: 700,
      fontSize: 20,
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      transition: 'background 0.2s',
      opacity: disabled ? 0.6 : 1,
    }}
    {...props}
  >
    {children}
  </button>
)
