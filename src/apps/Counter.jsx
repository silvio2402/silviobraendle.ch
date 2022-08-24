import { h } from 'preact'
import { useState } from 'preact/hooks'

import 'preact-material-components/Button/style.css'
import Typography from 'preact-material-components/Typography'
import Button from 'preact-material-components/Button'

const Counter = () => {
  const [count, setCount] = useState(0)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <Typography>Count: {count}</Typography>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
        }}
      >
        <Button ripple raised onClick={() => setCount((count) => count + 1)}>
          Increase
        </Button>
        <Button
          ripple
          raised
          onClick={() => setTimeout(() => setCount((count) => count + 1), 2000)}
        >
          Increase Async (2s)
        </Button>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
        }}
      >
        <Button ripple raised onClick={() => setCount((count) => count - 1)}>
          Decrease
        </Button>
        <Button
          ripple
          raised
          onClick={() => setTimeout(() => setCount((count) => count - 1), 2000)}
        >
          Decrease Async (2s)
        </Button>
      </div>
    </div>
  )
}

export default Counter
