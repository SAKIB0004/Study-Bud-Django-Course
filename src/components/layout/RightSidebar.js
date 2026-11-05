
function RightSidebar({ title, className = "", children }) {
    return (
        <aside className={className}>
            <h2>{title}</h2>

            {children}
        </aside>
    );
}

export default RightSidebar;
