import { BlogPostResponse, BlogSection } from "./response/blogResponse";
import { backendError } from "@/app/helpers/backendError";

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
      throw await backendError(response, "Error cargando las noticias");
    }

    return response.json();
  }
}
