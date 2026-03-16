-- Categories table for dynamic category management
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_key TEXT NOT NULL UNIQUE, -- i18n key like 'ai', 'web', etc.
  slug TEXT NOT NULL UNIQUE, -- URL-friendly slug
  icon TEXT DEFAULT '📁', -- Emoji or icon name
  color TEXT DEFAULT 'default', -- Color theme: purple, blue, green, etc.
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles for admin access
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Tags table for dynamic tag management
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  color TEXT DEFAULT 'default',
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, name_key, slug, icon, color, description, sort_order) VALUES
  ('AI/ML', 'ai', 'ai-ml', '🤖', 'purple', 'Artificial Intelligence and Machine Learning', 1),
  ('Web Development', 'web', 'web-dev', '💻', 'blue', 'Web development resources and tools', 2),
  ('Design', 'design', 'design', '🎨', 'pink', 'UI/UX Design and creative tools', 3),
  ('Mobile Development', 'mobile', 'mobile-dev', '📱', 'green', 'iOS and Android development', 4),
  ('DevOps', 'devops', 'devops', '⚙️', 'orange', 'DevOps, CI/CD and infrastructure', 5),
  ('Data Science', 'data', 'data-science', '📊', 'cyan', 'Data science and analytics', 6),
  ('Security', 'security', 'security', '🔐', 'red', 'Cybersecurity and privacy', 7),
  ('Productivity', 'productivity', 'productivity', '⚡', 'yellow', 'Productivity tools and workflows', 8),
  ('Tools', 'tools', 'tools', '🛠️', 'slate', 'General purpose tools and utilities', 9)
ON CONFLICT (name_key) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_tags_is_active ON tags(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (publicly readable, admin writable)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
  ));

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
  ));

-- RLS Policies for tags (publicly readable, admin writable)
CREATE POLICY "Tags are viewable by everyone" ON tags
  FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
  ));

CREATE POLICY "Admins can manage tags" ON tags
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
  ));

-- Function to increment tag usage count
CREATE OR REPLACE FUNCTION increment_tag_usage(tag_name TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO tags (name, slug, usage_count)
  VALUES (tag_name, lower(regexp_replace(tag_name, '[^a-zA-Z0-9]', '-', 'g')), 1)
  ON CONFLICT (name) DO UPDATE SET usage_count = tags.usage_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement tag usage count
CREATE OR REPLACE FUNCTION decrement_tag_usage(tag_name TEXT)
RETURNS void AS $$
BEGIN
  UPDATE tags SET usage_count = GREATEST(0, usage_count - 1) WHERE name = tag_name;
END;
$$ LANGUAGE plpgsql;

-- Create admin_settings table for site-wide configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB DEFAULT '{}',
  description TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Enable RLS for admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access admin_settings
CREATE POLICY "Admins can manage settings" ON admin_settings
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
  ));

-- Insert default settings
INSERT INTO admin_settings (key, value, description) VALUES
  ('site_name', '"LinkHub"', 'Site display name'),
  ('site_description', '"Discover and share curated link collections"', 'Site description for SEO'),
  ('items_per_page', '12', 'Number of items per page'),
  ('enable_user_registration', 'true', 'Allow new user registration'),
  ('enable_collections_creation', 'true', 'Allow users to create collections')
ON CONFLICT (key) DO NOTHING;

-- Create admin_audit_log for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'category', 'tag', 'collection', 'user', 'setting'
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_entity ON admin_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);

-- Enable RLS for audit log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super_admins can view audit log
CREATE POLICY "Super admins can view audit log" ON admin_audit_log
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'
  ));

-- Admins can insert audit log entries
CREATE POLICY "Admins can create audit log" ON admin_audit_log
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
  ));

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO admin_audit_log (admin_id, action, entity_type, entity_id, old_value, new_value)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_old_value, p_new_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
