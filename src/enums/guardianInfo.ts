export interface DungeonDefinition {
    id: string;
    name: string;
    order: number;
    aliases: string[];
}

export const DUNGEON_DEFINITIONS: DungeonDefinition[] = [
    {
        id: "equilibrium",
        name: "Equilibrium",
        order: 1,
        aliases: ["Equilibrium"],
    },
    {
        id: "sundered-doctrine",
        name: "Sundered Doctrine",
        order: 2,
        aliases: ["Sundered Doctrine"],
    },
    {
        id: "vespers-host",
        name: "Vesper's Host",
        order: 3,
        aliases: ["Vesper's Host", "Vespers Host"],
    },
    {
        id: "warlords-ruin",
        name: "Warlord's Ruin",
        order: 4,
        aliases: ["Warlord's Ruin", "Warlords Ruin"],
    },
    {
        id: "ghosts-of-the-deep",
        name: "Ghosts of the Deep",
        order: 5,
        aliases: ["Ghosts of the Deep"],
    },
    {
        id: "spire-of-the-watcher",
        name: "Spire of the Watcher",
        order: 6,
        aliases: ["Spire of the Watcher"],
    },
    {
        id: "duality",
        name: "Duality",
        order: 7,
        aliases: ["Duality"],
    },
    {
        id: "grasp-of-avarice",
        name: "Grasp of Avarice",
        order: 8,
        aliases: ["Grasp of Avarice"],
    },
    {
        id: "prophecy",
        name: "Prophecy",
        order: 9,
        aliases: ["Prophecy"],
    },
    {
        id: "pit-of-heresy",
        name: "Pit of Heresy",
        order: 10,
        aliases: ["Pit of Heresy"],
    },
    {
        id: "shattered-throne",
        name: "Shattered Throne",
        order: 11,
        aliases: ["Shattered Throne", "The Shattered Throne"],
    },
];

function normalizeDungeonName(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/[''`]/g, "")
        .replace(/\b(the|master|legend|normal|contest|epic)\b/gi, "")
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase();
}

export function getDungeonDefinition(activityName: string): DungeonDefinition | null {
    const normalizedName = normalizeDungeonName(activityName);

    return (
        DUNGEON_DEFINITIONS.find((dungeon) =>
            dungeon.aliases.some((alias) => normalizedName.includes(normalizeDungeonName(alias)))
        ) ?? null
    );
}
