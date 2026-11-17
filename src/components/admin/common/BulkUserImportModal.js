import { useRef, useState } from "react";

import adminUserService from "../../../services/api/adminUserService";
import "../../../assets/styles/admin/BulkUserImportModal.css";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function BulkUserImportModal({ onClose, onSuccess }) {
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        setError("");
        setResult(null);

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const extension = selectedFile.name.split(".").pop().toLowerCase();

        if (!["csv", "xlsx"].includes(extension)) {
            setError("Only CSV and XLSX files are supported.");
            setFile(null);
            event.target.value = "";
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("File size cannot exceed 5 MB.");
            setFile(null);
            event.target.value = "";
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data = await adminUserService.bulkImportUsers(file);

            setResult(data);

            if (data.summary?.created > 0) {
                onSuccess?.();
            }

        } catch (err) {
            const responseData = err.response?.data;

            setError(
                responseData?.message ||
                responseData?.errors?.file?.[0] ||
                "Unable to import users. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setError("");
        setResult(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div
            className="bulk-import-overlay"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !loading
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="bulk-import-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="bulk-import-title"
            >
                {/* Header */}

                <div className="bulk-import-header">
                    <div>
                        <h2 id="bulk-import-title">
                            Import Users
                        </h2>

                        <p>
                            Upload a CSV or Excel file to create
                            multiple users.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="bulk-import-close"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}

                <div className="bulk-import-body">

                    <div className="bulk-import-instructions">
                        <h4>File Requirements</h4>

                        <ul>
                            <li>Supported formats: CSV and XLSX</li>
                            <li>Maximum file size: 5 MB</li>
                            <li>Maximum records: 500 users</li>
                            <li>Required columns: name, username, email</li>
                            <li>Optional columns: is_active, role, is_superuser</li>
                        </ul>
                    </div>

                    {!result && (
                        <div className="bulk-import-file">
                            <label htmlFor="bulk-user-file">
                                Select your file
                            </label>

                            <input
                                ref={fileInputRef}
                                id="bulk-user-file"
                                type="file"
                                accept=".csv,.xlsx"
                                onChange={handleFileChange}
                                disabled={loading}
                            />

                            {file && (
                                <div className="bulk-import-selected-file">
                                    <span>{file.name}</span>

                                    <span>
                                        {(file.size / 1024).toFixed(1)} KB
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div
                            className="bulk-import-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {/* Import Results */}

                    {result && (
                        <div className="bulk-import-results">

                            <h4>Import Completed</h4>

                            <div className="bulk-import-summary">

                                <div>
                                    <strong>
                                        {result.summary?.total_rows ?? 0}
                                    </strong>
                                    <span>Total</span>
                                </div>

                                <div>
                                    <strong>
                                        {result.summary?.created ?? 0}
                                    </strong>
                                    <span>Created</span>
                                </div>

                                <div>
                                    <strong>
                                        {result.summary?.failed ?? 0}
                                    </strong>
                                    <span>Failed</span>
                                </div>

                            </div>

                            {result.errors?.length > 0 && (
                                <div className="bulk-import-error-list">

                                    <h4>Failed Rows</h4>

                                    <div className="bulk-import-error-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Row</th>
                                                    <th>Username</th>
                                                    <th>Error</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {result.errors.map((item, index) => (
                                                    <tr key={`${item.row}-${index}`}>
                                                        <td>{item.row}</td>
                                                        <td>{item.username || "-"}</td>
                                                        <td>{item.error}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                            )}

                        </div>
                    )}

                </div>

                {/* Footer */}

                <div className="bulk-import-footer">

                    {result ? (
                        <>
                            <button
                                type="button"
                                className="bulk-import-secondary"
                                onClick={handleReset}
                            >
                                Import Another File
                            </button>

                            <button
                                type="button"
                                className="bulk-import-primary"
                                onClick={onClose}
                            >
                                Done
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="bulk-import-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="bulk-import-primary"
                                onClick={handleUpload}
                                disabled={!file || loading}
                            >
                                {loading ? "Importing..." : "Upload Users"}
                            </button>
                        </>
                    )}

                </div>

            </div>
        </div>
    );
}

export default BulkUserImportModal;
