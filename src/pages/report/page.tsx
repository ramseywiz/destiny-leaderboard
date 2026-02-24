import { useParams } from "react-router-dom";
import { getDungeonStats, parseDungeonStats } from "../../api/get-dungeon-stats";

export const SummaryPage = () => {
    const { membershipId } = useParams();

    const handleAddRow = async () => {
        try {
            const dungeonData = await getDungeonStats({
                displayName: "ram",
                displayNameCode: 2028
            });

            const parsedData = await parseDungeonStats(dungeonData);
            console.log(parsedData);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            <h1>{membershipId}</h1>
            <button onClick={handleAddRow}>Load Dungeon Stats</button>
        </div>
    );
}