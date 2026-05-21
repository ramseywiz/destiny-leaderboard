const FAQ_ITEMS = [
    {
        q: "Is this project open sourced?",
        a: (
            <>
                Yes,{" "}
                <a
                    href="https://github.com/ramseywiz/destiny-leaderboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="faq-link"
                >
                    github.com/ramseywiz/destiny-leaderboard
                </a>
                .
            </>
        ),
    },
    {
        q: "I can't look up certain players. Why?",
        a: "Their profiles are most likely private. If you want your stats to show up, navigate to your Bungie account and set your privacy settings to Public.",
    },
    {
        q: "Why are some of my stats different from dungeon.report?",
        a: "This site doesn't do the intense processing that dungeon.report does, meaning some runs (like checkpoint vs. fresh clears) will skew stats on player pages.",
    },
    {
        q: "This site looks familiar...",
        a: (
            <>
                This site&apos;s design is heavily inspired by{" "}
                <a
                    href="https://raidhub.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="faq-link"
                >
                    raidhub.io
                </a>
                .
            </>
        ),
    },
    {
        q: "Will you eventually add leaderboards, rankings, etc.?",
        a: "Due to the recently announced end-of-life for Destiny 2, no. This site will serve purely as a stat checker for dungeons.",
    },
    {
        q: "I have a question you haven't answered...",
        a: (
            <>
                Feel free to reach out at{" "}
                <a href="mailto:d2dungeonoracle@gmail.com" className="faq-link">
                    d2dungeonoracle@gmail.com
                </a>
                .
            </>
        ),
    },
];

export const FaqPage = () => {
    return (
        <div className="faq-page">
            <div className="faq-shell">
                <h1 className="faq-heading">FAQ</h1>
                <div className="faq-list">
                    {FAQ_ITEMS.map((item, i) => (
                        <div key={i} className="faq-item">
                            <p className="faq-question">{item.q}</p>
                            <p className="faq-answer">{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
