const BUNGIE_KEY = import.meta.env.VITE_BUNGIE_API_KEY || "";
const bungieUrl = "https://www.bungie.net/Platform";
const bungieStatsUrl = "https://stats.bungie.net/Platform";

interface BungieEnvelope {
    ErrorCode?: number;
    ErrorStatus?: string;
    Message?: string;
}

export const bungieRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    try {
        const isPgcrRequest = path.startsWith("/Destiny2/Stats/PostGameCarnageReport/");
        const baseUrl = isPgcrRequest ? bungieStatsUrl : bungieUrl;
        const hasBody = Boolean(options.body);

        const res = await fetch(baseUrl + path, {
            ...options,
            headers: {
                ...(hasBody ? { "Content-Type": "application/json" } : {}),
                "X-API-Key": BUNGIE_KEY,
                ...options.headers,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed, Status: ${res.status}`);
        }

        const data: T = await res.json();
        const envelope = data as BungieEnvelope;
        if (
            typeof envelope.ErrorCode === "number" &&
            envelope.ErrorCode !== 1
        ) {
            throw new Error(
                envelope.Message ||
                envelope.ErrorStatus ||
                `Bungie API error ${envelope.ErrorCode}`
            );
        }

        return data;
    } catch (error) {
        console.error("Error: ", error);
        throw error;
    }
};
