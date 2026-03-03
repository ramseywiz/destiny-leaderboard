interface PlayerBannerProps {
    playerName: string;
    bannerUrl: string | null;
}

export const PlayerBanner = ({ playerName, bannerUrl }: PlayerBannerProps) => {
    return (
        <div style={{
            width: "90%",
            height: "186px",
            backgroundImage: bannerUrl ? `url(${bannerUrl})` : "none",
            backgroundColor: "#1a1a1a",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "white",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            borderRadius: "4px",
        }}>
            <h2 style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)", margin: 0 }}>
                {playerName}
            </h2>
        </div>
    );
}