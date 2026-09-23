import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'TN_HAYDAY_THEME'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('TRUYENSS_THEME')) as Theme
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    return 'dark'
  })

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    // Cập nhật attribute của bootstrap để nó tự đổi theme các thẻ cơ bản
    document.documentElement.setAttribute('data-bs-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
