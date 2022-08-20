import { h } from 'preact'
import Styles from './styles.module.scss'

const tagColorClassNames = [Styles.tag0, Styles.tag1, Styles.tag2, Styles.tag3]

interface TagProps {
  tag: string
  index: number
  tagFilter?: Boolean
  count?: number | string
  currTag?: string
}

function Tag(props: TagProps) {
  const { tag, index, tagFilter, count, currTag } = props
  const Elem = tagFilter ? 'a' : 'div'
  return (
    <Elem
      href={currTag == tag ? `/posts` : `/posts/${tag}`}
      className={`${tagFilter ? Styles.tagfilter : ''} ${
        (tagFilter && !currTag) || currTag == tag ? Styles.selected : ''
      } ${Styles.tag} ${tagColorClassNames[index % 4]}`}
      data-tag={tag}
    >
      {tag}
      {count ? ` (${count})` : null}
      <slot />
    </Elem>
  )
}

export default Tag
