import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Temporal } from '@js-temporal/polyfill'
import { useWidthCondition, zeroPad } from '@apps/util'

import Styles from './styles.module.scss'

import Typography from 'preact-material-components/Typography'
import Button from 'preact-material-components/Button'
import List from 'preact-material-components/List'

interface StopWatchLap {
  start?: Temporal.Instant
  carry?: Temporal.Duration
  finish?: Temporal.Instant
}

interface StopWatchState {
  started: boolean
  start?: Temporal.Instant
  carry?: Temporal.Duration
  laps: Array<StopWatchLap>
}

const defaultState: StopWatchState = {
  started: false,
  laps: [],
}

const StopWatch = () => {
  const [state, setState] = useState(defaultState)

  const currTime = Temporal.Now.instant()

  const isSmallScreen = useWidthCondition((width) => width < 650)

  useEffect(() => {
    const interval = setInterval(async () =>
      setState((state) => ({ ...state }))
    )
    return () => clearInterval(interval)
  }, [])

  const deltaTime = (
    state.started && state.start
      ? currTime.since(state.start)
      : new Temporal.Duration()
  )
    .add(state.carry || new Temporal.Duration())
    .round({ largestUnit: 'hour' })

  const handleStartPause = async () => {
    setState((state) => {
      if (state.started) {
        // Pause
        const laps = state.laps.map((lap) => ({
          carry: (!lap.start
            ? new Temporal.Duration()
            : lap.start.until(lap.finish || currTime)
          ).add(lap.carry || new Temporal.Duration()),
        }))
        const carry = state.start
          ? currTime
              .since(state.start)
              .add(state.carry || new Temporal.Duration())
          : state.carry

        return {
          carry: carry,
          started: false,
          laps: laps,
        }
      } else {
        // Start/Continue
        let laps = state.laps
        if (laps.length) laps[0].start = currTime
        else laps = [{ start: currTime }]

        return {
          ...state,
          started: true,
          start: currTime,
          laps: laps,
        }
      }
    })
  }
  const handleLapClear = async () =>
    setState((state) => {
      if (state.started) {
        // Lap
        let laps = [{ start: currTime }, ...state.laps]
        laps[1].finish = currTime
        return {
          ...state,
          laps: laps,
        }
      } else {
        // Clear
        return {
          started: false,
          laps: [],
        }
      }
    })

  return (
    <div class="wrapper__center wrapper__appwidth">
      <div class={Styles.container}>
        <Typography
          {...(isSmallScreen ? { headline3: true } : { headline1: true })}
        >
          <div class={Styles.viewcontainer}>
            <span>{zeroPad(deltaTime.hours, 2)}</span>
            <span>:</span>
            <span>{zeroPad(deltaTime.minutes, 2)}</span>
            <span>:</span>
            <span>{zeroPad(deltaTime.seconds, 2)}</span>
            <span>.</span>
            <span>{zeroPad(deltaTime.milliseconds, 3)}</span>

            <Typography
              {...(isSmallScreen ? { body1: true } : { headline6: true })}
            >
              Hours
            </Typography>
            <span></span>
            <Typography
              {...(isSmallScreen ? { body1: true } : { headline6: true })}
            >
              Minutes
            </Typography>
            <span></span>
            <Typography
              {...(isSmallScreen ? { body1: true } : { headline6: true })}
            >
              Seconds
            </Typography>
            <span></span>
            <Typography
              {...(isSmallScreen ? { body1: true } : { headline6: true })}
            >
              Milliseconds
            </Typography>
          </div>
        </Typography>
        <div class={Styles.buttonscontainer}>
          <Button
            ripple
            raised
            onClick={handleStartPause}
            class="touchbutton"
            style={{ padding: '1.5rem' }}
          >
            {state.started
              ? 'Pause'
              : state.carry instanceof Temporal.Duration
              ? 'Continue'
              : 'Start'}
          </Button>
          <Button
            ripple
            outlined
            disabled={
              !(
                state.start instanceof Temporal.Instant ||
                state.carry instanceof Temporal.Duration
              )
            }
            onClick={handleLapClear}
            class="touchbutton"
            style={{ padding: 'calc(1.5rem - 2px)' }}
          >
            {state.started ? 'Lap' : 'Clear'}
          </Button>
        </div>
        <div>
          <Typography headline5>Laps</Typography>
          <List style={{ paddingTop: 0 }}>
            {state.laps.map((lap, index) => {
              const lapDuration = (
                lap.start?.until(lap.finish || currTime) ||
                new Temporal.Duration()
              )
                .add(lap.carry || new Temporal.Duration())
                .round({ largestUnit: 'hour' })
              return (
                <List.Item key={index}>
                  <span>{zeroPad(lapDuration.hours, 2)}</span>
                  <span>:</span>
                  <span>{zeroPad(lapDuration.minutes, 2)}</span>
                  <span>:</span>
                  <span>{zeroPad(lapDuration.seconds, 2)}</span>
                  <span>.</span>
                  <span>{zeroPad(lapDuration.milliseconds, 3)}</span>
                  <List.ItemMeta>Lap {state.laps.length - index}</List.ItemMeta>
                </List.Item>
              )
            })}
          </List>
        </div>
      </div>
    </div>
  )
}

export default StopWatch
