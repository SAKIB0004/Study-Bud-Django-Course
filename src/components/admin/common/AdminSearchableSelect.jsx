
import { useEffect, useMemo, useRef, useState } from "react";

function AdminSearchableSelect({
    options = [],
    value,
    onChange,
    multiple = false,
    placeholder = "Search...",
    disabled = false,
    getOptionLabel = (option) =>
        option.name || option.label || option.username || "",
    getOptionDescription,
    getOptionSearchText,
    getOptionValue = (option) => option.id,
    onCreate,
    createLabel,
}) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const containerRef = useRef(null);

    const selectedValues = useMemo(() => {
        if (multiple) {
            return (Array.isArray(value) ? value : []).map(String);
        }

        return value !== null && value !== undefined && value !== ""
            ? [String(value)]
            : [];
    }, [value, multiple]);

    const selectedOptions = useMemo(() => {
        return options.filter((option) =>
            selectedValues.includes(String(getOptionValue(option)))
        );
    }, [options, selectedValues, getOptionValue]);

    const filteredOptions = useMemo(() => {
        const search = query.trim().toLowerCase();

        if (!search) return options;

        return options.filter((option) => {
            const searchableText = getOptionSearchText
                ? getOptionSearchText(option)
                : [
                    getOptionLabel(option),
                    option.username,
                    option.email,
                ].filter(Boolean).join(" ");

            return String(searchableText)
                .toLowerCase()
                .includes(search);
        });
    }, [options, query, getOptionLabel, getOptionSearchText]);

    const exactMatchExists = options.some(
        (option) =>
            getOptionLabel(option).trim().toLowerCase() ===
            query.trim().toLowerCase()
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
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

    const handleSelect = (option) => {
        const optionValue = String(getOptionValue(option));

        if (multiple) {
            const nextValues = selectedValues.includes(optionValue)
                ? selectedValues.filter(
                    (item) => item !== optionValue
                )
                : [...selectedValues, optionValue];

            onChange(nextValues);
        } else {
            onChange(optionValue);
            setQuery("");
            setIsOpen(false);
        }
    };

    const handleRemove = (optionValue) => {
        if (multiple) {
            onChange(
                selectedValues.filter(
                    (item) => item !== String(optionValue)
                )
            );
        } else {
            onChange("");
        }
    };

    const handleCreate = async () => {
        if (!onCreate || !query.trim() || creating) return;

        try {
            setCreating(true);

            const createdOption = await onCreate(query.trim());

            if (!createdOption) return;

            const createdValue = String(
                getOptionValue(createdOption)
            );

            if (multiple) {
                onChange(
                    selectedValues.includes(createdValue)
                        ? selectedValues
                        : [...selectedValues, createdValue]
                );
            } else {
                onChange(createdValue);
                setIsOpen(false);
            }

            setQuery("");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div
            className="admin-searchable-select"
            ref={containerRef}
        >
            <div
                className={`admin-searchable-select__field ${
                    isOpen ? "active" : ""
                }`}
                onClick={() => {
                    if (!disabled) setIsOpen(true);
                }}
            >
                <div className="admin-searchable-select__content">
                    {selectedOptions.map((option) => {
                        const optionValue = getOptionValue(option);

                        return (
                            <span
                                className="admin-searchable-select__chip"
                                key={optionValue}
                            >
                                {getOptionLabel(option)}

                                <button
                                    type="button"
                                    disabled={disabled}
                                    aria-label={`Remove ${getOptionLabel(option)}`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleRemove(optionValue);
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        );
                    })}

                    {(multiple || selectedOptions.length === 0) && (
                        <input
                            type="text"
                            value={query}
                            placeholder={
                                selectedOptions.length > 0 && multiple
                                    ? "Add another..."
                                    : placeholder
                            }
                            disabled={disabled}
                            onFocus={() => setIsOpen(true)}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setIsOpen(true);
                            }}
                        />
                    )}
                </div>

                <span className="admin-searchable-select__arrow">
                    {isOpen ? "▲" : "▼"}
                </span>
            </div>

            {isOpen && !disabled && (
                <div className="admin-searchable-select__dropdown">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                            const optionValue = String(
                                getOptionValue(option)
                            );

                            const isSelected =
                                selectedValues.includes(optionValue);

                            return (
                                <button
                                    type="button"
                                    key={optionValue}
                                    className={`admin-searchable-select__option ${
                                        isSelected ? "selected" : ""
                                    }`}
                                    onClick={() => handleSelect(option)}
                                >
                                    <span>
                                        <strong>
                                            {getOptionLabel(option)}
                                        </strong>

                                        {getOptionDescription && (
                                            <small>
                                                {getOptionDescription(option)}
                                            </small>
                                        )}
                                    </span>

                                    {isSelected && <span>✓</span>}
                                </button>
                            );
                        })
                    ) : (
                        <p className="admin-searchable-select__empty">
                            No matching items found.
                        </p>
                    )}

                    {onCreate && query.trim() && !exactMatchExists && (
                        <button
                            type="button"
                            className="admin-searchable-select__create"
                            onClick={handleCreate}
                            disabled={creating}
                        >
                            {creating
                                ? "Creating..."
                                : createLabel
                                    ? createLabel(query.trim())
                                    : `+ Create "${query.trim()}"`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminSearchableSelect;
