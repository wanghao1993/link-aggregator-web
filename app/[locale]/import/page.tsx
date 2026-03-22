"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { parseBookmarkHtml, countBookmarks, flattenBookmarks } from "@/lib/bookmarks/parser";
import type { BookmarkParseResult } from "@/types/bookmark";
import { ArrowLeft, Upload, FileText, Folder, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";

interface ImportedCollection {
  id: string;
  title: string;
  linkCount: number;
}

interface ImportResult {
  success: boolean;
  collections?: ImportedCollection[];
  error?: string;
}

interface ParsedData {
  result: BookmarkParseResult;
  folderData: FolderPreview[];
}

interface FolderPreview {
  title: string;
  bookmarkCount: number;
  selected: boolean;
  category: string;
  tags: string;
}

const CATEGORIES = [
  { value: "ai", label: "AI" },
  { value: "web", label: "Web" },
  { value: "design", label: "Design" },
  { value: "mobile", label: "Mobile" },
  { value: "devops", label: "DevOps" },
  { value: "data", label: "Data" },
  { value: "security", label: "Security" },
  { value: "productivity", label: "Productivity" },
  { value: "tools", label: "Tools" },
];

export default function ImportBookmarksPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations("bookmarkImport");
  const commonT = useTranslations("common");
  
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    if (!selectedFile.name.toLowerCase().endsWith('.html')) {
      toast.error(t("invalidFileType"));
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setParsedData(null);
    setImportResult(null);

    try {
      const text = await selectedFile.text();
      const result = parseBookmarkHtml(text);
      
      const folderData: FolderPreview[] = result.roots.map(folder => ({
        title: folder.title,
        bookmarkCount: countBookmarks([folder]),
        selected: true,
        category: "tools",
        tags: "imported,bookmarks"
      }));

      setParsedData({ result, folderData });
      toast.success(t("parseSuccess"));
    } catch (error) {
      console.error("Parse error:", error);
      toast.error(t("parseError"));
    } finally {
      setIsParsing(false);
    }
  }, [t]);

  const handleFolderToggle = useCallback((index: number) => {
    if (!parsedData) return;
    const newFolderData = [...parsedData.folderData];
    newFolderData[index].selected = !newFolderData[index].selected;
    setParsedData({ ...parsedData, folderData: newFolderData });
  }, [parsedData]);

  const handleFolderChange = useCallback((index: number, field: 'category' | 'tags', value: string) => {
    if (!parsedData) return;
    const newFolderData = [...parsedData.folderData];
    newFolderData[index][field] = value;
    setParsedData({ ...parsedData, folderData: newFolderData });
  }, [parsedData]);

  const handleImport = useCallback(async () => {
    if (!parsedData || !user) return;

    const selectedFolders = parsedData.folderData.filter(f => f.selected);
    if (selectedFolders.length === 0) {
      toast.error(t("selectAtLeastOne"));
      return;
    }

    setIsImporting(true);

    try {
      const foldersToImport = selectedFolders.map(folder => {
        const originalFolder = parsedData.result.roots.find(f => f.title === folder.title);
        const bookmarks = originalFolder ? flattenBookmarks([originalFolder]) : [];
        
        return {
          folderTitle: folder.title,
          category: folder.category,
          tags: folder.tags.split(",").map(t => t.trim()).filter(Boolean),
          bookmarks: bookmarks.map(bm => ({
            title: bm.title,
            url: bm.url,
            description: "",
            icon: bm.icon || ""
          }))
        };
      });

      const res = await fetch("/api/bookmarks/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folders: foldersToImport })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("importError"));
      }

      setImportResult({
        success: true,
        collections: data.collections
      });
      toast.success(t("importSuccess"));
    } catch (error: unknown) {
      console.error("Import error:", error);
      setImportResult({ success: false, error: (error as Error).message });
      toast.error((error as Error).message || t("importError"));
    } finally {
      setIsImporting(false);
    }
  }, [parsedData, user, t]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{commonT("loading")}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-effect border-border/30 bg-card/60 max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Upload size={28} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t("loginRequired")}
              </h2>
              <p className="text-muted-foreground">
                {t("loginRequiredDesc")}
              </p>
            </div>
            <Button
              className="bg-brand-gradient hover:opacity-90 transition-opacity"
              asChild
            >
              <Link href="/auth/signin">{t("goToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedCount = parsedData?.folderData.filter(f => f.selected).length || 0;
  const totalBookmarks = parsedData?.folderData.reduce((sum, f) => sum + (f.selected ? f.bookmarkCount : 0), 0) || 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} className="mr-2" />
          {commonT("back")}
        </Button>

        <div className="mb-8 fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center">
              <Upload className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                {t("pageTitle")}
              </h1>
              <p className="text-muted-foreground">{t("pageSubtitle")}</p>
            </div>
          </div>
        </div>

        {/* 导入成功结果 */}
        {importResult?.success && (
          <Card className="mb-6 border-green-500/30 bg-green-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="text-green-500" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-green-500">{t("importSuccess")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("importedCount", { count: importResult.collections?.length || 0 })}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {importResult.collections?.map((col: ImportedCollection) => (
                  <Link
                    key={col.id}
                    href={`/collection/${col.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <span className="font-medium">{col.title}</span>
                    <Badge variant="secondary">{col.linkCount} {t("links")}</Badge>
                  </Link>
                ))}
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => {
                  setFile(null);
                  setParsedData(null);
                  setImportResult(null);
                }}
              >
                {t("importMore")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 文件上传 */}
        {!parsedData && !importResult && (
          <Card>
            <CardContent className="pt-6">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <input
                  type="file"
                  accept=".html"
                  onChange={handleFileChange}
                  className="hidden"
                  id="bookmark-file"
                  disabled={isParsing}
                />
                <label htmlFor="bookmark-file" className="cursor-pointer">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {isParsing ? (
                      <Loader2 className="text-primary animate-spin" size={28} />
                    ) : (
                      <FileText className="text-primary" size={28} />
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{t("uploadTitle")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("uploadDesc")}
                  </p>
                  <Button disabled={isParsing}>
                    {isParsing ? t("parsing") : t("selectFile")}
                  </Button>
                </label>
              </div>
              
              <Separator className="my-6" />

              <div className="text-sm text-muted-foreground">
                <h4 className="font-medium text-foreground mb-3">{t("helpTitle")}</h4>

                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <h5 className="font-medium text-blue-400 mb-2">🔹 Google Chrome</h5>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>打开书签管理器：<kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+Shift+O</kbd> (Mac: <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">⌘+Option+B</kbd>)</li>
                      <li>点击右上角 <strong>⋮</strong> 菜单</li>
                      <li>选择 <strong>导出书签</strong></li>
                    </ol>
                  </div>

                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <h5 className="font-medium text-orange-400 mb-2">🦊 Mozilla Firefox</h5>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>点击菜单 → <strong>书签</strong></li>
                      <li>选择 <strong>管理书签</strong></li>
                      <li>点击 <strong>导入与备份</strong> → <strong>将书签导出为 HTML</strong></li>
                    </ol>
                  </div>

                  <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <h5 className="font-medium text-cyan-400 mb-2">🌐 Microsoft Edge</h5>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>打开收藏夹：<kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+Shift+O</kbd></li>
                      <li>点击 <strong>⋯</strong> 菜单</li>
                      <li>选择 <strong>导出收藏夹</strong></li>
                    </ol>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                    <h5 className="font-medium text-gray-400 mb-2">🧭 Apple Safari</h5>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>菜单栏 → <strong>文件</strong></li>
                      <li>选择 <strong>导出书签…</strong></li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 解析结果预览 */}
        {parsedData && !importResult && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} />
                  {t("parseResult")}
                  <Badge variant="secondary" className="ml-auto">
                    {parsedData.result.totalFolders} {t("folders")}, {parsedData.result.totalBookmarks} {t("bookmarks")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parsedData.folderData.map((folder, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-colors ${
                        folder.selected
                          ? "border-primary/50 bg-primary/5"
                          : "border-border bg-background/50 opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={folder.selected}
                          onChange={() => handleFolderToggle(index)}
                          className="mt-1 w-4 h-4"
                        />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <Folder size={16} className="text-muted-foreground" />
                            <span className="font-medium">{folder.title}</span>
                            <Badge variant="outline" className="ml-auto">
                              {folder.bookmarkCount} {t("links")}
                            </Badge>
                          </div>
                          
                          {folder.selected && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">{t("category")}</Label>
                                <Select
                                  value={folder.category}
                                  onValueChange={(v) => handleFolderChange(index, "category", v)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CATEGORIES.map(cat => (
                                      <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">{t("tags")}</Label>
                                <Input
                                  value={folder.tags}
                                  onChange={(e) => handleFolderChange(index, "tags", e.target.value)}
                                  placeholder="imported,bookmarks"
                                  className="h-8"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t("selectedInfo", { count: selectedCount, links: totalBookmarks })}
              </div>
              <Button
                onClick={handleImport}
                disabled={selectedCount === 0 || isImporting}
                className="bg-brand-gradient"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("importing")}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {t("importBtn", { count: selectedCount })}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
