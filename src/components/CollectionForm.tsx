"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Link2, GripVertical } from "lucide-react";
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

const linkSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  description: z.string(),
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

export default function CollectionForm({
  defaultValues,
  onSubmit,
  isEdit = false,
}: CollectionFormProps) {
  const t = useTranslations("collectionForm");
  const ct = useTranslations("categories");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: defaultValues ?? {
      title: "",
      description: "",
      category: "",
      tags: "",
      links: [{ title: "", url: "", description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "links",
  });

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
              onClick={() => append({ title: "", url: "", description: "" })}
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
                          <FormField
                            control={form.control}
                            name={`links.${index}.url`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("linkUrl")}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t("linkUrlPlaceholder")}
                                    className="bg-background/50"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
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
