import React from 'react'

type DropdownProps = {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      padding: '10px 16px',
      borderRadius: 8,
      border: '2px solid #fff',
      fontSize: 18,
      fontFamily: 'Montserrat, Arial, sans-serif',
      background: '#fff',
      color: '#333',
      fontWeight: 600,
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      outline: 'none',
    }}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
)
