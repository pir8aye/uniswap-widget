import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { getTokenReserves, getMarketDetails, formatFixed, formatSignificant } from '@uniswap/sdk'

import { Section } from '..'
import { useSelectedCurrency, ETH } from '../../contexts/Application'
import { isAddress } from '../../utils'

const P = styled.p`
  margin: 0;
`

const format = { decimalSeparator: '.', groupSeparator: ',', groupSize: 3 }

export default function Price({ provider, ethPrice, stablecoinWeights }) {
  const [selectedCurrency] = useSelectedCurrency()

  const [tokenAddress, setTokenAddress] = useState('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2') // MKR
  const [tokenMarketDetails, setTokenMarketDetails] = useState()
  const [tokenError, setTokenError] = useState()

  useEffect(() => {
    if (provider) {
      let stale = false
      getTokenReserves(tokenAddress, provider)
        .then(reserves => {
          if (!stale) {
            setTokenMarketDetails(getMarketDetails(reserves, undefined))
          }
        })
        .catch(error => {
          if (!stale) {
            console.error(error)
            setTokenMarketDetails()
            setTokenError(error)
          }
        })
    } else {
      setTokenMarketDetails()
      setTokenError()
    }
  }, [tokenAddress, provider])

  tokenMarketDetails && console.log()

  const ethPriceOfETH = '1'
  const usdPriceOfETH =
    ethPrice &&
    formatFixed(ethPrice, {
      decimalPlaces: 2,
      dropTrailingZeros: false,
      format
    })

  const ethPriceOfToken = tokenMarketDetails && formatSignificant(tokenMarketDetails.marketRate.rate)
  const usdPriceOfToken =
    tokenMarketDetails && ethPrice
      ? formatFixed(tokenMarketDetails.marketRate.rate.multipliedBy(ethPrice), {
          decimalPlaces: 2,
          dropTrailingZeros: false,
          format
        })
      : undefined

  if (ethPrice === null || stablecoinWeights === null || tokenError) {
    return (
      <Section centered>
        <P>Error</P>
      </Section>
    )
  }

  return (
    <>
      {ethPrice && stablecoinWeights && ethPriceOfETH && usdPriceOfETH && ethPriceOfToken && usdPriceOfToken ? (
        <>
          <Section centered>
            <P>ETH Price: {selectedCurrency === ETH ? `Ξ ${ethPriceOfETH}` : `$${usdPriceOfETH}`}</P>
          </Section>

          <Section centered>
            <input
              type="text"
              value={tokenAddress}
              onChange={event => {
                const address = isAddress(event.target.value)
                address && setTokenAddress(address)
              }}
            />
          </Section>

          <Section centered>
            <P>Token Price: {selectedCurrency === ETH ? `Ξ ${ethPriceOfToken}` : `$${usdPriceOfToken}`}</P>
          </Section>

          <Section>
            {Object.keys(stablecoinWeights).map(stablecoin => (
              <P key={stablecoin}>
                {stablecoin}: {formatFixed(stablecoinWeights[stablecoin].multipliedBy(100), { decimalPlaces: 0 })}%
              </P>
            ))}
          </Section>
        </>
      ) : (
        <Section centered>
          <P>Loading...</P>
        </Section>
      )}
    </>
  )
}
