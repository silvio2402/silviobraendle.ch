import type { h } from 'preact'
import { useState, useRef } from 'preact/hooks'

import Styles from '@apps/SudokuSolver/styles.module.scss'

import Typography from 'preact-material-components/Typography'
import Button from 'preact-material-components/Button'
import type React from 'react'

interface SudokuProps {
  values: number[]
  editable?: boolean
}

const Sudoku = (props: SudokuProps) => {
  const { values, editable } = props

  return (
    <table class={Styles.sudokutable}>
      <tbody>
        {Array.from(Array(9).keys()).map((y) => (
          <tr class={Styles.row}>
            {Array.from(Array(9).keys()).map((x) => (
              <td
                class={Styles.cell}
                contentEditable={editable}
                onKeyPress={(e) =>
                  (e.target as HTMLTableCellElement).innerText.length > 0 ||
                  !/^[0-9]*$/.test(e.key)
                    ? e.preventDefault()
                    : null
                }
              >
                {values[Math.floor(y / 3) * 9 + x]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const SudokuSolver = () => {
  const [state, setState] = useState({
    values: Array(81),
  })
  return (
    <div class="wrapper__center wrapper__appwidth">
      <div class={Styles.container}>
        <Sudoku values={state.values} editable={true} />
      </div>
    </div>
  )
}

export default SudokuSolver
