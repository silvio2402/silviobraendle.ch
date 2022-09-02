import { h } from 'preact'
import Styles from '@components/Footer/styles.module.scss'

function Footer() {
  return (
    <footer className={Styles.footer}>
      &copy; {new Date().getFullYear()} Silvio Brändle
      <small className={Styles.byline}>🚀 Built by Astro</small>
    </footer>
  )
}
export default Footer
