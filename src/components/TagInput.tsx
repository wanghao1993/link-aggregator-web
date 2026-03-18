"use client";

import * as React from "react";
import { X, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const TAG_COLORS: Record<string, string> = {
  default: "bg-muted text-muted-foreground",
  red: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  orange:
    "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
  yellow:
    "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  green:
    "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20",
  blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  purple:
    "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
  pink: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/20",
};

export default function TagInput({
  value = [],
  onChange,
  maxTags = 3,
  placeholder = "Select or type tags...",
  className,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [availableTags, setAvailableTags] = React.useState<Tag[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Fetch available tags
  React.useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("/api/tags");
        if (res.ok) {
          const data = await res.json();
          setAvailableTags(data.tags || []);
        }
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    }
    fetchTags();
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  };

  const removeTag = (tagName: string) => {
    onChange(value.filter((t) => t !== tagName));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const filteredSuggestions = availableTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(tag.name),
  );

  const canAddMore = value.length < maxTags;
  const showCreateOption =
    inputValue.trim() &&
    !availableTags.some(
      (t) => t.name.toLowerCase() === inputValue.toLowerCase(),
    );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input container */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "focus-within:ring-1 focus-within:ring-ring/30 focus-within:border-ring/50",
          disabled && "cursor-not-allowed opacity-50",
        )}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {/* Selected tags */}
        {value.map((tag) => {
          const tagData = availableTags.find((t) => t.name === tag);
          const colorClass = tagData?.color
            ? TAG_COLORS[tagData.color] || TAG_COLORS.default
            : TAG_COLORS.default;
          return (
            <Badge
              key={tag}
              variant="secondary"
              className={cn(
                "gap-1.5 px-2.5 py-1 text-xs font-medium border transition-all",
                colorClass,
              )}
            >
              {tag}
              <button
                type="button"
                className="rounded-full hover:bg-black/10 dark:hover:bg-white/20 p-0.5 -mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                disabled={disabled}
              >
                <X size={12} />
              </button>
            </Badge>
          );
        })}

        {/* Input field */}
        {canAddMore && !disabled && (
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[100px] bg-transparent outline-none placeholder:text-muted-foreground/60 text-sm"
          />
        )}

        {/* Counter */}
        <span className="text-xs text-muted-foreground/50 ml-auto tabular-nums">
          {value.length}/{maxTags}
        </span>
      </div>

      {/* Dropdown */}
      {showDropdown && canAddMore && !disabled && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 rounded-xl border border-border/50 bg-popover shadow-lg shadow-black/5 overflow-hidden">
          <div className="max-h-60 overflow-auto p-1">
            {/* Create new tag option */}
            {showCreateOption && (
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors"
                onClick={() => {
                  addTag(inputValue);
                  if (value.length >= maxTags - 1) {
                    setShowDropdown(false);
                  }
                }}
              >
                <Plus size={16} className="shrink-0" />
                <span>Create &quot;{inputValue.trim()}&quot;</span>
              </button>
            )}

            {/* Existing tags */}
            {filteredSuggestions.length > 0 && (
              <div
                className={cn(
                  showCreateOption && "border-t border-border/50 mt-1 pt-1",
                )}
              >
                {filteredSuggestions.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      addTag(tag.name);
                      if (value.length >= maxTags - 1) {
                        setShowDropdown(false);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0",
                        tag.color && TAG_COLORS[tag.color]
                          ? TAG_COLORS[tag.color].split(" ")[0]
                          : "bg-muted-foreground/40",
                      )}
                    />
                    <span className="flex-1 text-left">{tag.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!showCreateOption && filteredSuggestions.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Type to create a new tag
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
