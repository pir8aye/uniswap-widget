import { useState, useEffect } from 'react'

export * from './price'

export function useBlockNumber(provider) {
  const [blockNumber, setBlockNumber] = useState()

  useEffect(() => {
    let stale = false

    function blockNumberHandler(blockNumber) {
      if (!stale) {
        setBlockNumber(blockNumber)
      }
    }

    provider
      .getBlockNumber()
      .then(blockNumberHandler)
      .catch(() => {
        blockNumberHandler(null)
      })

    provider.on('block', blockNumberHandler)

    return () => {
      stale = true
      provider.removeListener('block', blockNumberHandler)
    }
  }, [provider])

  return blockNumber
}
