import "../../../assets/styles/admin/admin-common.css";

function AdminTable({
    columns = [],
    data = [],
    rowKey = "id",
    emptyMessage = "No records found.",
}) {
    return (
        <div className="admin-table-wrapper">
            <table className="admin-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key}>
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <tr key={item[rowKey] ?? index}>
                                {columns.map((column) => (
                                    <td key={column.key}>
                                        {column.render
                                            ? column.render(item, index)
                                            : item[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length || 1}
                                className="admin-table-empty"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default AdminTable;
