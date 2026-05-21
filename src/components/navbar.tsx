import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { SearchDialog } from "./search-dialog";

export const Navbar = () => {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <nav className="navbar">
                <div className="navbar-inner">
                    <Link to="/" className="navbar-brand">
                        Dungeon Radar
                    </Link>

                    <button
                        className="navbar-search-trigger"
                        onClick={() => setDialogOpen(true)}
                        aria-label="Open search"
                    >
                        <svg
                            className="navbar-search-trigger-icon"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.75" />
                            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                        </svg>
                        <span className="navbar-search-trigger-text">Search for a Guardian...</span>
                    </button>

                    <div className="navbar-right">
                        <NavLink
                            to="/about"
                            className={({ isActive }) =>
                                `navbar-faq-link${isActive ? " is-active" : ""}`
                            }
                        >
                            About
                        </NavLink>
                        <NavLink
                            to="/faq"
                            className={({ isActive }) =>
                                `navbar-faq-link${isActive ? " is-active" : ""}`
                            }
                        >
                            FAQ
                        </NavLink>
                    </div>
                </div>
            </nav>

            {dialogOpen && <SearchDialog onClose={() => setDialogOpen(false)} />}
        </>
    );
};
