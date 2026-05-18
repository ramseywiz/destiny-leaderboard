import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { bungieRequest } from "../api/bungie-api-helper";
import type { BungieResponse, UserInfoCard } from "../enums/bungie-api-enums";

export const Navbar = () => {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed || isSearching) return;

        const hashIndex = trimmed.lastIndexOf("#");
        if (hashIndex === -1) return;

        const displayName = trimmed.slice(0, hashIndex);
        const displayNameCode = trimmed.slice(hashIndex + 1);

        if (!displayName || !displayNameCode) return;

        setIsSearching(true);
        setError(false);

        try {
            const res = await bungieRequest<BungieResponse<UserInfoCard[]>>(
                "/Destiny2/SearchDestinyPlayerByBungieName/-1/",
                {
                    method: "POST",
                    body: JSON.stringify({ displayName, displayNameCode }),
                }
            );

            const profile = res.Response?.[0];
            if (!profile?.membershipType || !profile?.membershipId) {
                setError(true);
                return;
            }

            navigate(`/report/${profile.membershipType}/${profile.membershipId}`);
            setQuery("");
        } catch {
            setError(true);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    Dungeon Oracle
                </Link>

                <form className="navbar-search-form" onSubmit={handleSearch}>
                    <input
                        className={`navbar-search-input${error ? " navbar-search-error" : ""}`}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setError(false);
                        }}
                        placeholder="name#0000"
                        disabled={isSearching}
                        spellCheck={false}
                        autoComplete="off"
                    />
                </form>

                <div className="navbar-right" />
            </div>
        </nav>
    );
};
