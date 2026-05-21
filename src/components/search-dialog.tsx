import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bungieRequest } from "../api/bungie-api-helper";
import type {
    BungieResponse,
    DestinyProfileResponse,
    UserInfoCard,
    UserSearchResponse,
} from "../enums/bungie-api-enums";

const BUNGIE_ROOT = "https://www.bungie.net";
const MIN_QUERY_LENGTH = 1;
const DEBOUNCE_MS = 350;

interface SearchResult {
    membershipId: string;
    membershipType: number;
    displayName: string;
    displayNameCode: string;
}

const pickPrimaryMembership = (memberships: UserInfoCard[]): UserInfoCard | null => {
    if (memberships.length === 0) return null;
    const crossSave = memberships.find(
        (m) => m.crossSaveOverride !== 0 && m.membershipType === m.crossSaveOverride
    );
    return crossSave ?? memberships[0];
};

const cardToResult = (card: UserInfoCard): SearchResult | null => {
    if (!card.membershipId || !card.membershipType) return null;
    return {
        membershipId: String(card.membershipId),
        membershipType: card.membershipType,
        displayName: card.bungieGlobalDisplayName || card.displayName || "Unknown",
        displayNameCode: String(card.bungieGlobalDisplayNameCode ?? "").padStart(4, "0"),
    };
};

const getExactQueryParts = (
    value: string
): { displayName: string; displayNameCode: string } | null => {
    const trimmed = value.trim();
    const hashIndex = trimmed.lastIndexOf("#");
    if (hashIndex === -1) return null;

    const displayName = trimmed.slice(0, hashIndex).trim();
    const displayNameCode = trimmed.slice(hashIndex + 1).trim();
    if (!displayName || !/^\d{4}$/.test(displayNameCode)) return null;

    return { displayName, displayNameCode };
};

type EmblemFetchResult =
    | { status: "ok"; url: string }
    | { status: "no_characters" }
    | { status: "error" };

const fetchEmblemPath = async (
    membershipType: number,
    membershipId: string
): Promise<EmblemFetchResult> => {
    try {
        const res = await bungieRequest<BungieResponse<DestinyProfileResponse>>(
            `/Destiny2/${membershipType}/Profile/${membershipId}/?components=200`
        );
        const chars = res.Response?.characters?.data;
        if (!chars || Object.keys(chars).length === 0) return { status: "no_characters" };
        const firstCharId = Object.keys(chars)[0];
        const emblemPath = chars[firstCharId]?.emblemPath;
        if (!emblemPath) return { status: "no_characters" };
        return { status: "ok", url: `${BUNGIE_ROOT}${emblemPath}` };
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("404")) return { status: "no_characters" };
        return { status: "error" };
    }
};

