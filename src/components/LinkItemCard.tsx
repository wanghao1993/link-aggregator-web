import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';

interface LinkCardProps {
  title: string;
  url: string;
  description?: string;
  favicon?: string;
}

export default function LinkCard({ title, url, description, favicon }: LinkCardProps) {
  const getDomain = (urlString: string) => {
    try {
      return new URL(urlString).hostname.replace(/^www\./, '');
    } catch {
      return urlString;
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0 overflow-hidden">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              className="w-6 h-6 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<svg class="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
              }}
            />
          ) : (
            <Globe className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {title}
            </h4>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
          <p className="text-sm text-muted-foreground truncate">{getDomain(url)}</p>
          {description && (
            <p className="text-sm text-foreground/70 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
