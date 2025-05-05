import React, { useState, useEffect } from 'react'
import { DefaultColors } from '../../types'

export const BASE_SIZE = 96

export const translateColor = (color: string) => {
  switch (color) {
    case 'blue':
      return DefaultColors.BLUE
    case 'green':
      return DefaultColors.GREEN
    case 'yellow':
      return DefaultColors.YELLOW
    case 'pink':
      return DefaultColors.PINK
    case 'brown':
      return DefaultColors.BROWN
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
