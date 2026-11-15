function AdminFilter({
    label = "Filter",
    value,
    onChange,
    options = [],
    disabled = false,
}) {
    return (
        <div className="admin-filter">
            {label && <label>{label}</label>}

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default AdminFilter;