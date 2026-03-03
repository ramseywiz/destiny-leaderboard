interface PlayerBannerProps {
    playerName: string;
    bannerUrl: string;
    iconUrl: string;
}

export const PlayerBanner = ({ playerName, bannerUrl, iconUrl }: PlayerBannerProps) => {
    return (
        <div className="player-card">
            <div
                className="player-banner"
                style={{
                    backgroundImage: bannerUrl ? `url(${bannerUrl})` : "none"
                }}
            />
            <div className="player-content">
                <img
                    className="player-avatar"
                    src={iconUrl}
                />
                <div className="player-name">
                    {playerName}
                </div>
                <div className="player-stats">
                    <StatBox title="Clears" value="-" />
                    <StatBox title="In Dungeon Time" value="-" />
                </div>
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