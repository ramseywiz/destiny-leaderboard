export interface UserInfoCard {
    supplementalDisplayName?: string,
    iconPath?: string;
    crossSaveOverride?: number;
    applicableMembershipTypes?: number[];
    isPublic?: boolean;
    membershipType?: number;
    membershipId?: number;
    displayName?: string;
    bungieGlobalDisplayName: string;
    bungieGlobalDisplayNameCode: string;
};

export interface BungieResponse<T> {
    Response: T;
    ErrorCode: number;
    ThrottleSeconds: number;
    ErrorStatus: string;
    Message: string;
    MessageData: Record<string, string>;
};

export interface EmblemLookupResponse {
    displayProperties: {
        icon: string;
    };
    secondarySpecial: string;
}

export interface DestinyProfileResponse {
    responseMintedTimestamp: Date;
    secondaryComponentsMintedTimestamp: Date;
    profile: ProfilesComponent;
    characters: CharactersComponent;
};

export interface CharactersComponent {
    data: CharactersData;
}

export interface CharactersData {
    [characterId: string]: DestinyCharacter;
}

export interface DestinyCharacter {
    membershipId: string;
    membershipType: number;
    characterId: string;
    dateLastPlayed: string;
    minutesPlayedThisSession: string;
    minutesPlayedTotal: string;
    light: number;
    stats: Record<string, number>;
    raceHash: number;
    genderHash: number;
    classHash: number;
    raceType: number;
    classType: number;
    genderType: number;
    emblemPath: string;
    emblemBackgroundPath: string;
    emblemHash: number;
    emblemColor: {
        red: number;
        green: number;
        blue: number;
        alpha: number;
    };
    baseCharacterLevel: number;
    percentToNextLevel: number;
    titleRecordHash?: number;
}

export interface ProfilesComponent {
    data: ProfilesComponentData;
    privacy: number;
}

export interface ProfilesComponentData {
    characterIds: number[];
    userInfo: UserInfoCard;
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
    directorActivityHash: number;
    instanceId: string;
    isPrivate: boolean;
    referenceId: number;
}

export interface DungeonValues {
    [key: string]: BasicStat;
}

export interface BasicStat {
    basic: StatObject;
}

export interface StatObject {
    displayValue: string;
    value: number;
}

export interface DestinyPostGameCarnageReport {
    period: string;
    activityWasStartedFromBeginning?: boolean;
    activityDetails: {
        referenceId: number;
        directorActivityHash: number;
        instanceId: string;
        mode?: number;
        modes?: number[];
        membershipType?: number;
        isPrivate?: boolean;
    };
    entries: DestinyPostGameCarnageEntry[];
    teams?: unknown[];
}

export interface DestinyPostGameCarnageEntry {
    characterId: string;
    standing?: number;
    score?: BasicStat;
    player: {
        destinyUserInfo: {
            membershipType: number;
            membershipId: string;
            displayName?: string;
            bungieGlobalDisplayName?: string;
            bungieGlobalDisplayNameCode?: number;
            iconPath?: string;
            applicableMembershipTypes?: number[];
        };
        characterClass?: string;
        classHash?: number;
        raceHash?: number;
        genderHash?: number;
        lightLevel?: number;
        emblemHash?: number;
    };
    values: {
        completed?: BasicStat;
        completionReason?: BasicStat;
        activityDurationSeconds?: BasicStat;
        kills?: BasicStat;
        deaths?: BasicStat;
        assists?: BasicStat;
        killsDeathsRatio?: BasicStat;
        timePlayedSeconds?: BasicStat;
        totalKillDistance?: BasicStat;
        [key: string]: BasicStat | undefined;
    };
    extended?: {
        values?: {
            weaponKillsSuper?: BasicStat;
            weaponKillsGrenade?: BasicStat;
            weaponKillsMelee?: BasicStat;
            [key: string]: BasicStat | undefined;
        };
        weapons?: unknown[];
    };
}

export interface DestinyActivityDefinition {
    displayProperties: {
        name: string;
        description: string;
        icon: string;
        hasIcon: boolean;
    };
    pgcrImage: string;
    activityTypeHash: number;
    activityModeTypes: number[];
    isPvP: boolean;
}

export interface ParsedRun {
    directorActivityHash: number;
    referenceId: number;
    instanceId: string;
    period: Date;
    kills: number;
    deaths: number;
    assists: number;
    completed: boolean;
    completionReason: number;
    activityDurationSeconds: number;
    playerCount: number;
}

export interface DungeonGroup {
    id: string;
    representativeHash: number;
    activityName: string;
    pgcrImage: string;
    runs: ParsedRun[];
}
