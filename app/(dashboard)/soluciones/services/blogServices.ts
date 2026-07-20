import { BlogPostResponse, BlogSection } from "./response/blogResponse";

export class DataBlogServices {
  async getPosts(section?: BlogSection): Promise<BlogPostResponse[]> {
    const query = section ? `?section=${section}` : "";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/blog${query}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error cargando las noticias");
    }

    return response.json();
  }
}
