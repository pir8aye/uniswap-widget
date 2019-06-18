import React from 'react'
import styled from 'styled-components'

import ThemeProvider, { GlobalStyle } from './theme'
import Widget from './Widget'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: lightgray;
`

export default function App() {
  return (
    <ThemeProvider>
      <>
        <GlobalStyle />
        <Root>
          <Widget />
        </Root>
      </>
    </ThemeProvider>
  )
}
