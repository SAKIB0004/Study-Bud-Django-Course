function AdminPagination({
    hasPrevious = false,
    hasNext = false,
    onPrevious,
    onNext,
    pageSize = 25,
    onPageSizeChange = () => {},
    pageSizeOptions = [25, 50, 75, 100],
    loading = false,
}) {
    return (
        <div className="admin-pagination">
            <div className="admin-pagination__size">
                <label htmlFor="admin-page-size">
                    Rows per page
                </label>

                <select
                    id="admin-page-size"
                    value={pageSize}
                    onChange={(event) =>
                        onPageSizeChange(Number(event.target.value))
                    }
                    disabled={loading}
                >
                    {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
            </div>

            <div className="admin-pagination__controls">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={!hasPrevious || loading}
                >
                    Previous
                </button>

                <button
                    type="button"
                    onClick={onNext}
                    disabled={!hasNext || loading}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default AdminPagination;