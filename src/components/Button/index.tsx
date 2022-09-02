import { h } from 'preact'
import Styles from '@components/Button/styles.module.scss'

interface ButtonProps {
  children: React.ReactNode
}

function Button(props: ButtonProps) {
  const { children } = props
  return <span className={Styles.button}>{children}</span>
}

export default Button
