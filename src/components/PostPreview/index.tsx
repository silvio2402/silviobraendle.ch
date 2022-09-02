import { h } from 'preact'
import Styles from '@components/PostPreview/styles.module.scss'
import Tag from '@components/Tag/index'
import type { MarkdownInstance } from 'astro'

interface PostPreviewProps {
  post: MarkdownInstance<Record<string, any>>
  tags: Array<string>
}

function PostPreview(props: PostPreviewProps) {
  const { post, tags } = props
  const { frontmatter } = post
  const postTags: Array<string> = Array.isArray(frontmatter.tags)
    ? frontmatter.tags
    : []

  return (
    <div className={Styles.card}>
      <div
        className={Styles.titleCard}
        style={{ backgroundImage: `url(${frontmatter.img})` }}
      >
        <h1 className={Styles.title}>{frontmatter.title}</h1>
      </div>
      <div className="pa3">
        <p className={`${Styles.desc} mt0 mb2`}>{frontmatter.description}</p>
        <div className={Styles.tags}>
          Tagged:
          {postTags.map((t) => (
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
