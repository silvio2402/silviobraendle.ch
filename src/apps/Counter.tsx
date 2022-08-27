import type { h } from 'preact'
import { useState } from 'preact/hooks'

import Typography from 'preact-material-components/Typography'
import Button from 'preact-material-components/Button'

const Counter = () => {
  const [count, setCount] = useState(0)

  const buttonStyle: h.JSX.CSSProperties = { touchAction: 'manipulation' }

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
        <Button
          ripple
          raised
          onClick={() => setCount((count) => count + 1)}
          style={buttonStyle}
        >
          Increase
        </Button>
        <Button
          ripple
          outlined
          onClick={() => setTimeout(() => setCount((count) => count + 1), 2000)}
          style={buttonStyle}
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
        <Button
          ripple
          raised
          onClick={() => setCount((count) => count - 1)}
          style={buttonStyle}
        >
          Decrease
        </Button>
        <Button
          ripple
          outlined
          onClick={() => setTimeout(() => setCount((count) => count - 1), 2000)}
          style={buttonStyle}
        >
          Decrease Async (2s)
        </Button>
      </div>
    </div>
  )
}

export default Counter
