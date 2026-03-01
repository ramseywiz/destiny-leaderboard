import type { ActivitesComponent, BungieResponse, DestinyProfileResponse, DungeonActivitesData } from "../enums/bungie-api-enums";
import { bungieRequest } from "./bungie-api-helper";

export async function getDungeonStats(
    membershipType: string,
    destinyMembershipId: string) 
    {    

   const dungeonStats: DungeonActivitesData[] = [];
    
    try {
        const data = await bungieRequest<BungieResponse<DestinyProfileResponse>>(`/Destiny2/${membershipType}/Profile/${destinyMembershipId}/?components=Profiles, Characters`, {
            method: "GET"
        });

        const characterIds = data.Response.profile.data.characterIds;
        let page = 0;

        let dungeonApi = await bungieRequest<BungieResponse<ActivitesComponent>>(`/Destiny2/${membershipType}/Account/${destinyMembershipId}/Character/${characterIds[0]}/Stats/Activities/?mode=82&count=250&page=${page}`, {
            method: "GET"
        });

        dungeonStats.push(...dungeonApi.Response.activities);

        while (dungeonStats.length % 250 === 0) {
            page += 1;
            dungeonApi = await bungieRequest<BungieResponse<ActivitesComponent>>(`/Destiny2/${membershipType}/Account/${destinyMembershipId}/Character/${characterIds[0]}/Stats/Activities/?mode=82&count=250&page=${page}`, {
                method: "GET"
            });

            dungeonStats.push(...dungeonApi.Response.activities);
        }

        //console.log(dungeonStats);
        return dungeonStats;
    }
    catch (e) {
        console.error(e);
        return [];
    }{}
    //const activityStats = await bungieRequest(`/Destiny2/${membershipType}/Account/${destinyMembershipId}/Character/${characterIds[0]}/Stats/AggregateActivityStats/`);
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