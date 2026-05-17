interface PlayerBannerProps {
    playerName: string;
    playerCode: string;
    bannerUrl: string;
    iconUrl: string;
    totalClears: number;
    speedSum: number;
    totalTimePlayed: number;
}

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
    if (d > 0) return `${d}d ${h}h`;
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export const PlayerBanner = ({
    playerName,
    playerCode,
    bannerUrl,
    iconUrl,
    totalClears,
    speedSum,
    totalTimePlayed,
}: PlayerBannerProps) => {
    return (
        <div className="player-card">
            <div
                className="player-banner"
                style={{
                    backgroundImage: bannerUrl ? `url(${bannerUrl})` : "none",
                }}
            />
            <div className="player-content">
                {iconUrl && (
                    <img
                        className="player-avatar"
                        src={iconUrl}
                        alt={`${playerName} emblem`}
                    />
                )}

                <div className="player-name-block">
                    <div className="player-name">{playerName}</div>
                    <div className="player-code">#{playerCode}</div>
                </div>

                <StatBox title="Full Clears" value={totalClears > 0 ? String(totalClears) : "--"} />
                <StatBox title="Speed Time" value={formatDuration(speedSum)} />
                <StatBox title="In Dungeon Time" value={formatTimePlayed(totalTimePlayed)} />
            </div>
        </div>
    );
};

function StatBox({ title, value }: { title: string; value: string }) {
    return (
        <div className="stat-box">
            <div className="stat-title">{title}</div>
            <div className="stat-value">{value}</div>
        </div>
    );
}
