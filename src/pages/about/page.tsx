export const AboutPage = () => {
    return (
        <div className="about-page">
            <div className="about-shell">
                <h1 className="about-heading">About</h1>

                <div className="about-section">
                    <h2 className="about-subheading">What is this?</h2>
                    <p className="about-body">
                        Dungeon Radar is a stat tracker for Destiny 2 dungeons.
                        The app lets you look up any guardian by their Bungie name and view the
                        history of their dungeon runs: completion counts, clear times, flawless
                        and solo attempts, and individual instances.
                    </p>
                    <p className="about-body">
                        All data is pulled in real time directly from the{" "}
                        <a
                            href="https://bungie-net.github.io/multi/index.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="about-link"
                        >
                            Bungie API
                        </a>
                        .
                    </p>
                </div>

                <div className="about-section">
                    <h2 className="about-subheading">How to use it</h2>
                    <div className="about-steps">
                        <div className="about-step">
                            <span className="about-step-num">1</span>
                            <div>
                                <p className="about-step-title">Search for a player</p>
                                <p className="about-body">
                                    Click the search bar in the navbar or on the home page. Type a
                                    Bungie name; if you don't play Destiny, here's mine: ram#2028.
                                    (you can also{" "}
                                    <a
                                        href="https://dungeonradar.com/report/3/4611686018504884058"
                                        className="about-link"
                                    >
                                        click here
                                    </a>{" "}
                                    to directly go to my page.)
                                </p>
                            </div>
                        </div>
                        <div className="about-step">
                            <span className="about-step-num">2</span>
                            <div>
                                <p className="about-step-title">Read the profile page</p>
                                <p className="about-body">
                                    The profile page shows an overview card at the top with the
                                    player's emblem, total dungeon clears, speed time (sum of
                                    personal bests across all dungeons), and total time played in
                                    dungeons. Below that, each dungeon they have history in gets
                                    its own card.
                                </p>
                            </div>
                        </div>
                        <div className="about-step">
                            <span className="about-step-num">3</span>
                            <div>
                                <p className="about-step-title">Read a dungeon card</p>
                                <p className="about-body">
                                    Each dungeon card has a scrollable timeline graph. Green dots
                                    are successful clears, red dots are meaningful failed attempts
                                    , and both are plotted by duration. A star marks flawless clears
                                    (completed with zero deaths). The horizontal line is the median
                                    clear time. The stat rows show the fastest clear, median, most
                                    recent clear, total time played, solo count, and solo flawless count.
                                </p>
                            </div>
                        </div>
                        <div className="about-step">
                            <span className="about-step-num">4</span>
                            <div>
                                <p className="about-step-title">Inspect a single run</p>
                                <p className="about-body">
                                    Clicking any dot on the timeline, or any of the Fastest,
                                    Average, or Recent stat values, opens the Post-Game Carnage
                                    Report (PCGR) for that specific run (
                                    <a
                                        href="https://dungeonradar.com/pcgr/16686952986"
                                        className="about-link"
                                    >
                                        example run shown here
                                    </a>
                                    ). This shows the full
                                    fireteam, each player's kills, deaths, assists, K/D, and time
                                    played, along with badges for Fresh start, Flawless, Solo, and
                                    Solo Flawless completions. Clicking a player row navigates to
                                    their profile.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="about-section">
                    <h2 className="about-subheading">Tech stack</h2>
                    <p className="about-body">
                        React, TypeScript, and Vite. Routing is handled
                        by React Router. All data comes from the Bungie API; activity definitions
                        (names, images) are cached in localStorage via
                        a manifest cache provided by Bungie.
                    </p>
                    <p className="about-body">
                        The source code is publicly available on{" "}
                        <a
                            href="https://github.com/ramseywiz/destiny-leaderboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="about-link"
                        >
                            GitHub
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
};
