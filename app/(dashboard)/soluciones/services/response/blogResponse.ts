export type BlogSection = "CLUB" | "LEGAL";

export interface BlogPostResponse {
  id: string;
  section: BlogSection;
  tag?: string;
  title: string;
  description: string;
  image?: string;
  publishedAt?: string;
  createdAt: string;
}
