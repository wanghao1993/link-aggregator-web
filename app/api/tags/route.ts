import { NextResponse } from "next/server";
import { LinkCollection } from "@/types/link";

const mockCollections: LinkCollection[] = [
  {
    id: "1",
    title: "AI & Machine Learning Resources",
    description: "精心策划的AI和机器学习工具、论文和教程合集",
    author: {
      id: "1",
      username: "ai_expert",
      displayName: "AI Expert",
      email: "ai@example.com",
      isVerified: true,
      joinedAt: new Date("2023-01-01"),
    },
    links: [],
    category: {
      id: "ai",
      name: "AI/ML",
      description: "AI & Machine Learning",
      icon: "🤖",
      color: "purple",
      slug: "ai-ml",
      isActive: true,
    },
    tags: ["AI", "Machine Learning", "Tools", "Papers"],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    isPublic: true,
    views: 1250,
    likes: 89,
    isFavorited: false,
  },
  {
    id: "2",
    title: "Web Development Tools",
    description: "现代Web开发必备工具和库的完整集合",
    author: {
      id: "2",
      username: "webdev_pro",
      displayName: "WebDev Pro",
      email: "web@example.com",
      isVerified: true,
      joinedAt: new Date("2023-02-01"),
    },
    links: [],
    category: {
      id: "web",
      name: "Web开发",
      description: "Web Development",
      icon: "💻",
      color: "blue",
      slug: "web-dev",
      isActive: true,
    },
    tags: ["React", "Vue", "Angular", "Tools"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    isPublic: true,
    views: 890,
    likes: 67,
    isFavorited: true,
  },
  {
    id: "3",
    title: "Design Inspiration",
    description: "美丽的设计案例和资源库",
    author: {
      id: "3",
      username: "design_guru",
      displayName: "Design Guru",
      email: "design@example.com",
      isVerified: false,
      joinedAt: new Date("2023-03-01"),
    },
    links: [],
    category: {
      id: "design",
      name: "设计",
      description: "Design Resources",
      icon: "🎨",
      color: "pink",
      slug: "design",
      isActive: true,
    },
    tags: ["UI/UX", "Inspiration", "Colors", "Typography"],
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-15"),
    isPublic: true,
    views: 567,
    likes: 45,
    isFavorited: false,
  },
];

export async function GET() {
  const tagCountMap = new Map<string, number>();

  for (const collection of mockCollections) {
    for (const tag of collection.tags) {
      tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
    }
  }

  const tags = Array.from(tagCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ tags });
}
