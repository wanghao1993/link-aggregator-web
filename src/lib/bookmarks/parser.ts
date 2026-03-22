import type {
  ParsedBookmark,
  ParsedBookmarkFolder,
  ParsedBookmarkNode,
  BookmarkParseResult,
} from "@/types/bookmark";
import { isBookmarkFolder } from "@/types/bookmark";

/**
 * Parse a Netscape Bookmark File Format HTML string.
 *
 * All major browsers (Chrome, Firefox, Safari, Edge) export bookmarks
 * using the same legacy format based on nested <DL>/<DT> lists:
 *   <DT><H3 ...>Folder Name</H3>
 *   <DL><p>
 *     <DT><A HREF="..." ADD_DATE="..." ICON="...">Link Title</A>
 *   </DL><p>
 */
export function parseBookmarkHtml(html: string): BookmarkParseResult {
  let totalBookmarks = 0;
  let totalFolders = 0;

  const dtRegex = /<DT>\s*/gi;
  const tagRegex = /^<(A|H3)\b([^>]*)>([\s\S]*?)<\/\1>/i;
  const attrRegex = /(\w+)\s*=\s*"([^"]*)"/gi;
  const dlOpenRegex = /^<DL>/i;
  const dlCloseRegex = /^<\/DL>/i;

  function parseAttributes(attrStr: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    let match: RegExpExecArray | null;
    attrRegex.lastIndex = 0;
    while ((match = attrRegex.exec(attrStr)) !== null) {
      attrs[match[1].toUpperCase()] = match[2];
    }
    return attrs;
  }

  const tokens: string[] = [];
  const tokenPattern =
    /<DT>\s*<(A|H3)\b[^>]*>[\s\S]*?<\/\1>|<\/?DL\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = tokenPattern.exec(html)) !== null) {
    tokens.push(m[0].trim());
  }

  let pos = 0;

  function parseFolder(): ParsedBookmarkNode[] {
    const nodes: ParsedBookmarkNode[] = [];

    while (pos < tokens.length) {
      const token = tokens[pos];

      if (dlCloseRegex.test(token)) {
        pos++;
        return nodes;
      }

      if (dlOpenRegex.test(token)) {
        pos++;
        const children = parseFolder();
        const lastNode = nodes[nodes.length - 1];
        if (lastNode && isBookmarkFolder(lastNode)) {
          lastNode.children = children;
        }
        continue;
      }

      const stripped = token.replace(dtRegex, "");
      const tagMatch = stripped.match(tagRegex);
      if (!tagMatch) {
        pos++;
        continue;
      }

      const tagName = tagMatch[1].toUpperCase();
      const attrStr = tagMatch[2];
      const innerText = tagMatch[3].replace(/<[^>]*>/g, "").trim();
      const attrs = parseAttributes(attrStr);

      if (tagName === "H3") {
        totalFolders++;
        const folder: ParsedBookmarkFolder = {
          title: innerText,
          children: [],
          addDate: attrs.ADD_DATE ? parseInt(attrs.ADD_DATE, 10) : undefined,
        };
        nodes.push(folder);
      } else if (tagName === "A" && attrs.HREF) {
        totalBookmarks++;
        const bookmark: ParsedBookmark = {
          title: innerText || attrs.HREF,
          url: attrs.HREF,
          addDate: attrs.ADD_DATE ? parseInt(attrs.ADD_DATE, 10) : undefined,
          icon: attrs.ICON || undefined,
        };
        nodes.push(bookmark);
      }

      pos++;
    }

    return nodes;
  }

  const allNodes = parseFolder();

  const roots: ParsedBookmarkFolder[] = [];
  const looseBookmarks: ParsedBookmarkNode[] = [];

  for (const node of allNodes) {
    if (isBookmarkFolder(node)) {
      roots.push(node);
    } else {
      looseBookmarks.push(node);
    }
  }

  if (looseBookmarks.length > 0) {
    roots.unshift({
      title: "Unsorted Bookmarks",
      children: looseBookmarks,
    });
  }

  return { roots, totalBookmarks, totalFolders };
}

/** Count all bookmark links inside a folder tree recursively. */
export function countBookmarks(nodes: ParsedBookmarkNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (isBookmarkFolder(node)) {
      count += countBookmarks(node.children);
    } else {
      count++;
    }
  }
  return count;
}

/** Flatten a folder into a list of bookmark links (recursively). */
export function flattenBookmarks(
  nodes: ParsedBookmarkNode[]
): ParsedBookmark[] {
  const result: ParsedBookmark[] = [];
  for (const node of nodes) {
    if (isBookmarkFolder(node)) {
      result.push(...flattenBookmarks(node.children));
    } else {
      result.push(node);
    }
  }
  return result;
}
