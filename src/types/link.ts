export interface LinkItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: Category;
  author: User;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  linkCount: number;
  views: number;
  likes: number;
  isFavorited: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  slug: string;
  isActive: boolean;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  joinedAt: Date;
  isVerified: boolean;
}

export interface LinkCollection {
  id: string;
  title: string;
  description: string;
  author: User;
  links: LinkItem[];
  category: Category;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  views: number;
  likes: number;
  isFavorited: boolean;
}