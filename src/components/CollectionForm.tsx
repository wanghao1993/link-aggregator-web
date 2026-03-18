"use client";

import React, { useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Link2,
  Loader2,
  Globe,
  Tag,
  CheckCircle2,
} from "lucide-react";
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
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import TagInput from "@/components/TagInput";
import { cn } from "@/lib/utils";

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
  tags: z.array(z.string()).max(3, "Maximum 3 tags allowed"),
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
  const [fetchingPreview, setFetchingPreview] = useState<
    Record<number, boolean>
  >({});

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: defaultValues ?? {
      title: "",
      description: "",
      category: "",
      tags: [],
      links: [{ title: "", url: "", description: "", favicon: "" }],
    },
  });

  React.useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "links",
  });

  const fetchLinkPreview = useCallback(
    async (url: string, index: number) => {
      if (!url || !url.startsWith("http")) return;

      setFetchingPreview((prev) => ({ ...prev, [index]: true }));
      try {
        const response = await fetch(
          `/api/link-preview?url=${encodeURIComponent(url)}`,
        );
        if (!response.ok) return;

        const data: LinkPreviewData = await response.json();

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
          toast.success(t("linkInfoFetched"));
        }
      } catch (error) {
        console.error("Error fetching link preview:", error);
      } finally {
        setFetchingPreview((prev) => ({ ...prev, [index]: false }));
      }
    },
    [form, t],
  );

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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("title")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("titlePlaceholder")} {...field} />
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
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between items-center">
                  <FormMessage />
                  <span className="text-xs text-muted-foreground ml-auto">
                    {field.value.length}/500
                  </span>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("category")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("categoryPlaceholder")} />
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
                <FormLabel className="flex items-center gap-2">
                  <Tag size={14} />
                  {t("tags")}
                </FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    maxTags={3}
                    placeholder={t("tagsPlaceholder")}
                  />
                </FormControl>
                <FormDescription>{t("tagsHelp")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Links Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-medium">{t("links")}</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ title: "", url: "", description: "", favicon: "" })
              }
              className="gap-1"
            >
              <Plus size={14} />
              {t("addLink")}
            </Button>
          </div>

          {form.formState.errors.links?.root && (
            <p className="text-sm text-destructive">
              {t("validation.atLeastOneLink")}
            </p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative border rounded-lg p-4 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                      "disabled:opacity-30 disabled:cursor-not-allowed",
                      "opacity-0 group-hover:opacity-100",
                    )}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name={`links.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          {t("linkUrl")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder={t("linkUrlPlaceholder")}
                              className="pl-9 pr-9"
                              {...field}
                              onBlur={(e) => {
                                field.onBlur();
                                handleUrlBlur(e.target.value, index);
                              }}
                            />
                            {fetchingPreview[index] && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`links.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            {t("linkTitle")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("linkTitlePlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`links.${index}.favicon`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Site Icon</FormLabel>
                          <FormControl>
                            <div className="h-11 flex items-center gap-2 bg-muted/50 rounded-md border px-3">
                              {field.value ? (
                                <img
                                  src={field.value}
                                  alt=""
                                  className="w-4 h-4 rounded"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              ) : (
                                <Globe className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {field.value ? "Loaded" : "Auto-fetched"}
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
                        <FormLabel className="text-xs">
                          {t("linkDescription")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("linkDescriptionPlaceholder")}
                            className="min-h-[60px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEdit ? t("updating") : t("submitting")}
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isEdit ? t("update") : t("submit")}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
