import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'

import YTChannelPreview from '@components/YTChannelPreview'

import Styles from './styles.module.scss'

import Button from 'preact-material-components/Button'

import Youtube, {
  YoutubeChannelStatistics,
  YoutubeSubscription,
} from 'youtube.ts/youtube'

interface YouTubeChannelsProps {
  apiKey: string
}

interface YoutubeSubscriptionStatistics extends YoutubeSubscription {
  statistics: YoutubeChannelStatistics
}

function YouTubeChannels(props: YouTubeChannelsProps) {
  const { apiKey } = props

  const [state, setState] = useState<{
    substats: YoutubeSubscriptionStatistics[]
    nextPageToken?: string
  }>({
    substats: [],
  })

  const fetchSubs = async () => {
    const youtube = new Youtube(apiKey)

    const subs = await youtube.channels.subscriptions(
      'UC899vvzg8amLGioWfqVviAg',
      {
        maxResults: 50,
        pageToken: state.nextPageToken,
      }
    )

    const channelIds = subs.items.map(
      (item) => item.snippet.resourceId.channelId
    )

    const stats: {
      items: { statistics: YoutubeChannelStatistics; id: string }[]
    } = await youtube.api.part('channels', 'statistics', {
      id: channelIds.join(','),
      maxResults: 50,
    })

    console.log({ subs, stats })

    let substats: YoutubeSubscriptionStatistics[] = []
    for (let i = 0; i < subs.items.length; i++) {
      const subItem = subs.items[i]
      const stat = stats.items.filter(
        (statItem) => subItem.snippet.resourceId.channelId === statItem.id
      )[0]
      if (stat == undefined) {
        continue
      }
      substats.push({
        ...subItem,
        statistics: stat.statistics,
      })
    }

    setState((state) => ({
      ...state,
      substats: [...state.substats, ...substats],
      nextPageToken:
        subs.nextPageToken !== state.nextPageToken
          ? subs.nextPageToken
          : undefined,
    }))
  }

  useEffect(() => {
    fetchSubs()
  }, [])

  const loadMore = () => fetchSubs()

  return (
    <div>
      <div className={Styles.channels}>
        {state.substats.map((item) => (
          <YTChannelPreview snippet={item.snippet} stats={item.statistics} />
        ))}
        {state.nextPageToken && <Button onClick={loadMore}>Show more</Button>}
      </div>
    </div>
  )
}

export default YouTubeChannels
