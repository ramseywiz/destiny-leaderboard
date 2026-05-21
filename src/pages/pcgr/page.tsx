import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { bungieRequest } from "../../api/bungie-api-helper";
import { getActivityDefinition } from "../../api/manifest-cache";
import type {
    BasicStat,
    BungieResponse,
    DestinyActivityDefinition,
    DestinyPostGameCarnageReport,
    DestinyPostGameCarnageEntry,
    EmblemLookupResponse,
} from "../../enums/bungie-api-enums";
import {
    formatDate,
    formatDuration,
    formatNumber,
    formatRatio,
} from "../../utils/report-format";

type PostGameCarnageReport = DestinyPostGameCarnageReport;
type PostGameCarnageEntry = DestinyPostGameCarnageEntry;

interface HighlightRow {
    label: string;
    value: string;
}

const BUNGIE_ROOT = "https://www.bungie.net";

const getStatValue = (stat?: BasicStat): number => stat?.basic?.value ?? 0;

const getPlayerName = (entry: PostGameCarnageEntry): string =>
    entry.player.destinyUserInfo.bungieGlobalDisplayName ||
    entry.player.destinyUserInfo.displayName ||
    "Unknown Guardian";

const getPlayerCode = (entry: PostGameCarnageEntry): string => {
    const code = entry.player.destinyUserInfo.bungieGlobalDisplayNameCode;
    return code ? `#${code}` : "";
};

const getIconUrl = (entry: PostGameCarnageEntry): string => {
    const iconPath = entry.player.destinyUserInfo.iconPath;
    return iconPath ? `${BUNGIE_ROOT}${iconPath}` : "";
};

const isCompleted = (entry: PostGameCarnageEntry): boolean =>
    getStatValue(entry.values.completed) === 1 &&
    getStatValue(entry.values.completionReason) === 0;

const sortEntries = (entries: PostGameCarnageEntry[]): PostGameCarnageEntry[] =>
    [...entries].sort((a, b) => {
        const completedDelta = Number(isCompleted(b)) - Number(isCompleted(a));
        if (completedDelta !== 0) return completedDelta;

        const completionReasonDelta =
            getStatValue(a.values.completionReason) -
            getStatValue(b.values.completionReason);
        if (completionReasonDelta !== 0) return completionReasonDelta;

        const killsDelta = getStatValue(b.values.kills) - getStatValue(a.values.kills);
        if (killsDelta !== 0) return killsDelta;

        const deathsDelta = getStatValue(a.values.deaths) - getStatValue(b.values.deaths);
        if (deathsDelta !== 0) return deathsDelta;

        return getStatValue(b.values.assists) - getStatValue(a.values.assists);
    });

const getActivityDefinitionFromReport = async (
    report: PostGameCarnageReport
): Promise<DestinyActivityDefinition | null> => {
    const hashes = [
        report.activityDetails.referenceId,
        report.activityDetails.directorActivityHash,
    ].filter((hash) => Number.isFinite(hash) && hash > 0);

    for (const hash of hashes) {
        try {
            return await getActivityDefinition(hash);
        } catch {
            continue;
        }
    }

    return null;
};

const getMvp = (entries: PostGameCarnageEntry[]): PostGameCarnageEntry | undefined =>
    [...entries].sort((a, b) => {
        const kdDelta =
            getStatValue(b.values.killsDeathsRatio) -
            getStatValue(a.values.killsDeathsRatio);
        if (kdDelta !== 0) return kdDelta;
        return getStatValue(b.values.kills) - getStatValue(a.values.kills);
    })[0];

const getLeader = (
    entries: PostGameCarnageEntry[],
    stat: keyof PostGameCarnageEntry["values"],
    ascending = false
): PostGameCarnageEntry | undefined =>
    [...entries].sort((a, b) => {
        const delta = getStatValue(a.values[stat]) - getStatValue(b.values[stat]);
        return ascending ? delta : -delta;
    })[0];

const getHighlights = (entries: PostGameCarnageEntry[]): HighlightRow[] => {
    const mvp = getMvp(entries);
    const mostKills = getLeader(entries, "kills");
    const mostAssists = getLeader(entries, "assists");
    const bestKd = getLeader(entries, "killsDeathsRatio");
    const mostDeaths = getLeader(entries, "deaths");

    return [
        { label: "MVP", value: mvp ? getPlayerName(mvp) : "--" },
        {
            label: "Most Kills",
            value: mostKills
                ? `${getPlayerName(mostKills)} - ${formatNumber(getStatValue(mostKills.values.kills))}`
                : "--",
        },
        {
            label: "Most Assists",
            value: mostAssists
                ? `${getPlayerName(mostAssists)} - ${formatNumber(getStatValue(mostAssists.values.assists))}`
                : "--",
        },
        {
            label: "Best K/D",
            value: bestKd
                ? `${getPlayerName(bestKd)} - ${formatRatio(getStatValue(bestKd.values.killsDeathsRatio))}`
                : "--",
        },
        {
            label: "Most Deaths",
            value: mostDeaths
                ? `${getPlayerName(mostDeaths)} - ${formatNumber(getStatValue(mostDeaths.values.deaths))}`
                : "--",
        },
    ];
};

