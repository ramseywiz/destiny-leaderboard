export interface UserInfoCard {
    supplementalDisplayName?: string,
    iconPath?: string;
    crossSaveOverride?: number;
    applicableMembershipTypes?: number[];
    isPublic?: boolean;
    membershipType?: number;
    membershipId?: number;
    displayName?: string;
    bungieGlobalDisplayName?: string;
    bungieGlobalDisplayNameCode?: string;
};

export interface BungieResponse<T> {
    Response: T;
    ErrorCode: number;
    ThrottleSeconds: number;
    ErrorStatus: string;
    Message: string;
    MessageData: Record<string, string>;
};

export interface DestinyProfileResponse {
    responseMintedTimestamp: Date;
    secondaryComponentsMintedTimestamp: Date;
    profile: ProfilesComponent;
};

export interface ProfilesComponent {
    data: ProfilesComponentData;
    privacy: number;
}

export interface ProfilesComponentData {
    // there is a LOT here but for now we only care about this
    characterIds: number[];
}

export interface ActivitesComponent {
    activities: DungeonActivitesData[];
    length: number;
}

export interface DungeonActivitesData {
    activityDetails: DungeonDetails;
    period: Date;
    values: DungeonValues;
}

export interface DungeonDetails {
    directoryActivityHash: number;
    instanceId: string;
    isPrivate: boolean;
    referenceId: number;
}

export interface DungeonValues {
    /*
    assists:
    completed:
    deaths: BasicStat;
    kills: BasicStat;
    efficiency: BasicStat;
    killsDeathsRatio: BasicStat;
    killsDeathsAssists: BasicStat;
    score: BasicStat;
    activityDurationSeconds: BasicStat;
    team: BasicStat;
    completionReason: BasicStat;
    fireteamId: BasicStat;
    startSeconds: BasicStat;
    timePlayedSeconds: BasicStat;
    playerCount: BasicStat;
    teamScore: BasicStat;
    */
    [key: string]: BasicStat;
}

export interface BasicStat {
    basic: StatObject;
}

export interface StatObject {
    displayValue: string;
    value: number;
}