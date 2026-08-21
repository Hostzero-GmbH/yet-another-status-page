'use client'

import { RichText } from '@/components/RichText'
import { DEFAULT_TIMEZONE, formatTimezoneNotice } from '@/lib/datetime'

interface FooterProps {
  footerText: unknown
  timezone?: string | null
}

// An empty editor still saves a root with one empty paragraph, so look for actual text.
function hasRichTextContent(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as { text?: string; children?: unknown[] }
  if (typeof n.text === 'string' && n.text.trim().length > 0) return true
  return Array.isArray(n.children) && n.children.some(hasRichTextContent)
}

export function Footer({ footerText, timezone }: FooterProps) {
  const hasContent = hasRichTextContent((footerText as { root?: unknown } | null)?.root)

  return (
    <footer className="border-t border-border bg-card py-6">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex min-w-0 flex-col items-center gap-1 text-center sm:items-start sm:text-left">
            {hasContent ? (
              <RichText content={footerText} className="text-sm text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic [&_u]:underline [&_s]:line-through [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80 [&_p]:mb-0" />
            ) : null}
            <p className="text-xs text-muted-foreground/80">
              {formatTimezoneNotice(timezone || DEFAULT_TIMEZONE)}
            </p>
          </div>
          <a
            href="https://github.com/Hostzero-GmbH/yet-another-status-page"
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            aria-label="View source on GitHub"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
