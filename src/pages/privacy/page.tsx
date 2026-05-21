export const PrivacyPage = () => {
    return (
        <div className="faq-page">
            <div className="faq-shell">
                <h1 className="faq-heading">Privacy Policy</h1>
                <p className="faq-answer" style={{ marginBottom: "32px" }}>
                    Last updated: May 21, 2026
                </p>

                <div className="faq-list">
                    <div className="faq-item">
                        <p className="faq-question">No personal data is collected</p>
                        <p className="faq-answer">
                            Dungeon Radar does not collect, store, or transmit any personal
                            information. There are no user accounts, no registration, and no
                            login. The site has no backend, meaning all requests go directly from your
                            browser to the Bungie API.
                        </p>
                    </div>

                    <div className="faq-item">
                        <p className="faq-question">What we store locally</p>
                        <p className="faq-answer">
                            This site uses your browser's localStorage to cache Destiny 2
                            activity definitions (names and images) from the Bungie manifest.
                            This cache exists purely for performance; it avoids re-fetching the
                            same static data on every visit. It contains no personal information
                            and can be cleared at any time by clearing your browser's site data.
                        </p>
                    </div>

                    <div className="faq-item">
                        <p className="faq-question">Third-party services</p>
                        <p className="faq-answer">
                            All game data is retrieved from the{" "}
                            <a
                                href="https://bungie-net.github.io/multi/index.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="faq-link"
                            >
                                Bungie API
                            </a>
                            . Your requests to look up a player are subject to Bungie's own{" "}
                            <a
                                href="https://www.bungie.net/en/Legal/PrivacyPolicy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="faq-link"
                            >
                                Privacy Policy
                            </a>
                            . Dungeon Radar does not use any analytics, advertising, or
                            tracking services.
                        </p>
                    </div>

                    <div className="faq-item">
                        <p className="faq-question">Cookies</p>
                        <p className="faq-answer">
                            This site does not use cookies.
                        </p>
                    </div>

                    <div className="faq-item">
                        <p className="faq-question">Children's privacy</p>
                        <p className="faq-answer">
                            This site does not knowingly collect any information from anyone.
                            Since no data is collected at all, it presents no particular risk to
                            users of any age.
                        </p>
                    </div>

                    <div className="faq-item">
                        <p className="faq-question">Changes to this policy</p>
                        <p className="faq-answer">
                            If this policy changes, the updated version will be posted on this
                            page with a revised date. Changes take effect immediately upon
                            posting.
                        </p>
                    </div>

                    <div className="faq-item">
                        <p className="faq-question">Contact</p>
                        <p className="faq-answer">
                            Questions about this policy can be sent to{" "}
                            <a href="mailto:d2dungeonoracle@gmail.com" className="faq-link">
                                d2dungeonoracle@gmail.com
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
