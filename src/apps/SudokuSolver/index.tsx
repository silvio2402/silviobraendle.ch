import type { h } from 'preact'
import { useState, useRef, StateUpdater } from 'preact/hooks'

import Styles from '@apps/SudokuSolver/styles.module.scss'

import Typography from 'preact-material-components/Typography'
import Button from 'preact-material-components/Button'
import type React from 'react'

interface SudokuProps {
  values: (number | null)[]
  editable?: boolean
  setValues?: StateUpdater<(number | null)[]>
}

const Sudoku = (props: SudokuProps) => {
  const { values, setValues, editable } = props

  const handleKeyPress = (
    event: h.JSX.TargetedKeyboardEvent<HTMLTableCellElement>,
    fieldIndex: number
  ) => {
    const target = event.target as HTMLTableCellElement
    const key = event.key
    event.preventDefault()
    if (target.innerText.length > 0 || !/^[1-9]*$/.test(key)) return
    if (setValues)
      setValues((prevValues) =>
        Object.assign([], prevValues, { [fieldIndex]: Number(key) })
      )
  }

  return (
    <table class={Styles.sudokutable}>
      <tbody>
        {Array.from(Array(9).keys()).map((y) => (
          <tr class={Styles.row} key={y}>
            {Array.from(Array(9).keys()).map((x) => (
              <td
                class={Styles.cell}
                contentEditable={editable}
                onKeyPress={(e) => handleKeyPress(e, y * 9 + x)}
                key={x}
              >
                {values[y * 9 + x]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const checkPossible = (
  values: (number | null)[],
  index: number
): Set<number> => {
  const x = index % 9
  const y = Math.floor(index / 9)
  const b = Math.floor(x / 3) + Math.floor(y / 3) * 3 // Box index

  // Gather horizontal values
  const horizValues = new Set(
    [...Array(9).keys()].map((xMap) => values[y * 9 + xMap])
  )

  // Gather vertical values
  const vertValues = new Set(
    [...Array(9).keys()].map((yMap) => values[yMap * 9 + x])
  )

  // Gather box values
  const boxValues = new Set(
    [...Array(9).keys()].map(
      (iMap) =>
        values[
          (b % 3) * 3 +
            Math.floor(b / 3) * 27 +
            (iMap % 3) +
            Math.floor(iMap / 3) * 9
        ]
    )
  )

  // Difference of sets horizValues, vertValues, and boxValues
  // {1...9} - (horizValues ∪ vertValues ∪ boxValues)
  const possible = new Set(
    Array.from({ length: 9 }, (_, index) => index + 1).filter(
      (i) => !horizValues.has(i) && !vertValues.has(i) && !boxValues.has(i)
    )
  )

  return possible
}

const solve = async (values: (number | null)[]): Promise<(number | null)[]> =>
  new Promise<(number | null)[]>(async (resolve, reject) => {
    setTimeout(async () => {
      // Find first empty cell
      var firstClear: number | undefined
      for (let i = 0; i < values.length; i++) {
        if (values[i] == null) {
          firstClear = i
          break
        }
      }

      if (firstClear == null) {
        return resolve(values)
      }

      const possible = [...checkPossible(values, firstClear)]
      if (possible.length <= 0) return reject()

      for (let i = 0; i < possible.length; i++) {
        const possibility = possible[i]
        const newValues = Object.assign([], values, {
          [firstClear]: possibility,
        })
        // Recursively solve
        try {
          const sValues = await solve(newValues)
          resolve(sValues)
        } catch {}
      }

      reject()
    }, 0)
  })

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
]

const SudokuSolver = () => {
  const [values, setValues] = useState<(number | null)[]>(Array(81))
  const [outValues, setOutValues] = useState<(number | null)[]>(Array(81))
  const [elapsedTime, setElapsedTime] = useState<number | null>()

  const handleSolveClick = () => {
    if (!confirm('Are you sure you would like to so start solving?'))
      return null
    const startTime = Date.now()
    solve(values)
      .then((newValues) => {
        const endTime = Date.now()
        setElapsedTime(endTime - startTime)
        setOutValues(newValues)
      })
      .catch(() => alert("Couldn't solve."))
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
          Output {elapsedTime ? `(${elapsedTime} ms)` : null}
        </Typography>
        <Sudoku values={outValues} editable={false} />
      </div>
    </div>
  )
}

export default SudokuSolver
