import { h } from 'preact'
import Styles from './styles.module.scss'
import Tag from '../Tag/index.tsx'

function PostPreview({ post, tags }) {
  const { frontmatter } = post
  return (
    <div className={Styles.card}>
      <div
        className={Styles.titleCard}
        style={`background-image:url(${frontmatter.img})`}
      >
        <h1 className={Styles.title}>{frontmatter.title}</h1>
      </div>
      <div className="pa3">
        <p className={`${Styles.desc} mt0 mb2`}>{frontmatter.description}</p>
        <div className={Styles.tags}>
          Tagged:
          {frontmatter.tags?.map((t) => (
            <Tag tag={t} index={tags.indexOf(t)} />
          ))}
        </div>
        <a className={Styles.link} href={post.url}>
          <span className={Styles.linkInner}>View</span>
        </a>
      </div>
    </div>
  )
}

export default PostPreview
