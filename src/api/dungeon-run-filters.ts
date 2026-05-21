import type { ParsedRun } from "../enums/bungie-api-enums";

export const isSuccessfulCompletion = (run: ParsedRun): boolean => {
    return (
        run.completed &&
        (run.completionReason === 0 || run.completionReason === 1)
    );
};

export const isMeaningfulFailedAttempt = (run: ParsedRun): boolean => {
    return (
        !isSuccessfulCompletion(run) &&
        run.playerCount > 2 &&
        run.activityDurationSeconds > 300 &&
        run.kills > 0 &&
        run.completionReason !== 2
    );
};

export const isDefaultGraphRun = (run: ParsedRun): boolean => {
    return isSuccessfulCompletion(run) || isMeaningfulFailedAttempt(run);
};

const sortRunQuality = (a: ParsedRun, b: ParsedRun): number => {
    return (
        Number(isSuccessfulCompletion(b)) - Number(isSuccessfulCompletion(a)) ||
        Number(b.completed) - Number(a.completed) ||
        a.completionReason - b.completionReason ||
        b.kills - a.kills
    );
};

export const dedupeRunsByInstanceId = (runs: ParsedRun[]): ParsedRun[] => {
    const byInstanceId = new Map<string, ParsedRun>();

    [...runs].sort(sortRunQuality).forEach((run) => {
        if (!byInstanceId.has(run.instanceId)) {
            byInstanceId.set(run.instanceId, run);
        }
    });

    return Array.from(byInstanceId.values());
};
