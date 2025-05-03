import React, { useState, useEffect } from 'react'

export const BASE_SIZE = 96

export const translateColor = (color: string) => {
  switch (color) {
    case 'blue':
      return '#2563eb'
    case 'green':
      return '#16a34a'
    case 'yellow':
      return '#facc15'
    case 'pink':
      return '#ec4899'
    default:
      return 'black'
  }
}

const BASE_DOMINO_SIZE = 96

export const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
