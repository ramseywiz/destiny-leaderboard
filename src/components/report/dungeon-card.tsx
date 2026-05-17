import { useEffect, useRef, useState } from "react";
import {
    dedupeRunsByInstanceId,
    isDefaultGraphRun,
    isSuccessfulCompletion,
} from "../../api/dungeon-run-filters";
import type { ParsedRun } from "../../enums/bungie-api-enums";

interface DungeonCardProps {
    activityName: string;
    pgcrImage: string;
    runs: ParsedRun[];
}

const GRAPH_HEIGHT = 64;
const GRAPH_LINE_Y = GRAPH_HEIGHT / 2;
const GRAPH_TOP_Y = 9;
const GRAPH_BOTTOM_Y = GRAPH_HEIGHT - 9;
const GRAPH_DOT_SPACING = 20;
const GRAPH_DOT_RADIUS = 5.5;

function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return "--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatTimePlayed(seconds: number): string {
    if (!seconds || seconds <= 0) return "--";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
}

function median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 1) {
        return sorted[middle] ?? 0;
    }

    return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

function getSoloTag(completedRuns: ParsedRun[]): string | null {
    const soloRuns = completedRuns.filter((run) => run.playerCount === 1);
    if (soloRuns.some((run) => run.deaths === 0)) return "Solo Flawless";
    if (soloRuns.length > 0) return "Solo";
    return null;
}

function lerp(start: number, end: number, pct: number): number {
    return start + (end - start) * Math.max(0, Math.min(1, pct));
}

function getDotY(seconds: number, fastest: number, average: number, slowest: number): number {
    if (!seconds || seconds <= 0 || !average) return GRAPH_BOTTOM_Y;
    if (fastest === slowest) return GRAPH_LINE_Y;

    if (seconds <= average) {
        const range = Math.max(average - fastest, 1);
        return lerp(GRAPH_TOP_Y, GRAPH_LINE_Y, (seconds - fastest) / range);
    }

    const range = Math.max(slowest - average, 1);
    return lerp(GRAPH_LINE_Y, GRAPH_BOTTOM_Y, (seconds - average) / range);
}

