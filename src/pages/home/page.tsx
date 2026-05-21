import { useState } from "react";
import { SearchDialog } from "../../components/search-dialog";

export const HomePage = () => {
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <>
            <div className="home-page">
                <section className="home-hero">
                    <div className="home-hero-content">
                        <h1 className="home-title">Dungeon Radar</h1>
                        <p className="home-tagline">
                            View Destiny 2 dungeon stats for any Guardian, with stats sourced directly from the Bungie API.
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
                        <p className="home-tagline">
                            Don't play Destiny?{" "}
                            <a
                                href="https://dungeonradar.com/report/3/4611686018504884058"
                                className="home-link"
                            >
                                Click here
                            </a>{" "}
                            to go to my profile and see what it looks like.
                        </p>
                    </div>
                </section>
            </div>

            {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
        </>
    );
};
