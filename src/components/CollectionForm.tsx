"use client";

import React, { useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Link2, GripVertical, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

const linkSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  description: z.string(),
  favicon: z.string().optional(),
});

const collectionSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  category: z.string().min(1),
  tags: z.string(),
  links: z.array(linkSchema).min(1),
});

export type CollectionFormValues = z.infer<typeof collectionSchema>;

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

interface CollectionFormProps {
  defaultValues?: CollectionFormValues;
  onSubmit: (data: CollectionFormValues) => Promise<void>;
  isEdit?: boolean;
}

interface LinkPreviewData {
  title: string;
  description: string;
  image: string;
  favicon: string;
  siteName: string;
}

export default function CollectionForm({
  defaultValues,
  onSubmit,
  isEdit = false,
}: CollectionFormProps) {
  const t = useTranslations("collectionForm");
  const ct = useTranslations("categories");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [fetchingPreview, setFetchingPreview] = useState<Record<number, boolean>>({});

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: defaultValues ?? {
      title: "",
      description: "",
      category: "",
      tags: "",
      links: [{ title: "", url: "", description: "", favicon: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "links",
  });

  const fetchLinkPreview = useCallback(async (url: string, index: number) => {
    if (!url || !url.startsWith("http")) return;

    setFetchingPreview((prev) => ({ ...prev, [index]: true }));
    try {
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        console.warn("Failed to fetch link preview");
        return;
      }

      const data: LinkPreviewData = await response.json();

      // Auto-fill only if fields are empty
      const currentTitle = form.getValues(`links.${index}.title`);
      const currentDesc = form.getValues(`links.${index}.description`);

      if (data.title && !currentTitle) {
        form.setValue(`links.${index}.title`, data.title);
      }
      if (data.description && !currentDesc) {
        form.setValue(`links.${index}.description`, data.description);
      }
      if (data.favicon) {
        form.setValue(`links.${index}.favicon`, data.favicon);
      }

      if (data.title || data.description) {
        toast.success("Link info fetched automatically!");
      }
    } catch (error) {
      console.error("Error fetching link preview:", error);
    } finally {
      setFetchingPreview((prev) => ({ ...prev, [index]: false }));
    }
  }, [form]);

  const handleUrlBlur = (url: string, index: number) => {
    if (url && url.startsWith("http")) {
      fetchLinkPreview(url, index);
    }
  };

  const handleSubmit = async (data: CollectionFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Basic Info */}
        <Card className="glass-effect border-border/30 bg-card/60">
          <CardContent className="pt-6 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("title")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("titlePlaceholder")}
                      className="bg-background/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("descriptionPlaceholder")}
                      className="bg-background/50 min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("category")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue
                            placeholder={t("categoryPlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {ct(cat)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("tags")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("tagsPlaceholder")}
                        className="bg-background/50"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t("tagsHelp")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Links Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Link2 size={20} />
              {t("links")} ({fields.length})
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ title: "", url: "", description: "", favicon: "" })}
              className="glass-effect"
            >
              <Plus size={16} className="mr-1" />
              {t("addLink")}
            </Button>
          </div>

          {form.formState.errors.links?.root && (
            <p className="text-sm text-destructive">
              {t("validation.atLeastOneLink")}
            </p>
          )}

          {fields.length === 0 ? (
            <Card className="glass-effect border-border/30 bg-card/60 border-dashed">
              <CardContent className="py-12 text-center">
                <Link2
                  size={32}
                  className="mx-auto mb-3 text-muted-foreground"
                />
                <p className="text-muted-foreground">{t("noLinks")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className="glass-effect border-border/30 bg-card/60"
                >
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3">
                      <div className="pt-2 text-muted-foreground">
                        <GripVertical size={16} />
                      </div>
                      <div className="flex-1 space-y-4">
                        {/* URL Field with auto-fetch */}
                        <FormField
                          control={form.control}
                          name={`links.${index}.url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("linkUrl")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder={t("linkUrlPlaceholder")}
                                    className="bg-background/50 pl-10 pr-10"
                                    {...field}
                                    onBlur={(e) => {
                                      field.onBlur();
                                      handleUrlBlur(e.target.value, index);
                                    }}
                                  />
                                  {fetchingPreview[index] && (
                                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                                  )}
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs">
                                Paste URL and title/description will be fetched automatically
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`links.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("linkTitle")} #{index + 1}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t("linkTitlePlaceholder")}
                                    className="bg-background/50"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Favicon preview */}
                          <FormField
                            control={form.control}
                            name={`links.${index}.favicon`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Site Icon</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-2 h-10 bg-background/50 rounded-md border px-3">
                                    {field.value ? (
                                      <img
                                        src={field.value}
                                        alt="Site favicon"
                                        className="w-5 h-5"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <Globe className="w-5 h-5 text-muted-foreground" />
                                    )}
                                    <span className="text-sm text-muted-foreground truncate">
                                      {field.value ? "Icon loaded" : "Will be fetched from URL"}
                                    </span>
                                  </div>
                                </FormControl>
                                <input type="hidden" {...field} />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`links.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("linkDescription")}</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={t("linkDescriptionPlaceholder")}
                                  className="bg-background/50 min-h-[60px] resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Separator className="border-border/30" />

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 min-w-[160px]"
          >
            {isSubmitting
              ? isEdit
                ? t("updating")
                : t("submitting")
              : isEdit
                ? t("update")
                : t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
