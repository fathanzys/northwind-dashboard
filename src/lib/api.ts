import { ApiResponse } from "@/types";

const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

export async function fetchApi<T>(
    endpoint: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            ...options,
        });

        const json = await res.json();

        if (!res.ok) {
            return { error: json.error || "An error occurred" };
        }

        return json;
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Network error" };
    }
}
