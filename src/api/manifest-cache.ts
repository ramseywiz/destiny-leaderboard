import type { BungieResponse, DestinyActivityDefinition } from "../enums/bungie-api-enums";
import { bungieRequest } from "./bungie-api-helper";

const VERSION_KEY = "bungie_manifest_version";
const ACT_PREFIX = "bungie_actdef_";
const activityDefinitionPromises = new Map<number, Promise<DestinyActivityDefinition>>();

interface ManifestData {
    version: string;
}

// manifest calls add up fast, so cache them until bungie bumps the version
let sessionVersionChecked = false;
let manifestVersionPromise: Promise<void> | null = null;

const ensureVersionCurrent = async (): Promise<void> => {
    if (sessionVersionChecked) return;

    if (!manifestVersionPromise) {
        manifestVersionPromise = checkManifestVersion().finally(() => {
            sessionVersionChecked = true;
            manifestVersionPromise = null;
        });
    }

    await manifestVersionPromise;
};

const checkManifestVersion = async (): Promise<void> => {
    try {
        const res = await bungieRequest<BungieResponse<ManifestData>>("/Destiny2/Manifest/");
        const liveVersion = res.Response?.version;
        if (!liveVersion) return;

        const storedVersion = localStorage.getItem(VERSION_KEY);

        if (storedVersion !== liveVersion) {
            const staleKeys = Object.keys(localStorage).filter((k) =>
                k.startsWith(ACT_PREFIX)
            );
            staleKeys.forEach((k) => localStorage.removeItem(k));
            localStorage.setItem(VERSION_KEY, liveVersion);
        }
    } catch (e) {
        console.warn("Could not verify manifest version:", e);
    }
};

export const getActivityDefinition = async (
    hash: number
): Promise<DestinyActivityDefinition> => {
    const pending = activityDefinitionPromises.get(hash);
    if (pending) return pending;

    const promise = loadActivityDefinition(hash);
    activityDefinitionPromises.set(hash, promise);

    try {
        return await promise;
    } finally {
        activityDefinitionPromises.delete(hash);
    }
};

const loadActivityDefinition = async (hash: number): Promise<DestinyActivityDefinition> => {
    await ensureVersionCurrent();

    const cacheKey = `${ACT_PREFIX}${hash}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        return JSON.parse(cached) as DestinyActivityDefinition;
    }

    const res = await bungieRequest<BungieResponse<DestinyActivityDefinition>>(
        `/Destiny2/Manifest/DestinyActivityDefinition/${hash}/`
    );

    if (!res.Response) {
        throw new Error(`No manifest entry for activity hash ${hash}`);
    }

    localStorage.setItem(cacheKey, JSON.stringify(res.Response));
    return res.Response;
};
