import { useParams } from "react-router-dom";
import { getDungeonStats, parseDungeonStats } from "../../api/get-dungeon-stats";
import { PlayerBanner } from "../../components/report/player-banner";
import { useEffect, useRef, useState } from "react";
import { bungieRequest } from "../../api/bungie-api-helper";
import type { BungieResponse, DestinyProfileResponse, EmblemLookupResponse } from "../../enums/bungie-api-enums";

export const SummaryPage = () => {
    const { platform, membershipId } = useParams();

    const [playerName, setPlayerName] = useState<string>("-");
    const [bannerUrl, setBannerUrl] = useState<string>("");
    const [iconUrl, setIconUrl] = useState<string>("");
    const [dungeonStats, setDungeonStats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        if (!platform || !membershipId) return;

        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const profileRes = await bungieRequest<BungieResponse<DestinyProfileResponse>>(`/Destiny2/${platform}/Profile/${membershipId}/?components=100, 200`);

                const profileData = profileRes.Response.profile.data.userInfo;
                const charactersData = profileRes.Response.characters.data;
                const characterIds = profileRes.Response.profile.data.characterIds;

                if (!characterIds || characterIds.length === 0) {
                    throw new Error("No characters found");
                }

                const firstChar = charactersData[characterIds[0]];

                setPlayerName(`${profileData.bungieGlobalDisplayName}#${profileData.bungieGlobalDisplayNameCode}`);

                const emblemRes = await bungieRequest<BungieResponse<EmblemLookupResponse>>(`/Destiny2/Manifest/DestinyInventoryItemDefinition/${firstChar.emblemHash}/`);

                setBannerUrl(`https://www.bungie.net${emblemRes.Response.secondarySpecial}`);
                setIconUrl(`https://www.bungie.net${emblemRes.Response.displayProperties.icon}`);

                const rawDungeonData = await getDungeonStats(platform, membershipId, characterIds);

                const parsedData = await parseDungeonStats(rawDungeonData);
                setDungeonStats(parsedData);

            } catch (e) {
                console.error("Failed to fetch data:", e);
                setPlayerName("Unknown Guardian");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [platform, membershipId]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PlayerBanner playerName={playerName} bannerUrl={bannerUrl} iconUrl={iconUrl} />
            <div style={{ marginTop: "20px" }}>
                {isLoading ? (
                    <p>Loading dungeon stats...</p>
                ) : (
                    <div>
                        <p>Successfully loaded {dungeonStats.length} dungeon records.</p>
                    </div>
                )}
            </div>
        </div>
    );
}