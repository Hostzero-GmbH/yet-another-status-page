"use client";

import { cn } from "@/lib/utils";

interface LinkFields {
  url?: string;
  linkType?: 'custom' | 'internal';
  newTab?: boolean;
  doc?: {
    relationTo?: string;
    value?: string | number | { id: string | number; [key: string]: unknown };
  };
}

interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  tag?: string;
  listType?: string;
  value?: number;
  url?: string;
  fields?: LinkFields;
}

interface LexicalRoot {
  root?: {
    children?: LexicalNode[];
  };
}

// Format flags from Lexical
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_UNDERLINE = 8;
const IS_CODE = 16;

function renderTextWithFormat(text: string, format: number = 0): React.ReactNode {
  let result: React.ReactNode = text;

  if (format & IS_CODE) {
    result = <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{result}</code>;
  }
  if (format & IS_BOLD) {
    result = <strong className="font-semibold">{result}</strong>;
  }
  if (format & IS_ITALIC) {
    result = <em className="italic">{result}</em>;
  }
  if (format & IS_UNDERLINE) {
    result = <u className="underline">{result}</u>;
  }
  if (format & IS_STRIKETHROUGH) {
    result = <s className="line-through">{result}</s>;
  }

  return result;
}

function renderNode(node: LexicalNode, index: number): React.ReactNode {
  const key = `node-${index}`;

  switch (node.type) {
    case "text":
      return (
        <span key={key}>
          {renderTextWithFormat(node.text || "", node.format)}
        </span>
      );

    case "linebreak":
      return <br key={key} />;

    case "paragraph":
      return (
        <p key={key} className="mb-2 last:mb-0">
          {node.children?.map((child, i) => renderNode(child, i))}
        </p>
      );

    case "heading": {
      const tag = node.tag || "h2";
      const headingClass = "mb-2 font-semibold";
      const children = node.children?.map((child, i) => renderNode(child, i));
      
      if (tag === "h1") return <h1 key={key} className={headingClass}>{children}</h1>;
      if (tag === "h2") return <h2 key={key} className={headingClass}>{children}</h2>;
      if (tag === "h3") return <h3 key={key} className={headingClass}>{children}</h3>;
      if (tag === "h4") return <h4 key={key} className={headingClass}>{children}</h4>;
      if (tag === "h5") return <h5 key={key} className={headingClass}>{children}</h5>;
      if (tag === "h6") return <h6 key={key} className={headingClass}>{children}</h6>;
      return <h2 key={key} className={headingClass}>{children}</h2>;
    }

    case "list": {
      const ListTag = node.listType === "number" ? "ol" : "ul";
      return (
        <ListTag
          key={key}
          className={cn(
            "mb-2 ml-4 last:mb-0",
            node.listType === "number" ? "list-decimal" : "list-disc"
          )}
        >
          {node.children?.map((child, i) => renderNode(child, i))}
        </ListTag>
      );
    }

    case "listitem":
      return (
        <li key={key} className="mb-1">
          {node.children?.map((child, i) => renderNode(child, i))}
        </li>
      );

    case "quote":
      return (
        <blockquote
          key={key}
          className="mb-2 border-l-2 border-muted-foreground/30 pl-4 italic"
        >
          {node.children?.map((child, i) => renderNode(child, i))}
        </blockquote>
      );

    case "autolink":
    case "link": {
      // Payload 3.x Lexical stores link data in fields property
      const linkFields = node.fields;
      let href = '#';
      
      if (linkFields?.linkType === 'internal' && linkFields?.doc) {
        // Internal link - build URL from doc reference
        const docValue = linkFields.doc.value;
        const docId = typeof docValue === 'object' ? docValue?.id : docValue;
        href = `/${linkFields.doc.relationTo}/${docId}`;
      } else if (linkFields?.url) {
        // External/custom link
        href = linkFields.url;
      } else if (node.url) {
        // Fallback for older format or auto-links
        href = node.url;
      }
      
      const openInNewTab = linkFields?.newTab ?? false;
      
      return (
        <a
          key={key}
          href={href}
          className="text-primary underline hover:text-primary/80"
          {...(openInNewTab && {
            target: "_blank",
            rel: "noopener noreferrer",
          })}
        >
          {node.children?.map((child, i) => renderNode(child, i))}
        </a>
      );
    }

    default:
      // For unknown types, try to render children
      if (node.children) {
        return (
          <span key={key}>
            {node.children.map((child, i) => renderNode(child, i))}
          </span>
        );
      }
      return null;
  }
}

interface RichTextProps {
  content: unknown;
  className?: string;
}

export function RichText({ content, className }: RichTextProps) {
  if (!content || typeof content !== "object") {
    return null;
  }

  const lexical = content as LexicalRoot;
  if (!lexical.root?.children?.length) {
    return null;
  }

  return (
    <div className={cn("rich-text", className)}>
      {lexical.root.children.map((node, index) => renderNode(node, index))}
    </div>
  );
}
