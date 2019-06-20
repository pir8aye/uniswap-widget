import React from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import { formatFixed } from '@uniswap/sdk'

import { useBlockNumber, useUSDPrice } from '../hooks'
import Price from './Price'
import { USD, ETH, useNightMode, useSelectedCurrency } from '../contexts/Application'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: lightgray;
`

export const Section = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${({ centered }) => (centered ? 'center' : 'space-between')};
  width: 100%;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 50%;
  max-width: 40rem;
  height: 20rem;
  background-color: ${({ isNightMode }) => (isNightMode ? 'black' : 'white')};
  color: ${({ isNightMode }) => (isNightMode ? 'white' : 'black')};
  padding: 2rem;
  border-radius: 2rem;

  ${Section}:not(:last-child) {
    margin-bottom: 2rem;
  }
`

const Indicator = styled.span`
  color: ${({ error, connected }) => (error ? 'red' : connected ? 'green' : 'yellow')};
`

const PROVIDER = ethers.getDefaultProvider()

const SelectedCurrencyWrapper = styled.div`
  display: inline;
`

const SelectedCurrencySpan = styled.span`
  cursor: pointer;
  font-weight: ${({ selected }) => (selected ? 600 : 'initial')};
`

export default function Widget() {
  const [isNightMode, toggleNightMode] = useNightMode()
  const [selectedCurrency, toggleSelectedCurrency] = useSelectedCurrency()
  const blockNumber = useBlockNumber(PROVIDER)
  const [ethPrice, stablecoinWeights] = useUSDPrice(PROVIDER, blockNumber)

  return (
    <Root isNightMode={isNightMode}>
      <Wrapper isNightMode={isNightMode}>
        <Section>
          <div>
            Night Mode{' '}
            <input
              type="checkbox"
              onClick={() => {
                toggleNightMode()
              }}
            />
          </div>

          <SelectedCurrencyWrapper>
            <SelectedCurrencySpan
              selected={selectedCurrency === ETH}
              onClick={() => {
                selectedCurrency !== ETH && toggleSelectedCurrency()
              }}
            >
              ETH
            </SelectedCurrencySpan>
            /
            <SelectedCurrencySpan
              selected={selectedCurrency === USD}
              onClick={() => {
                selectedCurrency !== USD && toggleSelectedCurrency()
              }}
            >
              USD
            </SelectedCurrencySpan>
          </SelectedCurrencyWrapper>
        </Section>
        <Section></Section>
        <Section>
          <span role="img" aria-label="unicorn">
            🦄Price
          </span>
          <Indicator error={blockNumber === null} connected={Number.isInteger(blockNumber)}>
            {blockNumber &&
              formatFixed(blockNumber, { decimalPlaces: 0, format: { groupSeparator: ',', groupSize: 3 } })}{' '}
            ▣
          </Indicator>
        </Section>
        <Price provider={PROVIDER} ethPrice={ethPrice} stablecoinWeights={stablecoinWeights} />
      </Wrapper>
    </Root>
  )
}
