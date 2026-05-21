# Dungeon Radar

Destiny 2 dungeon stat tracker. Type in a Bungie name, pull the guardian's dungeon history, and show it in a nice looking UI, along with specific instance viewing.

## How the data works

Everything comes from Bungie's public API. The app does not store player data on its own server.

When you open a player page, the app starts with the Destiny profile endpoint:

```txt
/Destiny2/{membershipType}/Profile/{membershipId}/?components=100,200
```

That gives us the Bungie display name, characters, emblem info, and the character ids needed to pull activity history.

For each character, the app queries dungeon activity history with `mode=82`:

```txt
/Destiny2/{membershipType}/Account/{membershipId}/Character/{characterId}/Stats/Activities/?mode=82&count=250&page={page}
```

Bungie pages those results, so the app keeps requesting pages until it gets an empty page or a page smaller than 250 items. Each character request is allowed to fail on its own, because one busted character response should not kill the whole profile.

After that, the raw activity rows get flattened into the smaller shape the UI uses:

- activity hashes
- instance id
- date
- kills, deaths, assists
- completed state
- completion reason
- duration
- player count

The activity hashes are then matched against Bungie's manifest to figure out which dungeon each run belongs to. The app tries `referenceId` first, then falls back to `directorActivityHash` for variants that do not resolve cleanly. Manifest activity definitions are cached in `localStorage`, and the cache is cleared when Bungie's manifest version changes.

Dungeon cards are driven by the local `DUNGEON_DEFINITIONS` list. Since Destiny 2 is now EOL, this list will never need to change!

## How stats are parsed

**This system is not perfect but it's good enough without including an API/crawler to parse all activity records.**

Runs are deduped by `instanceId` so the same activity does not get counted twice. If multiple rows exist for the same instance, the app keeps the best-looking row first: successful completions beat partial completions, cleaner completion reasons beat worse ones, and higher-kill rows win after that.

A clear counts when:

- Bungie says the run completed
- `completionReason` is `0` or `1`

The timeline graph shows clears plus meaningful failed attempts. Failed attempts need enough data to matter: more than two players, longer than five minutes, at least one kill, and not an orbit/quit-style completion reason. This closely matches how dungeon.report filters their "red dots".

Speed time is the sum of each dungeon's personal best clear. Total dungeon time is the sum of deduped dungeon activity duration. Solo and solo flawless counts come from completed runs where `playerCount === 1`, with solo flawless also requiring zero deaths.

## Running locally

Install deps:

```sh
npm install
```

Create a `.env` file:

```txt
VITE_BUNGIE_API_KEY=your_bungie_api_key_here
```

Start the app:

```sh
npm run dev
```