export const DungeonCard = ({ activityName, pgcrImage, runs }: DungeonCardProps) => {
    const timelineRef = useRef<HTMLDivElement>(null);
    const [isTimelineScrollable, setIsTimelineScrollable] = useState(false);
    const uniqueRuns = dedupeRunsByInstanceId(runs);
    const completedRuns = uniqueRuns.filter(isSuccessfulCompletion);
    const graphRuns = uniqueRuns.filter(isDefaultGraphRun);
    const totalClears = completedRuns.length;

    const chronological = [...graphRuns].sort(
        (a, b) => new Date(a.period).getTime() - new Date(b.period).getTime()
    );

    // sub-minute runs are usually api nonsense, dont let them nuke the scale
    const validTimes = completedRuns
        .map((r) => r.activityDurationSeconds)
        .filter((s) => s > 60);
    const fastestSeconds = validTimes.length > 0 ? Math.min(...validTimes) : 0;
    const recentClear = [...completedRuns]
        .filter((r) => r.activityDurationSeconds > 60)
        .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime())[0];
    const recentSeconds = recentClear?.activityDurationSeconds ?? 0;

    // dungeon.report's "average" line behaves more like a median, which is better here
    const avgSeconds = median(validTimes);
    const graphTimes = graphRuns
        .map((r) => r.activityDurationSeconds)
        .filter((s) => s > 60);
    const fastestGraphSeconds = graphTimes.length > 0 ? Math.min(...graphTimes) : fastestSeconds;
    const slowestGraphSeconds = graphTimes.length > 0 ? Math.max(...graphTimes) : fastestSeconds;
    const graphAverageSeconds = avgSeconds || median(graphTimes);

    const totalSeconds = uniqueRuns.reduce((sum, r) => sum + r.activityDurationSeconds, 0);
    const totalKills = uniqueRuns.reduce((sum, r) => sum + r.kills, 0);
    const totalDeaths = uniqueRuns.reduce((sum, r) => sum + r.deaths, 0);
    const totalAssists = uniqueRuns.reduce((sum, r) => sum + r.assists, 0);

    const soloTag = getSoloTag(completedRuns);
    const graphWidth = Math.max(chronological.length * GRAPH_DOT_SPACING, 220);

    useEffect(() => {
        const track = timelineRef.current;
        if (!track) return;

        const syncTimelineScroll = () => {
            const isScrollable = track.scrollWidth > track.clientWidth;
            setIsTimelineScrollable(isScrollable);
            track.scrollLeft = isScrollable ? track.scrollWidth - track.clientWidth : 0;
        };

        syncTimelineScroll();
        window.addEventListener("resize", syncTimelineScroll);

        return () => {
            window.removeEventListener("resize", syncTimelineScroll);
        };
    }, [graphWidth, chronological.length]);

    return (
        <div className="dungeon-card">
            <div
                className="dungeon-card-header"
                style={{
                    backgroundImage: pgcrImage
                        ? `url(https://www.bungie.net${pgcrImage})`
                        : "none",
                }}
            >
                <div className="dungeon-header-gradient" />

                {soloTag && (
                    <div className="dungeon-badge-stack">
                        <span className="dungeon-card-badge dungeon-solo-tag">{soloTag}</span>
                    </div>
                )}

                <div className="dungeon-header-content">
                    <div className="dungeon-activity-name">{activityName}</div>
                </div>
            </div>

            <div className="dungeon-section">
                <div className="dungeon-timeline-row">
                    <div
                        className={`dungeon-timeline-track ${isTimelineScrollable ? "is-scrollable" : ""}`}
                        ref={timelineRef}
                    >
                        <svg
                            className="dungeon-time-graph"
                            width={graphWidth}
                            height={GRAPH_HEIGHT}
                            viewBox={`0 0 ${graphWidth} ${GRAPH_HEIGHT}`}
                            role="img"
                            aria-label={`${activityName} attempts by completion time`}
                        >
                            <line
                                className="dungeon-average-line"
                                x1="0"
                                y1={GRAPH_LINE_Y}
                                x2={graphWidth}
                                y2={GRAPH_LINE_Y}
                            />
                            {chronological.map((run, index) => {
                                const successful = isSuccessfulCompletion(run);
                                const x = GRAPH_DOT_SPACING / 2 + index * GRAPH_DOT_SPACING;
                                const y = getDotY(
                                    run.activityDurationSeconds,
                                    fastestGraphSeconds,
                                    graphAverageSeconds,
                                    slowestGraphSeconds
                                );

                                return (
                                    <g
                                        key={run.instanceId}
                                        className={`dungeon-dot-node ${successful ? "dot-clear" : "dot-fail"}`}
                                    >
                                        <title>
                                            {successful
                                                ? `Clear - ${formatDuration(run.activityDurationSeconds)}`
                                                : `Attempt - ${formatDuration(run.activityDurationSeconds)}`}
                                        </title>
                                        <circle cx={x} cy={y} r={GRAPH_DOT_RADIUS} />
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                    <div className="dungeon-clears-num">{totalClears}</div>
                </div>
                <div className="dungeon-clears-label">CLEARS</div>
            </div>

            <div className="dungeon-divider" />

            <div className="dungeon-section dungeon-stat-row">
                <div className="dungeon-stat-col">
                    <div className="dungeon-stat-value accent">
                        {formatDuration(fastestSeconds)}
                    </div>
                    <div className="dungeon-stat-label">FASTEST</div>
                </div>
                <div className="dungeon-stat-col">
                    <div className="dungeon-stat-value accent">
                        {formatDuration(Math.round(avgSeconds))}
                    </div>
                    <div className="dungeon-stat-label">AVERAGE</div>
                </div>
                <div className="dungeon-stat-col">
                    <div className="dungeon-stat-value accent">
                        {formatDuration(recentSeconds)}
                    </div>
                    <div className="dungeon-stat-label">RECENT</div>
                </div>
            </div>

            <div className="dungeon-divider" />

            <div className="dungeon-section dungeon-stat-row dungeon-stats-grid">
                <div className="dungeon-stat-col">
                    <div className="dungeon-stat-value">
                        {formatNumber(totalKills)}
                    </div>
                    <div className="dungeon-stat-label">KILLS</div>
                </div>
                <div className="dungeon-stat-col">
                    <div className="dungeon-stat-value">
                        {formatNumber(totalDeaths)}
                    </div>
                    <div className="dungeon-stat-label">DEATHS</div>
                </div>
                <div className="dungeon-stat-col">
                    <div className="dungeon-stat-value">
                        {formatNumber(totalAssists)}
                    </div>
                    <div className="dungeon-stat-label">ASSISTS</div>
                </div>
                <div className="dungeon-stat-col">
                    <div className="dungeon-stat-value">
                        {formatTimePlayed(totalSeconds)}
                    </div>
                    <div className="dungeon-stat-label">TIME</div>
                </div>
            </div>
        </div>
    );
};
