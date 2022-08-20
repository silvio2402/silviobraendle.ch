import { h } from 'preact'
import Styles from './styles.module.scss'
import type { App } from '../../apps/index'

interface AppPreviewProps {
  app: App
}

function AppPreview(props: AppPreviewProps) {
  const { app } = props
  const { details } = app

  return (
    <div className={Styles.card}>
      <div
        className={Styles.titleCard}
        style={{ backgroundImage: `url(${details.img})` }}
      >
        <h1 className={Styles.title}>{details.title}</h1>
      </div>
      <div className="pa3">
        <p className={`${Styles.desc} mt0 mb2`}>{details.description}</p>
        <a className={Styles.link} href={`/app/${app.id}`}>
          <span className={Styles.linkInner}>View</span>
        </a>
      </div>
    </div>
  )
}

export default AppPreview
