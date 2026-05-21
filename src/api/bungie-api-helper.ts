const BUNGIE_KEY = import.meta.env.VITE_BUNGIE_API_KEY || "";
const bungieUrl = "https://www.bungie.net/Platform";
const bungieStatsUrl = "https://stats.bungie.net/Platform";

interface BungieEnvelope {
    ErrorCode?: number;
    ErrorStatus?: string;
    Message?: string;
    ThrottleSeconds?: number;
}

let holdUntil = 0;

const waitIfThrottled = (): Promise<void> => {
    const delay = holdUntil - Date.now();
    if (delay <= 0) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, delay));
};

const setThrottle = (seconds: number) => {
    holdUntil = Math.max(holdUntil, Date.now() + seconds * 1000);
};

export const bungieRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    await waitIfThrottled();

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
            if (res.status === 429) {
                const retryAfter = Number(res.headers.get("Retry-After") ?? 2);
                setThrottle(Number.isFinite(retryAfter) ? retryAfter : 2);
            }
            throw new Error(`Failed, Status: ${res.status}`);
        }

        const data: T = await res.json();
        const envelope = data as BungieEnvelope;

        if (typeof envelope.ErrorCode === "number" && envelope.ErrorCode !== 1) {
            // ErrorCode 36 = ThrottledException
            if (envelope.ErrorCode === 36 && typeof envelope.ThrottleSeconds === "number") {
                setThrottle(envelope.ThrottleSeconds);
            }
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
