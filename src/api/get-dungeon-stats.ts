import type { ActivitesComponent, BungieResponse, DungeonActivitesData, ParsedRun } from "../enums/bungie-api-enums";
import { bungieRequest } from "./bungie-api-helper";

export async function getDungeonStats(
    membershipType: string,
    destinyMembershipId: string,
    characterIds: number[]
) {
    const fetchCharacter = async (characterId: number) => {
        const allActivities: DungeonActivitesData[] = [];
        let page = 0;

        while (true) {
            const res = await bungieRequest<BungieResponse<ActivitesComponent>>(
                `/Destiny2/${membershipType}/Account/${destinyMembershipId}/Character/${characterId}/Stats/Activities/?mode=82&count=250&page=${page}`
            );

            // bungie pages history forever, empty page means we're done
            const activities = res.Response?.activities;
            if (!activities || activities.length === 0) break;

            allActivities.push(...activities);

            if (activities.length < 250) break;

            page++;
        }

        return allActivities;
    };

    // one broken character shouldnt kill the whole profile
    const results = await Promise.allSettled(
        characterIds.map((x) => fetchCharacter(x))
    );

    return results
        .filter((r): r is PromiseFulfilledResult<DungeonActivitesData[]> => r.status === "fulfilled")
        .flatMap((r) => r.value);
}

export function parseDungeonStats(dungeonStats: DungeonActivitesData[]): ParsedRun[] {
    return dungeonStats.map(x => ({
        directorActivityHash: x.activityDetails.directorActivityHash,
        referenceId: x.activityDetails.referenceId,
        instanceId: x.activityDetails.instanceId,
        period: x.period,
        kills: x.values.kills.basic.value,
        deaths: x.values.deaths.basic.value,
        assists: x.values.assists.basic.value,
        completed: x.values.completed.basic.value === 1,
        completionReason: x.values.completionReason?.basic.value ?? 0,
        activityDurationSeconds: x.values.activityDurationSeconds?.basic.value ?? 0,
        playerCount: x.values.playerCount?.basic.value ?? 0,
    }));
}
