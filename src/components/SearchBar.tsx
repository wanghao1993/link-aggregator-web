import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch = () => console.log("Search triggered"),
  onFilter = () => console.log("Filter triggered"),
  placeholder,
}) => {
  const t = useTranslations("common");
  const [query, setQuery] = useState("");

  console.log("SearchBar component rendered with query:", query);

  const handleSearch = () => {
    onSearch(query);
    console.log("Searching for:", query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div data-cmp="SearchBar" className="relative max-w-2xl mx-auto">
      <div className="relative flex items-center space-x-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <Input
            type="text"
            placeholder={placeholder || t("search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-11 pr-4 py-3 glass-effect border-border/30 focus:border-primary/50 text-foreground placeholder-muted-foreground bg-card/50"
          />
        </div>

        <Button
          onClick={handleSearch}
          className="bg-brand-gradient hover:opacity-90 transition-opacity px-6"
        >
          {t("searchButton")}
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
