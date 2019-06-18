import React from 'react'
import styled from 'styled-components'

const Section = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${({ centered }) => (centered ? 'center' : 'space-between')};
  width: 100%;
`

const WidgetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 50%;
  max-width: 40rem;
  padding: 2rem;
  background-color: white;
  border-radius: 2rem;

  ${Section}:not(:last-child) {
    margin-bottom: 2rem;
  }
`

const P = styled.p`
  margin: 0;
`

export default function Widget() {
  return (
    <WidgetWrapper>
      <Section>
        <P>Hello, world.</P>
      </Section>
    </WidgetWrapper>
  )
}
