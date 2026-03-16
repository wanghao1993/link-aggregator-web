"use client";

import React, { useState, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { themes, applyTheme, getCurrentTheme, type ThemeConfig } from "@/styles/themes";

interface ThemeColorSelectorProps {
  className?: string;
}

const ThemeColorSelector: React.FC<ThemeColorSelectorProps> = ({ className }) => {
  const [currentTheme, setCurrentTheme] = useState<string>("default");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCurrentTheme(getCurrentTheme());
  }, []);

  const handleSelectTheme = (themeName: string) => {
    applyTheme(themeName);
    setCurrentTheme(themeName);
    setOpen(false);
  };

  // Get a preview color for each theme
  const getThemePreviewColor = (theme: ThemeConfig): string => {
    const [r, g, b] = theme.colors.primary.split(" ").map(Number);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          title="Change theme color"
        >
          <Palette className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Theme Color
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleSelectTheme(theme.name)}
                className={`
                  relative w-10 h-10 rounded-lg transition-transform hover:scale-110
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                  ${currentTheme === theme.name ? "ring-2 ring-primary ring-offset-2" : ""}
                `}
                style={{ backgroundColor: getThemePreviewColor(theme) }}
                title={theme.label}
              >
                {currentTheme === theme.name && (
                  <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Choose your preferred accent color
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeColorSelector;
