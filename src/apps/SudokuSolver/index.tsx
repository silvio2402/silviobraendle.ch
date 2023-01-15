import type { h } from 'preact'
import { useState, useRef, StateUpdater, useEffect } from 'preact/hooks'

import Styles from '@apps/SudokuSolver/styles.module.scss'

import Typography from 'preact-material-components/Typography'
import Button from 'preact-material-components/Button'

interface SudokuProps {
  values: (number | null)[]
  editable?: boolean
  setValues?: StateUpdater<(number | null)[]>
}

const Sudoku = (props: SudokuProps) => {
  const { values, setValues, editable } = props

  const handleKeyPress = (
    event: h.JSX.TargetedKeyboardEvent<HTMLElement>,
    fieldIndex: number
  ) => {
    const target = event.target as HTMLElement
    const key = event.key
    event.preventDefault()
    if (target.innerText.length > 0 || !/^[1-9]*$/.test(key)) return
    if (setValues)
      setValues((prevValues) =>
        Object.assign([], prevValues, { [fieldIndex]: Number(key) })
      )
  }

  return (
    <ul class={Styles.sudoku}>
      {Array.from(Array(9).keys()).map((y) => (
        <>
          {Array.from(Array(9).keys()).map((x) => (
            <li
              class={Styles.cell}
              contentEditable={editable}
              onKeyPress={(e) => handleKeyPress(e, y * 9 + x)}
              key={x}
            >
              {values[y * 9 + x]}
            </li>
          ))}
        </>
      ))}
    </ul>
  )
}

const exampleValues = [
  [
    null,
    null,
    null,
    2,
    6,
    null,
    7,
    null,
    1,
    6,
    8,
    null,
    null,
    7,
    null,
    null,
    9,
    null,
    1,
    9,
    null,
    null,
    null,
    4,
    5,
    null,
    null,
    8,
    2,
    null,
    1,
    null,
    null,
    null,
    4,
    null,
    null,
    null,
    4,
    6,
    null,
    2,
    9,
    null,
    null,
    null,
    5,
    null,
    null,
    null,
    3,
    null,
    2,
    8,
    null,
    null,
    9,
    3,
    null,
    null,
    null,
    7,
    4,
    null,
    4,
    null,
    null,
    5,
    null,
    null,
    3,
    6,
    7,
    null,
    3,
    null,
    1,
    8,
    null,
    null,
    null,
  ],
  [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    7,
    8,
    9,
    1,
    2,
    3,
    4,
    5,
    6,
    4,
    5,
    6,
    7,
    8,
    9,
    1,
    2,
    3,
    3,
    1,
    2,
    8,
    4,
    5,
    9,
    6,
    7,
    6,
    9,
    7,
    3,
    1,
    2,
    8,
    4,
    5,
    8,
    4,
    5,
    6,
    9,
    7,
    3,
    1,
    2,
    2,
    3,
    1,
    5,
    7,
    4,
    6,
    9,
    8,
    9,
    6,
    8,
    2,
    3,
    1,
    5,
    7,
    4,
    5,
    7,
    4,
    9,
    6,
    8,
    2,
    3,
    null,
  ],
  [
    6,
    8,
    null,
    4,
    null,
    3,
    null,
    5,
    null,
    4,
    null,
    2,
    null,
    5,
    null,
    3,
    6,
    8,
    5,
    9,
    3,
    6,
    7,
    8,
    null,
    null,
    4,
    null,
    1,
    7,
    2,
    8,
    6,
    9,
    4,
    5,
    8,
    null,
    9,
    5,
    null,
    4,
    2,
    null,
    7,
    2,
    5,
    4,
    3,
    9,
    7,
    8,
    1,
    null,
    7,
    null,
    null,
    8,
    3,
    1,
    5,
    9,
    2,
    9,
    3,
    5,
    null,
    6,
    null,
    4,
    null,
    1,
    null,
    2,
    null,
    9,
    null,
    5,
    null,
    7,
    3,
  ],
]

const possibleValues = (values: (number | null)[], index: number): number[] => {
  var x = index % 9
  var y = index / 9
  var b = x / 3 + y // box index

  // gather horizontal values
  var horizValues = Array(9)
  horizValues = horizValues.map((xMap) => values[y * 9 + xMap])

  // gather vertical values
  var vertValues = Array(9)
  vertValues = values.map((val, index) => (val = values[index * 9 + x]))

  // gather box values
  var boxValues = Array(9)
  boxValues = boxValues.map(
    (_, index) => values[(b % 3) * 3 + b * 9 + (index % 3) + index * 3]
  )

  var possible = Array(9)
    .fill(1)
    .map((_, i) => i + 1)

  // remove horizontal values
  possible = possible.filter((val) => !horizValues.includes(val))

  // remove vertical values
  possible = possible.filter((val) => !vertValues.includes(val))

  // remove box values
  possible = possible.filter((val) => !boxValues.includes(val))

  return possible
}

const solve = async (_values: (number | null)[]) => {
  return new Promise<(number | null)[]>((resolve, reject) => {
    let values = [..._values]

    const _recurse = (index: number) => {
      while (index < 81 && values[index] != null) index++
      if (index >= 81) return true
      let possible = possibleValues(values, index)
      for (let i = 0; possible.length < 9; i++) {
        values[index] = possible[i]
        if (_recurse(index + 1)) return true
      }
      values[index] = null
      return false
    }

    if (_recurse(0)) {
      resolve(values)
    } else reject("Couldn't solve.")
  })
}

const SudokuSolver = () => {
  const [values, setValues] = useState<(number | null)[]>(Array(81))
  const [outValues, setOutValues] = useState<(number | null)[]>(Array(81))
  const [elapsedTime, setElapsedTime] = useState<number | null>()

  const handleSolveClick = () => {
    const startTime = window.performance.now()
    if (values == null) return
    if (solve == null) return
    solve(values)
      .then((newValues) => {
        const endTime = window.performance.now()
        setElapsedTime(endTime - startTime)
        setOutValues(newValues)
      })
      .catch((err) => {
        alert("Couldn't solve.")
        console.error(err)
      })
  }

  return (
    <div class="wrapper__center wrapper__appwidth">
      <div class={Styles.container}>
        <Typography headline4>Input</Typography>
        {[...Array(exampleValues.length).keys()].map((i) => (
          <Button
            onClick={() => {
              setValues(() => exampleValues[i])
            }}
          >
            Example {i + 1}
          </Button>
        ))}
        <Sudoku values={values} setValues={setValues} editable={true} />
        <Button outlined onClick={handleSolveClick}>
          Solve
        </Button>
        <Typography headline4>
          Output {elapsedTime !== undefined ? `(${elapsedTime} ms)` : null}
        </Typography>
        <Sudoku values={outValues} editable={false} />
      </div>
    </div>
  )
}

export default SudokuSolver
