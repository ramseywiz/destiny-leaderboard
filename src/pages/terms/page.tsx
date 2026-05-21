export const TermsPage = () => {
    return (
        <div className="faq-page">
            <div className="faq-shell">
                <h1 className="faq-heading">Terms of Use</h1>
                <p className="faq-answer" style={{ marginBottom: "32px" }}>
                    Last updated: May 21, 2026
                </p>

                <div className="faq-list">
                    <div className="faq-item">
                        <p className="faq-question">Acceptance of terms</p>
                        <p className="faq-answer">
                            By accessing or using Dungeon Oracle ("the site"), you agree to
                            these Terms of Use. If you do not agree, please do not use the site.
                        </p>
                    </div>

                    <div className="faq-item">
                        <p className="faq-question">What this site is</p>
                        <p className="faq-answer">
                            Dungeon Oracle is a free, read-only stat viewer for Destiny 2
                            dungeon activity. It is a fan-made project and is not affiliated
                            with, endorsed by, or sponsored by Bungie, Inc. Destiny 2 and all
                            related marks are trademarks of Bungie, Inc.
                        </p>
                    </div>

                    <div className="faq-item">
                        <p className="faq-question">Use of data</p>
                        <p className="faq-answer">
                            All game data displayed on this site is sourced from the public
                            Bungie API and is subject to{" "}
                            <a
                                href="https://www.bungie.net/en/Legal/Terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="faq-link"
                            >
                                Bungie's Terms of Service
                            </a>
                            . The data is provided as-is and may not always be accurate,
                            complete, or up to date.
                        </p>
                    </div>

                    <div className="faq-item">
                        <p className="faq-question">Permitted use</p>
                        <p className="faq-answer">
                            You may use this site for personal, non-commercial purposes. You may
                            not scrape, automate, or use the site in any way that places
                            excessive load on the Bungie API or circumvents Bungie's rate limits.
                        </p>
                    </div>

                    <div className="faq-item">
                        <p className="faq-question">No warranty</p>
                        <p className="faq-answer">
                            This site is provided "as is" without warranty of any kind. We make
                            no guarantees regarding uptime, accuracy, or availability. The site
                            may be unavailable at any time and may be discontinued without
                            notice.
                        </p>
                    </div>

                    <div className="faq-item">
                        <p className="faq-question">Limitation of liability</p>
                        <p className="faq-answer">
                            To the fullest extent permitted by law, Dungeon Oracle and its
                            developer shall not be liable for any damages arising from your use
                            of, or inability to use, this site or the information it provides.
                        </p>
                    </div>

                    <div className="faq-item">
                        <p className="faq-question">Changes to these terms</p>
                        <p className="faq-answer">
                            These terms may be updated at any time. Continued use of the site
                            after changes are posted constitutes acceptance of the revised terms.
                        </p>
                    </div>

                    <div className="faq-item">
                        <p className="faq-question">Contact</p>
                        <p className="faq-answer">
                            Questions about these terms can be sent to{" "}
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
