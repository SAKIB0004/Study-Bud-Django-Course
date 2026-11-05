function Button({
    children,
    type = "button",
    onClick,
    variant = "primary",
    disabled = false
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`btn btn-${variant}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default Button;