export const SearchDialog = ({ onClose }: { onClose: () => void }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [emblems, setEmblems] = useState<Record<string, string>>({});
    const [invalidIds, setInvalidIds] = useState<Set<string>>(new Set());
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingEmblems, setIsLoadingEmblems] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const emblemAbortRef = useRef<AbortController | null>(null);
    const exactSubmitInFlightRef = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, []);

    useEffect(() => {
        if (results.length === 0) {
            setIsLoadingEmblems(false);
            return;
        }

        emblemAbortRef.current?.abort();
        const controller = new AbortController();
        emblemAbortRef.current = controller;

        setEmblems({});
        setInvalidIds(new Set());

        Promise.allSettled(
            results.map((r) => fetchEmblemPath(r.membershipType, r.membershipId).then((result) => ({ r, result })))
        ).then((settled) => {
            if (controller.signal.aborted) return;
            const newEmblems: Record<string, string> = {};
            const newInvalid = new Set<string>();
            settled.forEach((s) => {
                if (s.status !== "fulfilled") return;
                const { r, result } = s.value;
                if (result.status === "ok") newEmblems[r.membershipId] = result.url;
                else if (result.status === "no_characters") newInvalid.add(r.membershipId);
            });
            setEmblems(newEmblems);
            setInvalidIds(newInvalid);
            setIsLoadingEmblems(false);
        });

        return () => controller.abort();
    }, [results]);

    const runSearch = async (q: string) => {
        const trimmed = q.trim();
        if (trimmed.length < MIN_QUERY_LENGTH) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(false);

        try {
            const hashIndex = trimmed.lastIndexOf("#");
            const isExact =
                hashIndex !== -1 &&
                trimmed.slice(0, hashIndex).length > 0 &&
                trimmed.slice(hashIndex + 1).length > 0;

            if (isExact) {
                const displayName = trimmed.slice(0, hashIndex);
                const displayNameCode = trimmed.slice(hashIndex + 1);
                const res = await bungieRequest<BungieResponse<UserInfoCard[]>>(
                    "/Destiny2/SearchDestinyPlayerByBungieName/-1/",
                    {
                        method: "POST",
                        body: JSON.stringify({ displayName, displayNameCode }),
                    }
                );
                const cards: UserInfoCard[] = res.Response ?? [];
                const primary = pickPrimaryMembership(cards);
                const result = primary ? cardToResult(primary) : null;
                const next = result ? [result] : [];
                if (next.length > 0) setIsLoadingEmblems(true);
                setResults(next);
            } else {
                const res = await bungieRequest<BungieResponse<UserSearchResponse>>(
                    "/User/Search/GlobalName/0/",
                    {
                        method: "POST",
                        body: JSON.stringify({ displayNamePrefix: trimmed }),
                    }
                );
                const searchResults = res.Response?.searchResults ?? [];
                const mapped: SearchResult[] = searchResults.flatMap((sr) => {
                    const primary = pickPrimaryMembership(sr.destinyMemberships);
                    if (!primary) return [];
                    const result = cardToResult(primary);
                    return result ? [result] : [];
                });
                if (mapped.length > 0) setIsLoadingEmblems(true);
                setResults(mapped);
            }
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
            setHasSearched(true);
        }
    };

    const findExactMatch = async (q: string): Promise<SearchResult | null> => {
        const exactQuery = getExactQueryParts(q);
        if (!exactQuery) return null;

        const res = await bungieRequest<BungieResponse<UserInfoCard[]>>(
            "/Destiny2/SearchDestinyPlayerByBungieName/-1/",
            {
                method: "POST",
                body: JSON.stringify(exactQuery),
            }
        );
        const cards: UserInfoCard[] = res.Response ?? [];
        const primary = pickPrimaryMembership(cards);
        const result = primary ? cardToResult(primary) : null;
        if (!result) return null;

        const nameMatches = result.displayName === exactQuery.displayName;
        const codeMatches = result.displayNameCode === exactQuery.displayNameCode;
        return nameMatches && codeMatches ? result : null;
    };

    const handleExactSubmit = async () => {
        if (!getExactQueryParts(query) || exactSubmitInFlightRef.current) return;

        exactSubmitInFlightRef.current = true;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        try {
            const result = await findExactMatch(query);
            if (result) handleSelect(result);
        } catch {
            return;
        } finally {
            exactSubmitInFlightRef.current = false;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setFocusedIndex(-1);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(val), DEBOUNCE_MS);
    };

    const handleSelect = (result: SearchResult) => {
        navigate(`/report/${result.membershipType}/${result.membershipId}`);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedIndex((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedIndex((i) => Math.max(i - 1, -1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            void handleExactSubmit();
        }
    };

    const isLoading = isSearching || isLoadingEmblems;
    const visibleResults = results.filter((r) => !invalidIds.has(r.membershipId));
    const showResults = !isLoading && (visibleResults.length > 0 || hasSearched);

    return (
        <div className="search-overlay" onMouseDown={onClose}>
            <div
                className="search-dialog"
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <div className="search-input-row">
                    <svg
                        className="search-input-icon"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.75" />
                        <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                    <input
                        ref={inputRef}
                        className="search-dialog-input"
                        type="text"
                        value={query}
                        onChange={handleChange}
                        placeholder="Search for a Guardian..."
                        spellCheck={false}
                        autoComplete="off"
                    />
                    {isLoading && <span className="search-spinner" aria-label="Searching" />}
                </div>

                {showResults && (
                    <div className="search-results">
                        {visibleResults.length > 0 ? (
                            visibleResults.map((r, i) => {
                                const emblemUrl = emblems[r.membershipId];
                                return (
                                    <button
                                        key={`${r.membershipType}-${r.membershipId}`}
                                        className={`search-result-row${i === focusedIndex ? " is-focused" : ""}`}
                                        onClick={() => handleSelect(r)}
                                    >
                                        <div className="search-result-icon-wrap">
                                            {emblemUrl && (
                                                <img
                                                    className="search-result-icon"
                                                    src={emblemUrl}
                                                    alt=""
                                                    draggable={false}
                                                />
                                            )}
                                        </div>
                                        <span className="search-result-name">
                                            {r.displayName}
                                            <span className="search-result-code">#{r.displayNameCode}</span>
                                        </span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="search-no-results">No Guardians found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
