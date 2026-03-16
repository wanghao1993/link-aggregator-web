"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ExternalLink,
  Globe,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

interface Collection {
  id: string;
  title: string;
  description: string;
  category: string;
  views: number;
  likes: number;
  is_public: boolean;
  created_at: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function CollectionsAdminPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  useEffect(() => {
    fetchCollections();
  }, [page, sortBy, sortOrder]);

  async function fetchCollections(search?: string) {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sortBy,
        sortOrder,
      });
      if (search || searchQuery) {
        queryParams.set("search", search || searchQuery);
      }

      const res = await fetch(`/api/admin/collections?${queryParams}`);
      const data = await res.json();
      setCollections(data.collections || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch collections");
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
    fetchCollections(value);
  };

  function openDeleteDialog(collection: Collection) {
    setSelectedCollection(collection);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!selectedCollection) return;

    try {
      const res = await fetch(`/api/admin/collections?id=${selectedCollection.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Collection deleted");
      setDeleteDialogOpen(false);
      fetchCollections();
    } catch {
      toast.error("Failed to delete collection");
    }
  }

  async function togglePublic(collection: Collection) {
    try {
      const res = await fetch("/api/admin/collections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: collection.id,
          is_public: !collection.is_public,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(collection.is_public ? "Collection set to private" : "Collection set to public");
      fetchCollections();
    } catch {
      toast.error("Failed to update");
    }
  }

  function viewCollection(id: string) {
    window.open(`/${locale}/collection/${id}`, "_blank");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Collections</h1>
        <p className="text-muted-foreground">Manage all collections</p>
      </div>

      {/* Search & Sort */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Created</SelectItem>
            <SelectItem value="views">Views</SelectItem>
            <SelectItem value="likes">Likes</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          <ArrowUpDown size={16} />
        </Button>
      </div>

      {/* Collections Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Title</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Author</th>
                  <th className="text-center p-4 font-medium">Views</th>
                  <th className="text-center p-4 font-medium">Likes</th>
                  <th className="text-center p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    </td>
                  </tr>
                ) : collections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      {searchQuery ? "No collections found" : "No collections yet"}
                    </td>
                  </tr>
                ) : (
                  collections.map((collection) => (
                    <tr key={collection.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{collection.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {collection.description || "No description"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{collection.category}</Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {collection.author?.name || "Unknown"}
                      </td>
                      <td className="p-4 text-center">{collection.views.toLocaleString()}</td>
                      <td className="p-4 text-center">{collection.likes}</td>
                      <td className="p-4 text-center">
                        <Badge variant={collection.is_public ? "default" : "secondary"}>
                          {collection.is_public ? (
                            <Globe size={12} className="mr-1" />
                          ) : (
                            <Lock size={12} className="mr-1" />
                          )}
                          {collection.is_public ? "Public" : "Private"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewCollection(collection.id)}
                            title="View"
                          >
                            <ExternalLink size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePublic(collection)}
                            title={collection.is_public ? "Make Private" : "Make Public"}
                          >
                            {collection.is_public ? <Eye size={16} /> : <EyeOff size={16} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(collection)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete &quot;{selectedCollection?.title}&quot;? This will also delete all links in this collection. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
