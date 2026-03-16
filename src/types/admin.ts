// Category types
export interface Category {
  id: string;
  name: string;
  name_key: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryInput {
  name: string;
  name_key: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

// Tag types
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TagInput {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  is_active?: boolean;
}

// User role types
export type UserRole = 'user' | 'admin' | 'super_admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_login?: string;
}

// Admin settings
export interface AdminSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description: string;
  updated_at: string;
  updated_by?: string;
}

// Audit log
export interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// Color options for categories/tags
export const COLOR_OPTIONS = [
  { value: 'default', label: 'Default', class: 'bg-gray-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
  { value: 'slate', label: 'Slate', class: 'bg-slate-500' },
] as const;

export type ColorValue = (typeof COLOR_OPTIONS)[number]['value'];