const getCombatStats = (entries: PostGameCarnageEntry[]): HighlightRow[] => {
    const totalKills = entries.reduce((sum, entry) => sum + getStatValue(entry.values.kills), 0);
    const totalAssists = entries.reduce(
        (sum, entry) => sum + getStatValue(entry.values.assists),
        0
    );
    const totalDeaths = entries.reduce(
        (sum, entry) => sum + getStatValue(entry.values.deaths),
        0
    );
    const totalSuperKills = entries.reduce(
        (sum, entry) => sum + getStatValue(entry.extended?.values?.weaponKillsSuper),
        0
    );

    return [
        { label: "Total Kills", value: formatNumber(totalKills) },
        { label: "Total Assists", value: formatNumber(totalAssists) },
        { label: "Total Deaths", value: formatNumber(totalDeaths) },
        { label: "Team K/D", value: formatRatio(totalDeaths > 0 ? totalKills / totalDeaths : totalKills) },
        { label: "Total Super Kills", value: formatNumber(totalSuperKills) },
    ];
};

export const PcgrPage = () => {
    const { instanceId } = useParams();
    const [report, setReport] = useState<PostGameCarnageReport | null>(null);
    const [activityDefinition, setActivityDefinition] =
        useState<DestinyActivityDefinition | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [emblemBannerMap, setEmblemBannerMap] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!report) return;
        let isCancelled = false;

        const fetchEmblems = async () => {
            const results = await Promise.allSettled(
                report.entries
                    .filter((e) => e.player.emblemHash)
                    .map(async (e) => {
                        const res = await bungieRequest<BungieResponse<EmblemLookupResponse>>(
                            `/Destiny2/Manifest/DestinyInventoryItemDefinition/${e.player.emblemHash}/`
                        );
                        return {
                            characterId: e.characterId,
                            bannerUrl: `${BUNGIE_ROOT}${res.Response.secondarySpecial}`,
                        };
                    })
            );
            if (isCancelled) return;
            const map: Record<string, string> = {};
            results.forEach((r) => {
                if (r.status === "fulfilled") map[r.value.characterId] = r.value.bannerUrl;
            });
            setEmblemBannerMap(map);
        };

        fetchEmblems();
        return () => { isCancelled = true; };
    }, [report]);

    useEffect(() => {
        if (!instanceId) return;

        let isCancelled = false;

        const fetchPcgr = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const pcgr = await bungieRequest<BungieResponse<PostGameCarnageReport>>(
                    `/Destiny2/Stats/PostGameCarnageReport/${instanceId}/`
                );

                if (isCancelled) return;

                setReport(pcgr.Response);
                const definition = await getActivityDefinitionFromReport(pcgr.Response);

                if (!isCancelled) {
                    setActivityDefinition(definition);
                }
            } catch (e) {
                console.error("Failed to fetch PCGR:", e);
                if (!isCancelled) {
                    setError("Unable to load this activity report.");
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchPcgr();

        return () => {
            isCancelled = true;
        };
    }, [instanceId]);

    const sortedEntries = useMemo(
        () => sortEntries(report?.entries ?? []),
        [report?.entries]
    );
    const highlights = useMemo(() => getHighlights(sortedEntries), [sortedEntries]);
    const combatStats = useMemo(() => getCombatStats(sortedEntries), [sortedEntries]);
    const activityDuration = sortedEntries.reduce(
        (max, entry) => Math.max(max, getStatValue(entry.values.activityDurationSeconds)),
        0
    );
    const allCompleted =
        sortedEntries.length > 0 && sortedEntries.every((entry) => isCompleted(entry));
    const isFresh = report?.activityWasStartedFromBeginning;
    const completedEntries = sortedEntries.filter(isCompleted);
    const isSolo = allCompleted && completedEntries.length === 1;
    const isFlawless = allCompleted && completedEntries.every((e) => getStatValue(e.values.deaths) === 0);
    const isSoloFlawless = isSolo && isFlawless;
    const activityName = activityDefinition?.displayProperties?.name ?? "Post Game Report";
    const pgcrImage = activityDefinition?.pgcrImage ?? "";

    if (isLoading) {
        return (
            <div className="pcgr-page">
                <div className="pcgr-shell pcgr-placeholder">
                    <div className="pcgr-loading-block" />
                    <div className="pcgr-loading-line" />
                    <div className="pcgr-loading-line short" />
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="pcgr-page">
                <div className="pcgr-shell pcgr-empty-state">
                    <div className="pcgr-empty-title">PCGR unavailable</div>
                    <div className="pcgr-empty-copy">{error ?? "No activity report was returned."}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="pcgr-page">
            <main className="pcgr-shell">
                <section
                    className="pcgr-hero"
                    style={{
                        backgroundImage: pgcrImage ? `url(${BUNGIE_ROOT}${pgcrImage})` : "none",
                    }}
                >
                    <div className="pcgr-hero-scrim" />
                    <div className="pcgr-hero-content">
                        <div className="pcgr-date">{formatDate(report.period)}</div>
                        <div className="pcgr-title-row">
                            <h1>{activityName}</h1>
                            {allCompleted && <span className="pcgr-success-badge" aria-label="Completed" />}
                        </div>
                        <div className="pcgr-badge-row">
                            {isFresh === true && (
                                <div className="pcgr-mode-badge pcgr-mode-fresh">Fresh</div>
                            )}
                            {isFresh === false && (
                                <div className="pcgr-mode-badge pcgr-mode-checkpoint">Checkpoint</div>
                            )}
                            {isSoloFlawless && (
                                <div className="pcgr-mode-badge pcgr-mode-solo-flawless">Solo Flawless</div>
                            )}
                            {!isSoloFlawless && isSolo && (
                                <div className="pcgr-mode-badge pcgr-mode-solo">Solo</div>
                            )}
                            {!isSoloFlawless && isFlawless && (
                                <div className="pcgr-mode-badge pcgr-mode-flawless">Flawless</div>
                            )}
                        </div>
                        <div className="pcgr-meta-row">
                            <span className="pcgr-meta-item">
                                {formatDuration(activityDuration)}
                            </span>
                        </div>
                    </div>
                </section>

                <section className="pcgr-table-section">
                    <div className="pcgr-table-head">
                        <div>Summary</div>
                        <div>Kills</div>
                        <div>Deaths</div>
                        <div>Assists</div>
                        <div>K/D</div>
                        <div>Time</div>
                    </div>

                    <div className="pcgr-player-table">
                        {sortedEntries.map((entry, index) => (
                            <PcgrPlayerRow
                                key={`${entry.characterId}-${entry.player.destinyUserInfo.membershipId}`}
                                entry={entry}
                                isMvp={entry === getMvp(sortedEntries)}
                                rank={index + 1}
                                emblemBannerUrl={emblemBannerMap[entry.characterId]}
                            />
                        ))}
                    </div>
                </section>

                <section className="pcgr-detail-grid">
                    <PcgrStatPanel title="Activity Highlights" rows={highlights} />
                    <PcgrStatPanel title="Combat Stats" rows={combatStats} />
                </section>

            </main>
        </div>
    );
};

const PcgrPlayerRow = ({
    entry,
    isMvp,
    rank,
    emblemBannerUrl,
}: {
    entry: PostGameCarnageEntry;
    isMvp: boolean;
    rank: number;
    emblemBannerUrl?: string;
}) => {
    const navigate = useNavigate();
    const iconUrl = getIconUrl(entry);
    const className = entry.player.characterClass ?? "Guardian";
    const kills = getStatValue(entry.values.kills);
    const deaths = getStatValue(entry.values.deaths);
    const assists = getStatValue(entry.values.assists);
    const kd = getStatValue(entry.values.killsDeathsRatio);
    const timePlayed = getStatValue(entry.values.timePlayedSeconds);

    const { membershipType, membershipId } = entry.player.destinyUserInfo;
    const profilePath =
        membershipType && membershipId
            ? `/report/${membershipType}/${membershipId}`
            : null;

    return (
        <div
            className={`pcgr-player-row${profilePath ? " is-clickable" : ""}`}
            onClick={profilePath ? () => navigate(profilePath) : undefined}
        >
            {emblemBannerUrl && (
                <div
                    className="pcgr-row-emblem-bg"
                    style={{ backgroundImage: `url(${emblemBannerUrl})` }}
                />
            )}
            <div className="pcgr-player-summary">
                <div className="pcgr-rank-mark">{rank}</div>
                {iconUrl ? (
                    <img className="pcgr-player-icon" src={iconUrl} alt="" />
                ) : (
                    <div className="pcgr-player-icon pcgr-player-icon-empty" />
                )}
                <div className="pcgr-class-mark" aria-label={className}>
                    {className.slice(0, 1)}
                </div>
                <div className="pcgr-player-name-block">
                    <div className="pcgr-player-name-row">
                        <span className="pcgr-player-name">{getPlayerName(entry)}</span>
                        {isMvp && <span className="pcgr-mvp-badge">MVP</span>}
                    </div>
                    {getPlayerCode(entry) && (
                        <div className="pcgr-player-subline">
                            {getPlayerCode(entry)}
                        </div>
                    )}
                </div>
            </div>
            <div className="pcgr-stat-cell">{formatNumber(kills)}</div>
            <div className="pcgr-stat-cell">{formatNumber(deaths)}</div>
            <div className="pcgr-stat-cell">{formatNumber(assists)}</div>
            <div className="pcgr-stat-cell">{formatRatio(kd)}</div>
            <div className="pcgr-time-cell">
                {formatDuration(timePlayed)}
            </div>
        </div>
    );
};

const PcgrStatPanel = ({
    title,
    rows,
}: {
    title: string;
    rows: HighlightRow[];
}) => {
    return (
        <section className="pcgr-stat-panel">
            <h2>
                {title}
            </h2>
            <div className="pcgr-panel-rows">
                {rows.map((row) => (
                    <div className="pcgr-panel-row" key={row.label}>
                        <span>{row.label}</span>
                        <strong>{row.value}</strong>
                    </div>
                ))}
            </div>
        </section>
    );
};
