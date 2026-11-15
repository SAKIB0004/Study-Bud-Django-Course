function AdminSearch({
    value,
    onChange,
    placeholder = "Search...",
    disabled = false,
}) {
    return (
        <div className="admin-search">
            <input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                aria-label="Search"
            />
        </div>
    );
}

export default AdminSearch;