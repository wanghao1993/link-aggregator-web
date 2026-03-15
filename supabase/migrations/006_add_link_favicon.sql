-- Add favicon column to collection_links
ALTER TABLE collection_links ADD COLUMN IF NOT EXISTS favicon TEXT DEFAULT '';
