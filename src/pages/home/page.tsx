import { useState } from "react";
import { SearchDialog } from "../../components/search-dialog";

export const HomePage = () => {
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <>
            <div className="home-page">
                <section className="home-hero">
                    <div className="home-hero-content">
                        <h1 className="home-title">Dungeon Oracle</h1>
                        <p className="home-tagline">
                            View guardian's dungeon stats, with stats sourcing from a roaming Vex Hydra.
                        </p>
                        <button
                            className="home-search-btn"
                            onClick={() => setSearchOpen(true)}
                        >
                            <svg
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.75" />
                                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                            </svg>
                            Search for a Guardian...
                        </button>
                    </div>
                </section>
            </div>

            {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
        </>
    );
};
