/**
 * Server-side serializers for Payload Lexical richText values.
 * Mirrors the node types and format flags rendered by `components/RichText.tsx`.
 */

interface LexicalNode {
  type: string
  children?: LexicalNode[]
  text?: string
  format?: number
  tag?: string
  listType?: string
  url?: string
  fields?: {
    url?: string
    newTab?: boolean
  }
}

interface LexicalRoot {
  root?: { children?: LexicalNode[] }
}

const IS_BOLD = 1
const IS_ITALIC = 2
const IS_STRIKETHROUGH = 4
const IS_UNDERLINE = 8
const IS_CODE = 16

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function asRoot(content: unknown): LexicalNode[] {
  if (!content || typeof content !== 'object') return []
  return (content as LexicalRoot).root?.children ?? []
}

function textToHtml(text: string, format = 0): string {
  let out = escapeHtml(text)
  if (format & IS_CODE) out = `<code>${out}</code>`
  if (format & IS_BOLD) out = `<strong>${out}</strong>`
  if (format & IS_ITALIC) out = `<em>${out}</em>`
  if (format & IS_UNDERLINE) out = `<u>${out}</u>`
  if (format & IS_STRIKETHROUGH) out = `<s>${out}</s>`
  return out
}

function nodeToHtml(node: LexicalNode): string {
  const children = () => (node.children ?? []).map(nodeToHtml).join('')

  switch (node.type) {
    case 'text':
      return textToHtml(node.text ?? '', node.format)
    case 'linebreak':
      return '<br>'
    case 'paragraph':
      return `<p>${children()}</p>`
    case 'heading': {
      const tag = /^h[1-6]$/.test(node.tag ?? '') ? node.tag : 'h2'
      return `<${tag}>${children()}</${tag}>`
    }
    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}>${children()}</${tag}>`
    }
    case 'listitem':
      return `<li>${children()}</li>`
    case 'quote':
      return `<blockquote>${children()}</blockquote>`
    case 'autolink':
    case 'link': {
      const href = node.fields?.url ?? node.url ?? '#'
      const target = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${escapeHtml(href)}"${target}>${children()}</a>`
    }
    default:
      return children()
  }
}

const BLOCK_TYPES = new Set(['paragraph', 'heading', 'listitem', 'quote'])

function nodeToText(node: LexicalNode): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'linebreak') return '\n'
  const text = (node.children ?? []).map(nodeToText).join('')
  return BLOCK_TYPES.has(node.type) ? `${text}\n` : text
}

export function lexicalToHtml(content: unknown): string | null {
  const nodes = asRoot(content)
  const html = nodes.map(nodeToHtml).join('')
  return lexicalToText(content) ? html : null
}

export function lexicalToText(content: unknown): string | null {
  const text = asRoot(content).map(nodeToText).join('').replace(/\n{3,}/g, '\n\n').trim()
  return text.length > 0 ? text : null
}
