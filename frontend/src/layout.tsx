import React from 'react'

const layoutStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f5e1b7',
  backgroundImage: 'url("/wood-texture.png")',
  backgroundRepeat: 'repeat',
  backgroundSize: 'auto',
  display: 'flex',
}

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div style={layoutStyle}>{children}</div>
)
