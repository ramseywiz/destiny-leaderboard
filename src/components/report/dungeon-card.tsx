import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    dedupeRunsByInstanceId,
    isDefaultGraphRun,
    isSuccessfulCompletion,
} from "../../api/dungeon-run-filters";
import type { ParsedRun } from "../../enums/bungie-api-enums";
import {
    formatDuration,
    formatNumber,
    formatRunAge,
    formatTimePlayed,
    formatTooltipDuration,
    getGraphDotY,
    median,
} from "../../utils/report-format";

interface DungeonCardProps {
    activityName: string;
    pgcrImage: string;
    runs: ParsedRun[];
}

interface GraphTooltip {
    x: number;
    y: number;
    placement: "left" | "right";
    duration: string;
    age: string;
    successful: boolean;
}

const GRAPH_HEIGHT = 64;
const GRAPH_LINE_Y = GRAPH_HEIGHT / 2;
const GRAPH_TOP_Y = 9;
const GRAPH_BOTTOM_Y = GRAPH_HEIGHT - 9;
const GRAPH_DOT_SPACING = 20;
const GRAPH_DOT_RADIUS = 5.5;

const getSoloTag = (completedRuns: ParsedRun[]): string | null => {
    const soloRuns = completedRuns.filter((run) => run.playerCount === 1);
    if (soloRuns.some((run) => run.deaths === 0)) return "Solo Flawless";
    if (soloRuns.length > 0) return "Solo";
    return null;
};

export const DungeonCard = ({ activityName, pgcrImage, runs }: DungeonCardProps) => {
    const navigate = useNavigate();
    const timelineRef = useRef<HTMLDivElement>(null);
    const [isTimelineScrollable, setIsTimelineScrollable] = useState(false);
    const [graphTooltip, setGraphTooltip] = useState<GraphTooltip | null>(null);
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
    const solos = completedRuns.filter((run) => run.playerCount === 1).length;
    const soloFlawlesses = completedRuns.filter(
        (run) => run.playerCount === 1 && run.deaths === 0
    ).length;

    const soloTag = getSoloTag(completedRuns);
    const graphWidth = Math.max(chronological.length * GRAPH_DOT_SPACING, 220);

    const showGraphTooltip = (
        run: ParsedRun,
        successful: boolean,
        position: { x: number; y: number; placement?: GraphTooltip["placement"] }
    ) => {
        setGraphTooltip({
            x: position.x,
            y: position.y,
            placement: position.placement ?? "right",
            duration: formatTooltipDuration(run.activityDurationSeconds),
            age: formatRunAge(run.period),
            successful,
        });
    };

    const showGraphMouseTooltip = (
        event: MouseEvent<Element>,
        run: ParsedRun,
        successful: boolean
    ) => {
        const track = timelineRef.current;
        if (!track) return;

        const rect = track.getBoundingClientRect();
        const x = event.clientX - rect.left + track.scrollLeft;
        const placement = event.clientX - rect.left > track.clientWidth - 110 ? "left" : "right";
        showGraphTooltip(run, successful, {
            x,
            y: event.clientY - rect.top,
            placement,
        });
    };

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
                                const y = getGraphDotY({
                                    seconds: run.activityDurationSeconds,
                                    fastest: fastestGraphSeconds,
                                    average: graphAverageSeconds,
                                    slowest: slowestGraphSeconds,
                                    topY: GRAPH_TOP_Y,
                                    lineY: GRAPH_LINE_Y,
                                    bottomY: GRAPH_BOTTOM_Y,
                                });
                                const isFlawless = successful && run.deaths === 0;
                                const label = isFlawless && run.playerCount === 1 ? "Solo Flawless" : isFlawless ? "Flawless" : successful ? "Clear" : "Attempt";

                                return (
                                    <a
                                        key={run.instanceId}
                                        href={`/pcgr/${run.instanceId}`}
                                        className={`dungeon-dot-node ${successful ? "dot-clear" : "dot-fail"}`}
                                        aria-label={`${label} - ${formatDuration(run.activityDurationSeconds)}, ${formatRunAge(run.period)}`}
                                        onBlur={() => setGraphTooltip(null)}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            navigate(`/pcgr/${run.instanceId}`);
                                        }}
                                        onFocus={() =>
                                            showGraphTooltip(run, successful, {
                                                x,
                                                y,
                                            })
                                        }
                                        onMouseEnter={(event) => showGraphMouseTooltip(event, run, successful)}
                                        onMouseLeave={() => setGraphTooltip(null)}
                                        onMouseMove={(event) => showGraphMouseTooltip(event, run, successful)}
                                    >
                                        <circle cx={x} cy={y} r={GRAPH_DOT_RADIUS} />
                                        {isFlawless && (
                                            <text
                                                x={x}
                                                y={y}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                alignmentBaseline="central"
                                                fontSize="10"
                                                fill="white"
                                                pointerEvents="none"
                                                style={{ userSelect: "none", fontFamily: "serif" }}
                                            >★</text>
                                        )}
                                    </a>
                                );
                            })}
                        </svg>
                        {graphTooltip && (
                            <div
                                className="dungeon-dot-tooltip"
                                data-placement={graphTooltip.placement}
                                style={{
                                    left: `${graphTooltip.x}px`,
                                    top: `${Math.max(28, Math.min(graphTooltip.y, 48))}px`,
                                }}
                            >
                                <div className="dungeon-dot-tooltip-time">
                                    <span
                                        className={`dungeon-dot-tooltip-marker ${graphTooltip.successful ? "dot-clear" : "dot-fail"
                                            }`}
                                    />
                                    {graphTooltip.duration}
                                </div>
                                <div className="dungeon-dot-tooltip-age">
                                    {graphTooltip.age}
                                </div>
                            </div>
                        )}
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
                        {formatTimePlayed(totalSeconds)}
                    </div>
                    <div className="dungeon-stat-label">TIME PLAYED</div>
                </div>
                <div className="dungeon-stat-col">
                    <div className="dungeon-stat-value">
                        {formatNumber(solos)}
                    </div>
                    <div className="dungeon-stat-label">SOLOS</div>
                </div>
                <div className="dungeon-stat-col">
                    <div className="dungeon-stat-value">
                        {formatNumber(soloFlawlesses)}
                    </div>
                    <div className="dungeon-stat-label">SOLO FLAWLESSES</div>
                </div>
            </div>
        </div>
    );
};
