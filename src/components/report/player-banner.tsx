import { formatDuration, formatTimePlayed } from "../../utils/report-format";

interface PlayerBannerProps {
    playerName: string;
    playerCode: string;
    bannerUrl: string;
    iconUrl: string;
    totalClears: number;
    speedSum: number;
    totalTimePlayed: number;
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
                    <div className="player-name-row">
                        <span className="player-name">{playerName}</span>
                        {playerCode && <span className="player-code">#{playerCode}</span>}
                    </div>
                </div>

                <StatBox title="Full Clears" value={totalClears > 0 ? String(totalClears) : "--"} />
                <StatBox title="Speed Time" value={formatDuration(speedSum)} />
                <StatBox title="In Dungeon Time" value={formatTimePlayed(totalTimePlayed)} />
            </div>
        </div>
    );
};

const StatBox = ({ title, value }: { title: string; value: string }) => {
    return (
        <div className="stat-box">
            <div className="stat-title">{title}</div>
            <div className="stat-value">{value}</div>
        </div>
    );
};
