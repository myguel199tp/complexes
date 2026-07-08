export interface HolidayReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: { id: string; name?: string; nameMain?: string };
}

const API = process.env.NEXT_PUBLIC_API_URL;

export async function getHolidayReviews(
  hollidayId: string,
): Promise<HolidayReview[]> {
  try {
    const res = await fetch(`${API}/api/holliday-review/${hollidayId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getHolidayAverageRating(
  hollidayId: string,
): Promise<number> {
  try {
    const res = await fetch(
      `${API}/api/holliday-review/average/${hollidayId}`,
      { cache: "no-store" },
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return Number(data) || 0;
  } catch {
    return 0;
  }
}
