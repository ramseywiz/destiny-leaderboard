export interface DungeonDefinition {
    id: string;
    name: string;
    order: number;
    representativeActivityHash: number;
    aliases: string[];
}

export const DUNGEON_DEFINITIONS: DungeonDefinition[] = [
    {
        id: "equilibrium",
        name: "Equilibrium",
        order: 1,
        representativeActivityHash: 1754635208,
        aliases: ["Equilibrium"],
    },
    {
        id: "sundered-doctrine",
        name: "Sundered Doctrine",
        order: 2,
        representativeActivityHash: 247869137,
        aliases: ["Sundered Doctrine"],
    },
    {
        id: "vespers-host",
        name: "Vesper's Host",
        order: 3,
        representativeActivityHash: 3492566689,
        aliases: ["Vesper's Host", "Vespers Host"],
    },
    {
        id: "warlords-ruin",
        name: "Warlord's Ruin",
        order: 4,
        representativeActivityHash: 2004855007,
        aliases: ["Warlord's Ruin", "Warlords Ruin"],
    },
    {
        id: "ghosts-of-the-deep",
        name: "Ghosts of the Deep",
        order: 5,
        representativeActivityHash: 313828469,
        aliases: ["Ghosts of the Deep"],
    },
    {
        id: "spire-of-the-watcher",
        name: "Spire of the Watcher",
        order: 6,
        representativeActivityHash: 1262462921,
        aliases: ["Spire of the Watcher"],
    },
    {
        id: "duality",
        name: "Duality",
        order: 7,
        representativeActivityHash: 2823159265,
        aliases: ["Duality"],
    },
    {
        id: "grasp-of-avarice",
        name: "Grasp of Avarice",
        order: 8,
        representativeActivityHash: 4078656646,
        aliases: ["Grasp of Avarice"],
    },
    {
        id: "prophecy",
        name: "Prophecy",
        order: 9,
        representativeActivityHash: 4148187374,
        aliases: ["Prophecy"],
    },
    {
        id: "pit-of-heresy",
        name: "Pit of Heresy",
        order: 10,
        representativeActivityHash: 1375089621,
        aliases: ["Pit of Heresy"],
    },
    {
        id: "shattered-throne",
        name: "Shattered Throne",
        order: 11,
        representativeActivityHash: 2032534090,
        aliases: ["Shattered Throne", "The Shattered Throne"],
    },
];

const normalizeDungeonName = (value: string): string => {
    return value
        .normalize("NFKD")
        .replace(/[''`]/g, "")
        .replace(/\b(the|master|legend|normal|contest|epic)\b/gi, "")
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase();
};

export const getDungeonDefinition = (activityName: string): DungeonDefinition | null => {
    const normalizedName = normalizeDungeonName(activityName);

    return (
        DUNGEON_DEFINITIONS.find((dungeon) =>
            dungeon.aliases.some((alias) => normalizedName.includes(normalizeDungeonName(alias)))
        ) ?? null
    );
};
