import { useParams } from "react-router-dom";
import { getDungeonStats, parseDungeonStats } from "../../api/get-dungeon-stats";

export const SummaryPage = () => {
    const { platform, membershipId } = useParams();

    const handleAddRow = async () => {
        if (platform === undefined || membershipId === undefined) return;
        
        try {
            const dungeonData = await getDungeonStats(platform, membershipId);
            const parsedData = await parseDungeonStats(dungeonData);
            console.log(parsedData);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            <h1>{platform} - {membershipId}</h1>
            <button onClick={handleAddRow}>Load Dungeon Stats</button>
        </div>
    );
}