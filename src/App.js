import React from 'react'

import ThemeProvider, { GlobalStyle } from './theme'
import ApplicationProvider from './contexts/Application'
import Widget from './Widget'

export default function App() {
  return (
    <ThemeProvider>
      <>
        <GlobalStyle />
        <ApplicationProvider>
          <Widget />
        </ApplicationProvider>
      </>
    </ThemeProvider>
  )
}
