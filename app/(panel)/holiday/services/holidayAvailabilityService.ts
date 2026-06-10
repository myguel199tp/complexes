export async function getBlockedDates(holidayId: string): Promise<string[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/hollidays/${holidayId}/blocked-dates`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.filter((d): d is string => typeof d === "string");
  } catch {
    return [];
  }
}
