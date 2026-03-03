import type { ActivitesComponent, BungieResponse, DungeonActivitesData } from "../enums/bungie-api-enums";
import { bungieRequest } from "./bungie-api-helper";

export async function getDungeonStats(
    membershipType: string,
    destinyMembershipId: string,
    characterIds: number[]
) {
    const fetchCharacter = async (characterId: number) => {
        const dungeonStats: DungeonActivitesData[] = [];
        let page = 0;

        let dungeonApi = await bungieRequest<BungieResponse<ActivitesComponent>>(
            `/Destiny2/${membershipType}/Account/${destinyMembershipId}/Character/${characterId}/Stats/Activities/?mode=82&count=250&page=${page}`
        );

        dungeonStats.push(...dungeonApi.Response.activities);

        while (dungeonStats.length % 250 === 0) {
            page += 1;

            dungeonApi = await bungieRequest<BungieResponse<ActivitesComponent>>(
                `/Destiny2/${membershipType}/Account/${destinyMembershipId}/Character/${characterId}/Stats/Activities/?mode=82&count=250&page=${page}`
            );

            dungeonStats.push(...dungeonApi.Response.activities);
        }

        return dungeonStats;
    };

    try {
        const res = await Promise.all(
            characterIds.map((x) => fetchCharacter(x))
        );

        return res.flat();
    }
    catch (e) {
        console.error(e);
        return [];
    }
}



export async function parseDungeonStats(dungeonStats: DungeonActivitesData[]) {
    const parsedStats = dungeonStats.map(x => {
        return {
            instanceId: x.activityDetails.instanceId,
            referenceId: x.activityDetails.referenceId,
            period: x.period,
            kills: x.values.kills.basic.value,
            deaths: x.values.deaths.basic.value,
            assists: x.values.assists.basic.value,
            completed: x.values.completed.basic.value
        }
    });

    console.log(parsedStats);
    return parsedStats;
}