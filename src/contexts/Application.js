import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react'

export const USD = 'USD'
export const ETH = 'ETH'

const NIGHT_MODE = 'NIGHT_MODE'
const SELECTED_CURRENCY = 'SELECTED_CURRENCY'

const TOGGLE_NIGHT_MODE = 'TOGGLE_NIGHT_MODE'
const TOGGLE_SELECTED_CURRENCY = 'TOGGLE_SELECTED_CURRENCY'

const ApplicationContext = createContext()

function useApplicationContext() {
  return useContext(ApplicationContext)
}

function reducer(state, { type }) {
  switch (type) {
    case TOGGLE_NIGHT_MODE: {
      return {
        ...state,
        [NIGHT_MODE]: !state[NIGHT_MODE]
      }
    }
    case TOGGLE_SELECTED_CURRENCY: {
      return {
        ...state,
        [SELECTED_CURRENCY]: state[SELECTED_CURRENCY] === USD ? ETH : USD
      }
    }
    default: {
      throw Error(`Unexpected action type in ApplicationContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    [NIGHT_MODE]: false,
    [SELECTED_CURRENCY]: USD
  })

  const toggleNightMode = useCallback(() => {
    dispatch({ type: TOGGLE_NIGHT_MODE })
  }, [])
  const toggleSelectedCurrency = useCallback(() => {
    dispatch({ type: TOGGLE_SELECTED_CURRENCY })
  }, [])

  return (
    <ApplicationContext.Provider
      value={useMemo(() => [state, { toggleNightMode, toggleSelectedCurrency }], [
        state,
        toggleNightMode,
        toggleSelectedCurrency
      ])}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export function useNightMode() {
  const [{ NIGHT_MODE }, { toggleNightMode }] = useApplicationContext()
  return [NIGHT_MODE, toggleNightMode]
}

export function useSelectedCurrency() {
  const [{ SELECTED_CURRENCY }, { toggleSelectedCurrency }] = useApplicationContext()
  return [SELECTED_CURRENCY, toggleSelectedCurrency]
}
