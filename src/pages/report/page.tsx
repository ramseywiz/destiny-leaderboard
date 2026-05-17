import { useParams } from "react-router-dom";
import {
    dedupeRunsByInstanceId,
    isSuccessfulCompletion,
} from "../../api/dungeon-run-filters";
import { getDungeonStats, parseDungeonStats } from "../../api/get-dungeon-stats";
import { getActivityDefinition } from "../../api/manifest-cache";
import { PlayerBanner } from "../../components/report/player-banner";
import { DungeonCard } from "../../components/report/dungeon-card";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { bungieRequest } from "../../api/bungie-api-helper";
import { getDungeonDefinition } from "../../enums/guardianInfo";
import type {
    BungieResponse,
    DestinyProfileResponse,
    DestinyActivityDefinition,
    DungeonGroup,
    EmblemLookupResponse,
    ParsedRun,
} from "../../enums/bungie-api-enums";

export const SummaryPage = () => {
    const { platform, membershipId } = useParams();

    const [playerName, setPlayerName] = useState<string>("-");
    const [playerCode, setPlayerCode] = useState<string>("-");
    const [bannerUrl, setBannerUrl] = useState<string>("");
    const [iconUrl, setIconUrl] = useState<string>("");
    const [emblemAccent, setEmblemAccent] = useState<string>("125, 211, 252");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [totalClears, setTotalClears] = useState(0);
    const [speedSum, setSpeedSum] = useState(0);
    const [totalTimePlayed, setTotalTimePlayed] = useState(0);
    const [dungeonGroups, setDungeonGroups] = useState<DungeonGroup[]>([]);

    const fetchedProfileKey = useRef<string | null>(null);

    useEffect(() => {
        if (!platform || !membershipId) return;

        const profileKey = `${platform}:${membershipId}`;
        if (fetchedProfileKey.current === profileKey) return;
        fetchedProfileKey.current = profileKey;

        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const profileRes = await bungieRequest<
                    BungieResponse<DestinyProfileResponse>
                >(`/Destiny2/${platform}/Profile/${membershipId}/?components=100,200`);

                const profileData = profileRes.Response.profile.data.userInfo;
                const charactersData = profileRes.Response.characters.data;
                const characterIds = profileRes.Response.profile.data.characterIds;

                if (!characterIds || characterIds.length === 0) {
                    throw new Error("No characters found");
                }

                setPlayerName(profileData.bungieGlobalDisplayName);
                setPlayerCode(profileData.bungieGlobalDisplayNameCode);

                const firstChar = charactersData[characterIds[0]];
                const { red, green, blue } = firstChar.emblemColor;
                if ([red, green, blue].every(Number.isFinite)) {
                    setEmblemAccent(`${red}, ${green}, ${blue}`);
                }

                const emblemRes = await bungieRequest<
                    BungieResponse<EmblemLookupResponse>
                >(
                    `/Destiny2/Manifest/DestinyInventoryItemDefinition/${firstChar.emblemHash}/`
                );
                setBannerUrl(
                    `https://www.bungie.net${emblemRes.Response.secondarySpecial}`
                );
                setIconUrl(
                    `https://www.bungie.net${emblemRes.Response.displayProperties.icon}`
                );

                const rawData = await getDungeonStats(platform, membershipId, characterIds);
                const runs: ParsedRun[] = parseDungeonStats(rawData);

                const definitions = new Map<number, DestinyActivityDefinition | null>();

                const fetchDefinitions = async (hashes: number[]) => {
                    const missingHashes = Array.from(
                        new Set(
                            hashes.filter(
                                (hash) =>
                                    Number.isFinite(hash) &&
                                    hash > 0 &&
                                    !definitions.has(hash)
                            )
                        )
                    );

                    const entries = await Promise.all(
                        missingHashes.map(async (hash) => {
                            try {
                                const def = await getActivityDefinition(hash);
                                return [hash, def] as const;
                            } catch {
                                return [hash, null] as const;
                            }
                        })
                    );

                    entries.forEach(([hash, def]) => definitions.set(hash, def));
                };

                await fetchDefinitions(runs.map((run) => run.referenceId));

                // most runs map from referenceId. directorActivityHash is just the fallback.
                const fallbackRuns = runs.filter((run) => {
                    const refDef = definitions.get(run.referenceId);
                    return !getDungeonDefinition(refDef?.displayProperties?.name ?? "");
                });
                await fetchDefinitions(fallbackRuns.map((run) => run.directorActivityHash));

                const getRunDefinition = (run: ParsedRun) =>
                    definitions.get(run.referenceId) ??
                    definitions.get(run.directorActivityHash) ??
                    null;

                const dungeonMap = new Map<string, DungeonGroup>();

                runs.forEach((run) => {
                    const def = getRunDefinition(run);
                    const dungeon = getDungeonDefinition(def?.displayProperties?.name ?? "");
                    if (!dungeon) return;

                    const existing = dungeonMap.get(dungeon.id);
                    if (existing) {
                        existing.runs.push(run);
                        if (!existing.pgcrImage && def?.pgcrImage) {
                            existing.pgcrImage = def.pgcrImage;
                        }
                        return;
                    }

                    dungeonMap.set(dungeon.id, {
                        id: dungeon.id,
                        representativeHash: run.referenceId || run.directorActivityHash,
                        activityName: dungeon.name,
                        pgcrImage: def?.pgcrImage ?? "",
                        runs: [run],
                    });
                });

                const groups: DungeonGroup[] = Array.from(dungeonMap.values()).sort(
                    (a, b) => {
                        const aDungeon = getDungeonDefinition(a.activityName);
                        const bDungeon = getDungeonDefinition(b.activityName);
                        return (aDungeon?.order ?? 999) - (bDungeon?.order ?? 999);
                    }
                );

                setDungeonGroups(groups);

                // totals come from the grouped cards so exotic missions cant sneak back in
                const groupedRuns = dedupeRunsByInstanceId(groups.flatMap((g) => g.runs));
                const completedAll = groupedRuns.filter(isSuccessfulCompletion);
                setTotalClears(completedAll.length);
                setTotalTimePlayed(
                    groupedRuns.reduce((sum, r) => sum + r.activityDurationSeconds, 0)
                );

                // speed time is the sum of each dungeon's pb
                const speedSumValue = groups.reduce((total, g) => {
                    const validTimes = g.runs
                        .filter((r) => isSuccessfulCompletion(r) && r.activityDurationSeconds > 60)
                        .map((r) => r.activityDurationSeconds);
                    if (validTimes.length === 0) return total;
                    return total + Math.min(...validTimes);
                }, 0);
                setSpeedSum(speedSumValue);
            } catch (e) {
                console.error("Failed to fetch data:", e);
                setPlayerName("Unknown Guardian");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [platform, membershipId]);

    const reportStyle = {
        "--background-accent": emblemAccent,
    } as CSSProperties;

    return (
        <div className="report-page" style={reportStyle} aria-busy={isLoading}>
            {isLoading ? (
                <PlayerBannerSkeleton />
            ) : (
                <PlayerBanner
                    playerName={playerName}
                    playerCode={playerCode}
                    bannerUrl={bannerUrl}
                    iconUrl={iconUrl}
                    totalClears={totalClears}
                    speedSum={speedSum}
                    totalTimePlayed={totalTimePlayed}
                />
            )}

            <div className="report-content">
                {isLoading ? (
                    <div className="dungeon-cards-grid" aria-hidden="true">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <DungeonCardSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <div className="dungeon-cards-grid">
                        {dungeonGroups.map((g) => (
                            <DungeonCard
                                key={g.id}
                                activityName={g.activityName}
                                pgcrImage={g.pgcrImage}
                                runs={g.runs}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

function PlayerBannerSkeleton() {
    return (
        <div className="player-card skeleton-card" aria-hidden="true">
            <div className="player-banner skeleton-block" />
            <div className="player-content">
                <div className="player-avatar skeleton-block" />
                <div className="player-name-block">
                    <div className="skeleton-line skeleton-name" />
                    <div className="skeleton-line skeleton-code" />
                </div>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
            </div>
        </div>
    );
}

function DungeonCardSkeleton() {
    return (
        <div className="dungeon-card skeleton-card">
            <div className="dungeon-card-header skeleton-block" />
            <div className="dungeon-section">
                <div className="dungeon-timeline-row">
                    <div className="skeleton-graph">
                        <div className="skeleton-average-line" />
                        {Array.from({ length: 10 }).map((_, index) => (
                            <span
                                key={index}
                                className="skeleton-dot"
                                style={{ top: `${18 + ((index * 17) % 38)}px` }}
                            />
                        ))}
                    </div>
                    <div className="skeleton-line skeleton-clears" />
                </div>
                <div className="skeleton-line skeleton-clears-label" />
            </div>
            <div className="dungeon-divider" />
            <div className="dungeon-section dungeon-stat-row">
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
            </div>
            <div className="dungeon-divider" />
            <div className="dungeon-section dungeon-stat-row dungeon-stats-grid">
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
            </div>
        </div>
    );
}

function StatSkeleton() {
    return (
        <div className="stat-box skeleton-stat">
            <div className="skeleton-line skeleton-stat-title" />
            <div className="skeleton-line skeleton-stat-value" />
        </div>
    );
}
