-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection links table
CREATE TABLE IF NOT EXISTS collection_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_category ON collections(category);
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON collections(is_public);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collection_links_collection_id ON collection_links(collection_id);

-- Trigger for updated_at
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collections
CREATE POLICY "Public collections are viewable by everyone" ON collections
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own collections" ON collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON collections
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for collection_links
CREATE POLICY "Links of public collections are viewable" ON collection_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collections WHERE collections.id = collection_links.collection_id AND collections.is_public = true
    )
  );

CREATE POLICY "Users can manage links in own collections" ON collection_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM collections WHERE collections.id = collection_links.collection_id AND collections.user_id = auth.uid()
    )
  );
