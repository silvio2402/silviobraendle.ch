import type { h } from 'preact'
import { useMemo, useRef, useState } from 'preact/hooks'

import QRCode from 'qrcode'

import Styles from '@apps/QRCGen/styles.module.scss'

import Typography from 'preact-material-components/Typography'
import TextField from 'preact-material-components/TextField'
import Select from 'preact-material-components/Select'
import Switch from 'preact-material-components/Switch'
import Formfield from 'preact-material-components/Formfield'
import Radio from 'preact-material-components/Radio'
import Button from 'preact-material-components/Button'

interface QRCGenState {
  type: number
  inputs: Record<string, string | boolean | number>
  errorMsg?: string
}

const QRCGen = () => {
  const defaultState: QRCGenState = {
    type: 1,
    inputs: {
      hidden: false,
      data: '',
      ssid: '',
      psk: '',
      encryption: 1,
      eclevel: 2,
      scaleInput: '10',
    },
  }
  const [state, setState] = useState(defaultState)

  const handleInputChange = (
    type: 'input' | 'switch' | 'radio' | 'select',
    stateKey: string,
    e?: Event | number,
    limitNum = false
  ) => {
    if (type === 'input') {
      if (limitNum)
        ((e as Event).target as HTMLTextAreaElement).value = (
          (e as Event).target as HTMLTextAreaElement
        ).value.replace(/\D/g, '')

      setState((state) => ({
        ...state,
        inputs: {
          ...state.inputs,
          [stateKey]: ((e as Event).target as HTMLTextAreaElement).value,
        },
      }))
    } else if (type === 'switch') {
      setState((state) => ({
        ...state,
        inputs: {
          ...state.inputs,
          [stateKey]: !(state.inputs[stateKey] || false),
        },
      }))
    } else if (type === 'radio') {
      setState((state) => ({
        ...state,
        inputs: {
          ...state.inputs,
          [stateKey]: e as number,
        },
      }))
    } else if (type === 'select') {
      setState((state) => ({
        ...state,
        inputs: {
          ...state.inputs,
          [stateKey]: ((e as Event).target as HTMLSelectElement)
            .selectedIndex as number,
        },
      }))
    }
  }

  console.log(state)

  const canvasRef = useRef(null)
  const canvas = <canvas ref={canvasRef} class={Styles.qrpreview} />

  const renderQR = async (canvasRef: any) => {
    if (canvasRef.current === null) return
    let data = ''
    if (state.type === 1 || state.type === 2) {
      data = `${state.inputs['data']}`
    } else if (state.type === 3) {
      data =
        state.inputs['psk'] !== '' && state.inputs['ssid'] !== ''
          ? `WIFI:T:${
              ['nopass', 'WPA', 'WEP'][state.inputs['encryption'] as number]
            };S:${(state.inputs['ssid'] as string)
              .replace(';', '\\;')
              .replace(':', '\\:')};P:${(state.inputs['psk'] as string)
              .replace(';', '\\;')
              .replace(':', '\\:')};H:${
              state.inputs['hidden'] ? 'true' : 'false'
            };`
          : ''
    }
    try {
      await QRCode.toCanvas(canvasRef.current, data, {
        errorCorrectionLevel: ['L', 'M', 'Q', 'H'][
          (state.inputs['eclevel'] as number) - 1
        ] as QRCode.QRCodeErrorCorrectionLevel,
        scale: parseInt(state.inputs['scaleInput'] as string) || 1,
        margin: 0,
      })
    } catch (error) {
      console.warn(error)
      setState((state) => ({ ...state, errorMsg: String(error) }))
      return
    }
    setState((state) => ({ ...state, errorMsg: undefined }))
  }

  useMemo(() => {
    if (canvasRef.current !== null) {
      const context = (canvasRef.current as HTMLCanvasElement).getContext('2d')
      if (context === null) return
      context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    }

    renderQR(canvasRef)
  }, [state.type, state.inputs])

  return (
    <div class="wrapper__center wrapper__appwidth">
      <div class={Styles.container}>
        <Select
          hintText="Type"
          selectedIndex={state.type}
          onChange={(e) => {
            setState((state) => ({ ...state, type: e.target.selectedIndex }))
          }}
          class={Styles.select}
        >
          {['Text', 'URL', 'WiFi'].map((label, index) => (
            <Select.Item selected={index + 1 === state.type}>
              {label}
            </Select.Item>
          ))}
        </Select>
        {state.type === 1 && (
          <>
            <TextField
              label="Text"
              textarea={true}
              onKeyUp={(e: Event) => handleInputChange('input', 'data', e)}
            />
          </>
        )}
        {state.type === 2 && (
          <>
            <TextField
              label="URL"
              onKeyUp={(e: Event) => handleInputChange('input', 'data', e)}
            />
          </>
        )}
        {state.type === 3 && (
          <>
            <TextField
              label="Network Name (SSID)"
              onKeyUp={(e: Event) => handleInputChange('input', 'ssid', e)}
            />
            <TextField
              type="password"
              label="Passphrase"
              onKeyUp={(e: Event) => handleInputChange('input', 'psk', e)}
            />
            <div class={Styles.switchcontainer}>
              <label for="wifihidden">Hidden</label>
              <Switch
                id="wifihidden"
                checked={state.inputs['hidden'] || false}
                onChange={() => handleInputChange('switch', 'hidden')}
              />
            </div>
            <div class={Styles.radiocontainer}>
              <label>Encryption</label>
              <div class={Styles.radiobuttoncontainer}>
                <Formfield>
                  <Radio
                    id="wifiencryptionnone"
                    name="wifiencryption"
                    checked={state.inputs['encryption'] === 0}
                    onChange={() => handleInputChange('radio', 'encryption', 0)}
                  />
                  <label for="wifiencryptionnone">None</label>
                </Formfield>
                <Formfield>
                  <Radio
                    id="wifiencryptionwpa"
                    name="wifiencryption"
                    checked={state.inputs['encryption'] === 1}
                    onChange={() => handleInputChange('radio', 'encryption', 1)}
                  />
                  <label for="wifiencryptionwpa">WPA/WPA2</label>
                </Formfield>
                <Formfield>
                  <Radio
                    id="wifiencryptionwep"
                    name="wifiencryption"
                    checked={state.inputs['encryption'] === 2}
                    onChange={() => handleInputChange('radio', 'encryption', 2)}
                  />
                  <label for="wifiencryptionwep">WEP</label>
                </Formfield>
              </div>
            </div>
          </>
        )}

        <details>
          <summary>Advanced</summary>
          <div class={Styles.collapsecontainer}>
            <Select
              hintText="Error Correction Level"
              selectedIndex={state.inputs['eclevel'] as number}
              onChange={(e) => handleInputChange('select', 'eclevel', e)}
              class={Styles.select}
            >
              {['low', 'medium', 'quartile', 'high'].map((label, index) => (
                <Select.Item
                  selected={index === (state.inputs['eclevel'] as number) - 1}
                >
                  {label}
                </Select.Item>
              ))}
            </Select>
            <TextField
              label="Scale (px per module)"
              onKeyUp={(e: Event) =>
                handleInputChange('input', 'scaleInput', e, true)
              }
              value={state.inputs['scaleInput'] as string}
            />
            <Typography>{state.errorMsg && `${state.errorMsg}`}</Typography>
          </div>
        </details>

        {canvas}
      </div>
    </div>
  )
}

export default QRCGen
