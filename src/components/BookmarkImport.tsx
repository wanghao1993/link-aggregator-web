"use client";
import Link from "next/link";

import React, { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileUp,
  FolderOpen,
  Link2,
  ChevronRight,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  BookmarkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { parseBookmarkHtml, countBookmarks } from "@/lib/bookmarks/parser";
import type {
  BookmarkParseResult,
  ParsedBookmarkFolder,
  ParsedBookmarkNode,
  FolderImportItem,
} from "@/types/bookmark";
import { isBookmarkFolder, isBookmarkLink } from "@/types/bookmark";

const CATEGORIES = [
  "ai",
  "web",
  "design",
  "mobile",
  "devops",
  "data",
  "security",
  "productivity",
  "tools",
] as const;

interface FolderSelection {
  selected: boolean;
  category: string;
  expanded: boolean;
}

export default function BookmarkImport() {
  const t = useTranslations("bookmarkImport");
  const ct = useTranslations("categories");
  const commonT = useTranslations("common");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<BookmarkParseResult | null>(
    null
  );
  const [folderSelections, setFolderSelections] = useState<
    Record<string, FolderSelection>
  >({});
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    totalCollections: number;
    totalLinks: number;
  } | null>(null);

  const initFolderSelections = useCallback(
    (folders: ParsedBookmarkFolder[], prefix = "") => {
      const selections: Record<string, FolderSelection> = {};

      const walk = (list: ParsedBookmarkFolder[], pathPrefix: string) => {
        list.forEach((folder, idx) => {
          const key = `${pathPrefix}/${idx}-${folder.title}`;
          selections[key] = {
            selected: true,
            category: "tools",
            expanded: true,
          };
          const subFolders = folder.children.filter(isBookmarkFolder);
          if (subFolders.length > 0) {
            walk(subFolders, key);
          }
        });
      };

      walk(folders, prefix);
      return selections;
    },
    []
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
        toast.error(t("invalidFileType"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const html = e.target?.result as string;
        try {
          const result = parseBookmarkHtml(html);
          setParseResult(result);
          setFolderSelections(initFolderSelections(result.roots));
          setImportResult(null);
          toast.success(
            t("parseSuccess", {
              folders: result.totalFolders,
              bookmarks: result.totalBookmarks,
            })
          );
        } catch {
          toast.error(t("parseError"));
        }
      };
      reader.readAsText(file);
    },
    [t, initFolderSelections]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const toggleFolder = (key: string) => {
    setFolderSelections((prev) => ({
      ...prev,
      [key]: { ...prev[key], expanded: !prev[key]?.expanded },
    }));
  };

  const toggleFolderSelection = (key: string) => {
    setFolderSelections((prev) => ({
      ...prev,
      [key]: { ...prev[key], selected: !prev[key]?.selected },
    }));
  };

  const setFolderCategory = (key: string, category: string) => {
    setFolderSelections((prev) => ({
      ...prev,
      [key]: { ...prev[key], category },
    }));
  };

  const selectAll = () => {
    setFolderSelections((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = { ...next[key], selected: true };
      }
      return next;
    });
  };

  const deselectAll = () => {
    setFolderSelections((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = { ...next[key], selected: false };
      }
      return next;
    });
  };

  const collectFolderImportItems = useCallback((): FolderImportItem[] => {
    if (!parseResult) return [];

    const items: FolderImportItem[] = [];

    const walk = (
      folders: ParsedBookmarkFolder[],
      pathPrefix: string
    ) => {
      folders.forEach((folder, idx) => {
        const key = `${pathPrefix}/${idx}-${folder.title}`;
        const sel = folderSelections[key];
        if (!sel?.selected) return;

        const directBookmarks = folder.children.filter(isBookmarkLink);
        if (directBookmarks.length > 0) {
          items.push({
            folderTitle: folder.title,
            category: sel.category || "tools",
            tags: ["imported", "bookmarks"],
            bookmarks: directBookmarks.map((bm) => ({
              title: bm.title,
              url: bm.url,
              icon: bm.icon || "",
            })),
          });
        }

        const subFolders = folder.children.filter(isBookmarkFolder);
        if (subFolders.length > 0) {
          walk(subFolders, key);
        }
      });
    };

    walk(parseResult.roots, "");
    return items;
  }, [parseResult, folderSelections]);

  const handleImport = async () => {
    const importItems = collectFolderImportItems();
    if (importItems.length === 0) {
      toast.error(t("noFoldersSelected"));
      return;
    }

    setIsImporting(true);
    setImportProgress(10);

    try {
      setImportProgress(30);

      const res = await fetch("/api/bookmarks/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folders: importItems }),
      });

      setImportProgress(80);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t("importError"));
      }

      const result = await res.json();
      setImportProgress(100);
      setImportResult({
        totalCollections: result.totalCollections,
        totalLinks: result.totalLinks,
      });
      toast.success(
        t("importSuccess", {
          collections: result.totalCollections,
          links: result.totalLinks,
        })
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("importError")
      );
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCount = Object.values(folderSelections).filter(
    (s) => s.selected
  ).length;

  const renderBookmarkNode = (
    node: ParsedBookmarkNode,
    index: number
  ) => {
    if (isBookmarkLink(node)) {
      return (
        <div
          key={`link-${index}-${node.url}`}
          className="flex items-center gap-2 py-1 pl-6 text-sm"
        >
          {node.icon ? (
            <img
              src={node.icon}
              alt=""
              className="w-4 h-4 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Link2 size={14} className="text-muted-foreground shrink-0" />
          )}
          <span className="truncate text-muted-foreground" title={node.url}>
            {node.title}
          </span>
        </div>
      );
    }
    return null;
  };

  const renderFolder = (
    folder: ParsedBookmarkFolder,
    index: number,
    pathPrefix: string
  ) => {
    const key = `${pathPrefix}/${index}-${folder.title}`;
    const sel = folderSelections[key];
    if (!sel) return null;

    const bookmarkCount = countBookmarks(folder.children);
    const directBookmarks = folder.children.filter(isBookmarkLink);
    const subFolders = folder.children.filter(isBookmarkFolder);

    return (
      <div key={key} className="space-y-1">
        <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent/50 transition-colors group">
          <button
            type="button"
            onClick={() => toggleFolder(key)}
            className="shrink-0 text-muted-foreground"
          >
            {sel.expanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          <Checkbox
            checked={sel.selected}
            onCheckedChange={() => toggleFolderSelection(key)}
          />

          <FolderOpen size={16} className="text-amber-500 shrink-0" />

          <span className="font-medium text-sm truncate flex-1">
            {folder.title}
          </span>

          <Badge variant="secondary" className="text-xs shrink-0">
            {bookmarkCount}
          </Badge>

          {sel.selected && (
            <Select
              value={sel.category}
              onValueChange={(v) => setFolderCategory(key, v)}
            >
              <SelectTrigger className="h-7 w-28 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {ct(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {sel.expanded && (
          <div className="ml-6 border-l border-border/50 pl-2 space-y-0.5">
            {directBookmarks.map((bm, i) => renderBookmarkNode(bm, i))}
            {subFolders.map((sub, i) => renderFolder(sub, i, key))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!parseResult && (
        <Card className="glass-effect border-border/30 bg-card/60">
          <CardContent className="pt-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                transition-all duration-200
                ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border/50 hover:border-primary/50 hover:bg-accent/30"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload size={28} className="text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {t("uploadTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("uploadDescription")}
                  </p>
                </div>
                <Button variant="outline" className="mt-2" type="button">
                  <FileUp size={16} className="mr-2" />
                  {t("selectFile")}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {t("supportedFormats")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parse Result Preview */}
      {parseResult && !importResult && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="glass-effect border-border/30 bg-card/60">
              <CardContent className="pt-4 pb-4 text-center">
                <FolderOpen
                  size={20}
                  className="mx-auto mb-1 text-amber-500"
                />
                <p className="text-2xl font-bold">{parseResult.totalFolders}</p>
                <p className="text-xs text-muted-foreground">
                  {t("totalFolders")}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-effect border-border/30 bg-card/60">
              <CardContent className="pt-4 pb-4 text-center">
                <BookmarkIcon
                  size={20}
                  className="mx-auto mb-1 text-blue-500"
                />
                <p className="text-2xl font-bold">
                  {parseResult.totalBookmarks}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("totalBookmarks")}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-effect border-border/30 bg-card/60">
              <CardContent className="pt-4 pb-4 text-center">
                <Check size={20} className="mx-auto mb-1 text-green-500" />
                <p className="text-2xl font-bold">{selectedCount}</p>
                <p className="text-xs text-muted-foreground">
                  {t("selectedFolders")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Folder Tree */}
          <Card className="glass-effect border-border/30 bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen size={18} />
                  {t("previewTitle")}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAll}
                    className="text-xs"
                  >
                    {t("selectAll")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deselectAll}
                    className="text-xs"
                  >
                    {t("deselectAll")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setParseResult(null);
                      setFolderSelections({});
                    }}
                    className="text-xs"
                  >
                    {t("reupload")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-1">
                  {parseResult.roots.map((folder, idx) =>
                    renderFolder(folder, idx, "")
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Import Actions */}
          <Card className="glass-effect border-border/30 bg-card/60">
            <CardContent className="pt-6 space-y-4">
              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                    {t("importing")}
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("importHint", { count: selectedCount })}
                </p>
                <Button
                  onClick={handleImport}
                  disabled={isImporting || selectedCount === 0}
                  className="bg-brand-gradient hover:opacity-90 transition-opacity min-w-[160px]"
                >
                  {isImporting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      {t("importing")}
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      {t("importButton")}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Import Success */}
      {importResult && (
        <Card className="glass-effect border-border/30 bg-card/60">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <Check size={28} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {t("importComplete")}
              </h3>
              <p className="text-muted-foreground mt-1">
                {t("importSummary", {
                  collections: importResult.totalCollections,
                  links: importResult.totalLinks,
                })}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setParseResult(null);
                  setFolderSelections({});
                  setImportResult(null);
                  setImportProgress(0);
                }}
              >
                {t("importMore")}
              </Button>
              <Button
                className="bg-brand-gradient hover:opacity-90 transition-opacity"
                asChild
              >
                <Link href="/">{commonT("home")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Info */}
      {!parseResult && (
        <Card className="glass-effect border-border/30 bg-card/60">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-muted-foreground mt-0.5 shrink-0"
              />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{t("helpTitle")}</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t("helpChrome")}</li>
                  <li>{t("helpFirefox")}</li>
                  <li>{t("helpSafari")}</li>
                  <li>{t("helpEdge")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
