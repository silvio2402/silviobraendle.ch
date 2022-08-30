import type { h } from 'preact'
import { useState } from 'preact/hooks'

import Styles from './styles.module.scss'

import Typography from 'preact-material-components/Typography'
import Button from 'preact-material-components/Button'
import TextField from 'preact-material-components/TextField'

const buttonColors = ['#34A853', '#EA4335', '#FBBC05', '#4285F4']
const focusFilter = 'brightness(50%)'

interface SimonGameState {
  mode: number
  focused: number
  combo: Array<number>
  entered: Array<number>
  columns: number
  rows: number
  colInput: string
  rowInput: string
}
const defaultState: SimonGameState = {
  mode: 0,
  focused: -1,
  combo: [],
  entered: [],
  columns: 2,
  rows: 2,
  colInput: '2',
  rowInput: '2',
}

const comboShowTime = 700
const comboClearTime = 500

const SimonGame = () => {
  const [state, setState] = useState(defaultState)

  // Game Logic
  const playCombo = () => {
    setState((state) => {
      for (let i = 0; i < state.combo.length; i++) {
        const currCombo = state.combo[i]
        setTimeout(
          () => setState((state) => ({ ...state, focused: -1 })),
          i * (comboShowTime + comboClearTime) - comboClearTime
        )
        setTimeout(
          () => setState((state) => ({ ...state, focused: currCombo })),
          i * (comboShowTime + comboClearTime)
        )
      }
      setTimeout(
        () => setState((state) => ({ ...state, mode: 2, focused: -1 })),
        state.combo.length * (comboShowTime + comboClearTime) - comboClearTime
      )
      return { ...state, focused: -1 }
    })
  }
  const startGame = () => {
    setState({
      ...state,
      focused: -1,
      mode: 1,
      combo: [Math.floor(Math.random() * (state.columns * state.rows))],
      entered: [],
    })
    setTimeout(playCombo, 1000)
  }
  const checkCombo = () => {
    for (let index = 0; index < state.entered.length; index++) {
      const combo = state.combo[index]
      const enteredCombo = state.entered[index]
      if (combo !== enteredCombo) return false
    }
    return true
  }
  const enterCombo = (index: number, event: any) => {
    state.entered.push(index)
    if (!checkCombo())
      return setState((state) => ({ ...state, mode: 3, focused: -1 }))
    if (state.combo.length <= state.entered.length) {
      setState((state) => ({
        ...state,
        mode: 1,
        entered: [],
        combo: [
          ...state.combo,
          Math.floor(Math.random() * (state.columns * state.rows)),
        ],
      }))
      setTimeout(playCombo, 1000)
    }
  }

  const handleSizeEntry = (event: Event, entry: number) => {
    if (!event.target) return
    const textInput = event.target as HTMLTextAreaElement
    textInput.value = textInput.value.replace(/\D/g, '')
    if (entry === 0)
      setState((state) => ({
        ...state,
        columns: parseInt(textInput.value),
        colInput: textInput.value,
      }))
    else if (entry === 1)
      setState((state) => ({
        ...state,
        rows: parseInt(textInput.value),
        rowInput: textInput.value,
      }))
  }

  return (
    <div
      class={`${Styles.mainwrapper} wrapper__center${
        state.mode === 1 || state.mode === 2 ? '' : ' wrapper__appwidth'
      }`}
    >
      {(state.mode === 1 || state.mode === 2) && (
        <Typography headline3 class={Styles.scorelabel}>
          Score: {state.combo.length - 1}
        </Typography>
      )}
      <div class={Styles.container}>
        {state.mode <= 0 ? (
          <div class={Styles.startcontainer}>
            <TextField
              label="Columns"
              value={state.colInput}
              onKeyUp={(e: Event) => handleSizeEntry(e, 0)}
            />
            <TextField
              label="Rows"
              value={state.rowInput}
              onKeyUp={(e: Event) => handleSizeEntry(e, 1)}
            />
            <Button ripple raised onClick={startGame}>
              Start Game
            </Button>
          </div>
        ) : state.mode < 3 ? (
          <>
            {Array(state.rows)
              .fill(0)
              .map((_, ir) => (
                <div class={Styles.buttongroup} key={ir}>
                  {Array(state.columns)
                    .fill(0)
                    .map((_, ic) => (
                      <Button
                        key={ic}
                        onClick={(event: any) =>
                          enterCombo(ir * state.columns + ic, event)
                        }
                        ripple
                        disabled={state.mode !== 2}
                        class={`${Styles.button} touchbutton`}
                        style={{
                          backgroundColor:
                            buttonColors[
                              (ir * state.columns + ic) % buttonColors.length
                            ],
                          filter:
                            (state.focused === ir * state.columns + ic &&
                              focusFilter) ||
                            '',
                        }}
                      />
                    ))}
                </div>
              ))}
          </>
        ) : (
          <>
            <Typography headline3>Game Over</Typography>
            <Typography headline4>Score: {state.combo.length - 1}</Typography>
            <Button
              ripple
              outlined
              onClick={() => setState((state) => ({ ...state, mode: 0 }))}
            >
              Go Back
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default SimonGame
