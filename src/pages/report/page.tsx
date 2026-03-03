import { useParams } from "react-router-dom";
import { getDungeonStats, parseDungeonStats } from "../../api/get-dungeon-stats";
import { PlayerBanner } from "../../components/player-banner";
import { useEffect, useRef, useState } from "react";
import { bungieRequest } from "../../api/bungie-api-helper";
import type { BungieResponse, DestinyProfileResponse } from "../../enums/bungie-api-enums";

export const SummaryPage = () => {
    const { platform, membershipId } = useParams();

    const [playerName, setPlayerName] = useState<string>("Loading...");
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
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

                const [rawDungeonData, emblemRes] = await Promise.all([
                    getDungeonStats(platform, membershipId, characterIds),
                    bungieRequest<any>(`/Destiny2/Manifest/DestinyInventoryItemDefinition/${firstChar.emblemHash}/`)
                ]);

                setBannerUrl(`https://www.bungie.net${emblemRes.Response.secondarySpecial}`);

                const code = profileData.bungieGlobalDisplayNameCode.toString();
                setPlayerName(`${profileData.bungieGlobalDisplayName}#${code}`);

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
            <PlayerBanner playerName={playerName} bannerUrl={bannerUrl} />
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