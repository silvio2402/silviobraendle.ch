import type { h } from 'preact'
import { useState } from 'preact/hooks'

import Styles from './styles.module.scss'

import Typography from 'preact-material-components/Typography'
import Button from 'preact-material-components/Button'

const Counter = () => {
  const [count, setCount] = useState(0)

  return (
    <div class="wrapper__center wrapper__appwidth">
      <div class={Styles.container}>
        <Typography headline4>Count: {count}</Typography>
        <div class={Styles.buttonscontainer}>
          <Button
            ripple
            raised
            onClick={() => setCount((count) => count + 1)}
            class="touchbutton"
          >
            Increase
          </Button>
          <Button
            ripple
            outlined
            onClick={() =>
              setTimeout(() => setCount((count) => count + 1), 2000)
            }
            class="touchbutton"
          >
            Increase Async (2s)
          </Button>
        </div>
        <div class={Styles.buttonscontainer}>
          <Button
            ripple
            raised
            onClick={() => setCount((count) => count - 1)}
            class="touchbutton"
          >
            Decrease
          </Button>
          <Button
            ripple
            outlined
            onClick={() =>
              setTimeout(() => setCount((count) => count - 1), 2000)
            }
            class="touchbutton"
          >
            Decrease Async (2s)
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Counter
