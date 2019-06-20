import { useEffect, useReducer } from 'react'
import { BigNumber, getTokenReserves, getMarketDetails } from '@uniswap/sdk'

const DAI = 'DAI'
const USDC = 'USDC'
const TUSD = 'TUSD'

const USD_STABLECOINS = [DAI, USDC, TUSD]

const USD_STABLECOIN_ADDRESSES = [
  '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '0x8dd5fbCe2F6a956C3022bA3663759011Dd51e73E'
]

function forEachStablecoin(runner) {
  return USD_STABLECOINS.map((stablecoin, index) => runner(index, stablecoin))
}

// returns a deep copied + sorted list of values, as well as a sortmap
function sortBigNumbers(values) {
  const valueMap = values.map((value, i) => ({ value, i }))

  valueMap.sort((a, b) => {
    if (a.value.isGreaterThan(b.value)) {
      return 1
    } else if (a.value.isLessThan(b.value)) {
      return -1
    } else {
      return 0
    }
  })

  return [
    valueMap.map(element => values[element.i]),
    values.map((_, i) => valueMap.findIndex(element => element.i === i))
  ]
}

function getMedian(values) {
  const [sortedValues, sortMap] = sortBigNumbers(values)
  if (values.length % 2 === 0) {
    const middle = values.length / 2
    const indices = [middle - 1, middle]
    return [
      sortedValues[middle - 1].plus(sortedValues[middle]).dividedBy(2),
      sortMap.map(element => (indices.includes(element) ? new BigNumber(0.5) : new BigNumber(0)))
    ]
  } else {
    const middle = Math.floor(values.length / 2)
    return [sortedValues[middle], sortMap.map(element => (element === middle ? new BigNumber(1) : new BigNumber(0)))]
  }
}

function getMean(values, _weights) {
  const weights = _weights ? _weights : values.map(() => new BigNumber(1))

  const weightedValues = values.map((value, i) => value.multipliedBy(weights[i]))
  const numerator = weightedValues.reduce(
    (accumulator, currentValue) => accumulator.plus(currentValue),
    new BigNumber(0)
  )
  const denominator = weights.reduce((accumulator, currentValue) => accumulator.plus(currentValue), new BigNumber(0))

  return [numerator.dividedBy(denominator), weights.map(weight => weight.dividedBy(denominator))]
}

const ETH_PRICE = 'ETH_PRICE'
const STABLECOIN_WEIGHTS = 'STABLECOIN_WEIGHTS'

const UPDATE_PRICE_AND_WEIGHTS = 'UPDATE_PRICE_AND_WEIGHTS'
const ERROR = 'ERROR'

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_PRICE_AND_WEIGHTS: {
      const { [ETH_PRICE]: ethPrice, [STABLECOIN_WEIGHTS]: stablecoinWeights } = payload
      return {
        ...state,
        [ETH_PRICE]: ethPrice,
        [STABLECOIN_WEIGHTS]: stablecoinWeights
      }
    }
    case ERROR: {
      return {
        ...state,
        [ETH_PRICE]: null,
        [STABLECOIN_WEIGHTS]: null
      }
    }
    default: {
      throw Error(`Unexpected action type in useUSDPrice reducer: '${type}'.`)
    }
  }
}

export function useUSDPrice(provider, blockNumber) {
  const [state, dispatch] = useReducer(reducer, {
    [ETH_PRICE]: undefined,
    [STABLECOIN_WEIGHTS]: undefined
  })

  useEffect(() => {
    if (provider && blockNumber) {
      let stale = false

      Promise.all(forEachStablecoin(i => getTokenReserves(USD_STABLECOIN_ADDRESSES[i], provider)))
        .then(reserves => {
          const ethReserves = forEachStablecoin(i => reserves[i].ethReserve.amount)

          const marketDetails = forEachStablecoin(i => getMarketDetails(reserves[i], undefined))
          const ethPrices = forEachStablecoin(i => marketDetails[i].marketRate.rateInverted)

          const [median, medianWeights] = getMedian(ethPrices)
          const [mean, meanWeights] = getMean(ethPrices)
          const [weightedMean, weightedMeanWeights] = getMean(ethPrices, ethReserves)

          const ethPrice = getMean([median, mean, weightedMean])[0]
          const _stablecoinWeights = [
            getMean([medianWeights[0], meanWeights[0], weightedMeanWeights[0]])[0],
            getMean([medianWeights[1], meanWeights[1], weightedMeanWeights[1]])[0],
            getMean([medianWeights[2], meanWeights[2], weightedMeanWeights[2]])[0]
          ]
          const stablecoinWeights = forEachStablecoin((i, stablecoin) => ({
            [stablecoin]: _stablecoinWeights[i]
          })).reduce((accumulator, currentValue) => ({ ...accumulator, ...currentValue }), {})

          if (!stale) {
            dispatch({
              type: UPDATE_PRICE_AND_WEIGHTS,
              payload: { [ETH_PRICE]: ethPrice, [STABLECOIN_WEIGHTS]: stablecoinWeights }
            })
          }
        })
        .catch(error => {
          console.error('Error in useUSDPrice: ', error)
          dispatch({ type: ERROR })
        })

      return () => {
        stale = true
      }
    }
  }, [provider, blockNumber])

  return [state[ETH_PRICE], state[STABLECOIN_WEIGHTS]]
}
