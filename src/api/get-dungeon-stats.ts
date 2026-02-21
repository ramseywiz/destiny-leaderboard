import type { ActivitesComponent, BungieResponse, DestinyProfileResponse, DungeonActivitesData, UserInfoCard } from "../bungie-api-enums";
import { bungieRequest } from "../bungie-api-helper";

export interface dungeonProps {
    displayName: string;
    displayNameCode: number;
}

export async function getDungeonStats({ displayName, displayNameCode }: dungeonProps) {
    const profile = await bungieRequest<BungieResponse<UserInfoCard[]>>("/Destiny2/SearchDestinyPlayerByBungieName/-1/", {
        method: "POST",
        body: JSON.stringify({
            displayName: displayName,
            displayNameCode: displayNameCode,
        })
    });

    const profileRes = profile.Response[0];

    const membershipType = profileRes.membershipType;
    const destinyMembershipId = profileRes.membershipId;

    const data = await bungieRequest<BungieResponse<DestinyProfileResponse>>(`/Destiny2/${membershipType}/Profile/${destinyMembershipId}/?components=Profiles, Characters`, {
        method: "GET"
    });

    const characterIds = data.Response.profile.data.characterIds;

    //const activityStats = await bungieRequest(`/Destiny2/${membershipType}/Account/${destinyMembershipId}/Character/${characterIds[0]}/Stats/AggregateActivityStats/`);
    const dungeonStats: DungeonActivitesData[] = [];


    const dungeonApi = await bungieRequest<BungieResponse<ActivitesComponent>>(`/Destiny2/${membershipType}/Account/${destinyMembershipId}/Character/${characterIds[0]}/Stats/Activities/?mode=82&count=250`, {
        method: "GET"
    });

    dungeonStats.push(...dungeonApi.Response.activities);

    let page = 0;

    while (dungeonStats.length % 250 === 0) {
        page += 1;
        const dungeonApi = await bungieRequest<BungieResponse<ActivitesComponent>>(`/Destiny2/${membershipType}/Account/${destinyMembershipId}/Character/${characterIds[0]}/Stats/Activities/?mode=82&count=250&page=${page}`, {
            method: "GET"
        });

        dungeonStats.push(...dungeonApi.Response.activities);
    }

    console.log(dungeonStats);
}