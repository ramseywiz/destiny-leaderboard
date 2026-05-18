export const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return "--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
};

export const formatTooltipDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return "--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
};

export const formatTimePlayed = (seconds: number): string => {
    if (!seconds || seconds <= 0) return "--";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

export const formatNumber = (value: number): string =>
    new Intl.NumberFormat("en-US").format(value);

export const formatDate = (dateValue: string | Date): string => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "--";

    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);
};

export const formatDateTime = (dateValue: string | Date): string => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "--";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
};

export const formatRatio = (value: number): string => {
    if (!Number.isFinite(value)) return "--";
    return value.toFixed(2);
};

export const formatRunAge = (period: Date): string => {
    const then = new Date(period).getTime();
    const now = Date.now();
    const seconds = Math.max(0, Math.floor((now - then) / 1000));
    const weeks = Math.floor(seconds / 604800);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60);

    if (weeks > 0) return `${weeks}w ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
};

export const median = (values: number[]): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 1) {
        return sorted[middle] ?? 0;
    }

    return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
};

export const lerp = (start: number, end: number, pct: number): number =>
    start + (end - start) * Math.max(0, Math.min(1, pct));

export const getGraphDotY = ({
    seconds,
    fastest,
    average,
    slowest,
    topY,
    lineY,
    bottomY,
}: {
    seconds: number;
    fastest: number;
    average: number;
    slowest: number;
    topY: number;
    lineY: number;
    bottomY: number;
}): number => {
    if (!seconds || seconds <= 0 || !average) return bottomY;
    if (fastest === slowest) return lineY;

    if (seconds <= average) {
        const range = Math.max(average - fastest, 1);
        return lerp(topY, lineY, (seconds - fastest) / range);
    }

    const range = Math.max(slowest - average, 1);
    return lerp(lineY, bottomY, (seconds - average) / range);
};
