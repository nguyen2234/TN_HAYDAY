import React, { useMemo } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { useTheme as useAppTheme } from '~/contexts/ThemeContext'
import { createTruyenMuiTheme } from '~theme/createMuiTheme'

interface MuiThemeProviderProps {
  children: React.ReactNode
}

export const MuiThemeProvider: React.FC<MuiThemeProviderProps> = ({ children }) => {
  const { theme: appMode } = useAppTheme()
  const muiTheme = useMemo(() => createTruyenMuiTheme(appMode), [appMode])

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  )
}
