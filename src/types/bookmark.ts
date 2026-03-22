export interface ParsedBookmark {
  title: string;
  url: string;
  addDate?: number;
  icon?: string;
}

export interface ParsedBookmarkFolder {
  title: string;
  children: ParsedBookmarkNode[];
  addDate?: number;
}

export type ParsedBookmarkNode = ParsedBookmark | ParsedBookmarkFolder;

export function isBookmarkFolder(
  node: ParsedBookmarkNode
): node is ParsedBookmarkFolder {
  return "children" in node;
}

export function isBookmarkLink(
  node: ParsedBookmarkNode
): node is ParsedBookmark {
  return "url" in node;
}

export interface BookmarkParseResult {
  roots: ParsedBookmarkFolder[];
  totalBookmarks: number;
  totalFolders: number;
}

export interface BookmarkImportPayload {
  folders: FolderImportItem[];
}

export interface FolderImportItem {
  folderTitle: string;
  description?: string;
  category?: string;
  tags?: string[];
  bookmarks: BookmarkLinkItem[];
}

export interface BookmarkLinkItem {
  title: string;
  url: string;
  description?: string;
  icon?: string;
}
