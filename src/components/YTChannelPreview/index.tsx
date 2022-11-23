import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'

import Styles from './styles.module.scss'

import Typography from 'preact-material-components/Typography'
import Card from 'preact-material-components/Card'

import type {
  YoutubeChannelStatistics,
  YoutubeSubscription,
} from 'youtube.ts/types'

interface YTChannelPreview {
  snippet: YoutubeSubscription['snippet']
  stats: YoutubeChannelStatistics
  featured?: boolean
}

function YTChannelPreview(props: YTChannelPreview) {
  const { snippet, stats, featured } = props

  const subsFormatter = Intl.NumberFormat('en', { notation: 'compact' })
  const vidsFormatter = Intl.NumberFormat('en', { notation: 'standard' })

  let metadata: string[] = []
  if (stats.hiddenSubscriberCount === false && stats.subscriberCount) {
    metadata.push(
      `${subsFormatter.format(Number(stats.subscriberCount))} subscribers`
    )
  }
  if (stats.videoCount) {
    metadata.push(`${vidsFormatter.format(Number(stats.videoCount))} videos`)
  }

  return (
    <Card outlined>
      <div className={Styles.content}>
        {featured && (
          <div className={Styles.starcontainer}>
            <span className={Styles.star}>★</span>
          </div>
        )}
        <a
          className={Styles.avatar}
          href={`https://youtube.com/channel/${snippet.resourceId?.channelId}`}
          target="_blank"
        >
          <img
            src={snippet.thumbnails?.default?.url}
            className={Styles.avatarImage}
            alt={snippet.title}
          />
        </a>
        <a
          className={Styles.info}
          href={`https://youtube.com/channel/${snippet.resourceId?.channelId}`}
          target="_blank"
        >
          <div className={Styles.title}>
            <Typography title>{snippet.title}</Typography>
          </div>
          <div className={Styles.metadata}>
            <Typography caption>{metadata.join(' • ')}</Typography>
          </div>
          <div className={Styles.description}>
            <Typography caption>{snippet.description}</Typography>
          </div>
        </a>
      </div>
    </Card>
  )
}

export default YTChannelPreview
