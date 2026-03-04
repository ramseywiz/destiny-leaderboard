interface PlayerBannerProps {
    playerName: string;
    playerCode: string;
    bannerUrl: string;
    iconUrl: string;
}

export const PlayerBanner = ({ playerName, playerCode, bannerUrl, iconUrl }: PlayerBannerProps) => {
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
                    {playerName}<span style={{ color: 'gray' }}>#{playerCode}</span>
                </div>
                <div className="player-info">

                    <div className="player-stats">
                        <StatBox title="Clears" value="-" />
                        <StatBox title="Speed Sum" value="-" />
                        <StatBox title="Play Time" value="-" />
                    </div>
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