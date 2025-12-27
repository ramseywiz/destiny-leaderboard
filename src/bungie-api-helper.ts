const BUNGIE_KEY = import.meta.env.VITE_BUNGIE_API_KEY || "";
const bungieUrl = "https://www.bungie.net/Platform";

export const bungieRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    try {
        const res = await fetch(bungieUrl + path, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": BUNGIE_KEY,
                ...options.headers,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed, Status: ${res.status}`);
        }

        const data: T = await res.json();
        return data;
    } catch (error) {
        console.error("Error: ", error);
        throw error;
    }
}