
import { useEffect, useRef, useState } from "react";
import {
    FaSearch,
    FaChevronDown,
    FaTimes,
} from "react-icons/fa";

function AdminFilter({
    label = "Filter",
    value = "",
    displayValue = "",
    emptyLabel = "Select option",
    onChange,
    options = [],
    disabled = false,
    searchable = true,
    searchPlaceholder = "Search...",
    onSearch,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const dropdownRef = useRef(null);

    // Find the currently selected option
    const selectedOption = options.find(
        (option) => String(option.value) === String(value)
    );

    // Filter dropdown suggestions
    const filteredOptions = options.filter((option) => {
        const searchValue = searchQuery.trim().toLowerCase();

        const searchableText = [
            option.label,
            option.searchText,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(searchValue);
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setSearchQuery("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // Select an option
    const handleSelect = (option) => {
        onChange?.(option.value);

        setIsOpen(false);
        setSearchQuery("");
    };

    // Perform backend search
    const handleSearch = () => {
        if (!onSearch || disabled) return;

        onSearch(searchQuery.trim());

        setIsOpen(false);
        setSearchQuery("");
    };

    // Toggle dropdown
    const handleToggle = () => {
        if (disabled) return;

        setIsOpen((previous) => !previous);
        setSearchQuery("");
    };

    return (
        <div className="admin-filter" ref={dropdownRef}>
            {label && <label>{label}</label>}

            {/* Dropdown trigger */}
            <button
                type="button"
                className={`admin-filter-trigger ${
                    isOpen ? "active" : ""
                }`}
                onClick={handleToggle}
                disabled={disabled}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span>
                    {displayValue ||
                        selectedOption?.label ||
                        emptyLabel}
                </span>

                <FaChevronDown
                    className={`admin-filter-arrow ${
                        isOpen ? "rotated" : ""
                    }`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="admin-filter-dropdown">

                    {/* Search input */}
                    {searchable && (
                        <div className="admin-filter-search">
                            <FaSearch />

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" &&
                                        onSearch
                                    ) {
                                        event.preventDefault();
                                        handleSearch();
                                    }
                                }}
                                placeholder={searchPlaceholder}
                                autoFocus
                            />

                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchQuery("")
                                    }
                                    aria-label="Clear search"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Backend search button - optional */}
                    {onSearch && (
                        <button
                            type="button"
                            className="admin-filter-search-button"
                            onClick={handleSearch}
                            disabled={disabled}
                        >
                            Search
                        </button>
                    )}

                    {/* Suggestions */}
                    <div
                        className="admin-filter-options"
                        role="listbox"
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`admin-filter-option ${
                                        String(option.value) ===
                                        String(value)
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleSelect(option)
                                    }
                                    role="option"
                                    aria-selected={
                                        String(option.value) ===
                                        String(value)
                                    }
                                >
                                    {option.label}
                                </button>
                            ))
                        ) : (
                            <p className="admin-filter-no-results">
                                No matching options found.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminFilter;
