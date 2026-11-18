
import * as XLSX from "xlsx-js-style";

const COLORS = {
    navyBanner: "1A365D",
    subHeaderFill: "245B8F",
    zebraFill: "F4F7FA",
    white: "FFFFFF",
    textDark: "1F2328",
    borderGray: "D0D7DE",
};

const thinBorder = {
    top: { style: "thin", color: { rgb: COLORS.borderGray } },
    bottom: { style: "thin", color: { rgb: COLORS.borderGray } },
    left: { style: "thin", color: { rgb: COLORS.borderGray } },
    right: { style: "thin", color: { rgb: COLORS.borderGray } },
};

const headerBorder = {
    ...thinBorder,
    bottom: {
        style: "medium",
        color: { rgb: COLORS.navyBanner },
    },
};

// Entity-specific template configuration
const TEMPLATE_CONFIG = {
    users: {
        sheetName: "Users",
        fileName: "studybuddy_user_import_template.xlsx",
        title: "Bulk User Import Template",

        headers: ["name", "username", "email"],

        sampleRows: [
            ["Mahmudul Haque Sakib", "sakib", "sakib@example.com"],
            ["Rahim Ahmed", "rahim", "rahim@example.com"],
            ["Karim Hasan", "karim", "karim@example.com"],
        ],

        columnWidths: [
            { wch: 32 },
            { wch: 22 },
            { wch: 34 },
        ],

        instructions: [
            ["name", "Optional", "Full name of the user"],
            ["username", "Required", "Unique username"],
            ["email", "Required", "Unique email address"],
        ],

        notes: [
            "Do not change the column headers.",
            "Remove the sample rows before importing your actual users.",
            "Username and email must be unique.",
            "Imported users receive an unusable password by default.",
            "Imported users are not granted Root Admin privileges.",
            "Save the file as .xlsx before uploading.",
        ],
    },

    rooms: {
        sheetName: "Rooms",
        fileName: "studybuddy_room_import_template.xlsx",
        title: "Bulk Room Import Template",

        headers: ["name", "description", "host_email", "topics"],

        sampleRows: [
            [
                "Python Study Group",
                "Learn Python together",
                "sakib@example.com",
                "Python, Programming",
            ],
            [
                "Django Beginners",
                "Learn Django basics",
                "rahim@example.com",
                "Django, Python",
            ],
            [
                "Web Development",
                "Discuss web development",
                "",
                "HTML, CSS, JavaScript",
            ],
        ],

        columnWidths: [
            { wch: 28 },
            { wch: 38 },
            { wch: 32 },
            { wch: 35 },
        ],

        instructions: [
            ["name", "Required", "Name of the room"],
            ["description", "Optional", "Room description"],
            ["host_email", "Optional", "Email of an existing user who will host the room"],
            ["topics", "Optional", "Comma-separated names of existing topics"],
        ],

        notes: [
            "Do not change the column headers.",
            "Remove the sample rows before importing your actual rooms.",
            "The host_email must belong to an existing user.",
            "Leave host_email blank if the room has no host.",
            "Topics must already exist in StudyBuddy.",
            "Separate multiple topic names with commas.",
            "Participants are not imported through this template.",
            "Save the file as .xlsx before uploading.",
        ],
    },

    topics: {
        sheetName: "Topics",
        fileName: "studybuddy_topic_import_template.xlsx",
        title: "Bulk Topic Import Template",

        headers: ["name"],

        sampleRows: [
            ["Python"],
            ["Django"],
            ["JavaScript"],
        ],

        columnWidths: [
            { wch: 35 },
        ],

        instructions: [
            ["name", "Required", "Unique topic name (maximum 50 characters)"],
        ],

        notes: [
            "Do not change the column headers.",
            "Remove the sample rows before importing your actual topics.",
            "Topic names must be unique.",
            "Existing topics cannot be imported again.",
            "Topic names are checked without case sensitivity.",
            "Save the file as .xlsx before uploading.",
        ],
    },
};

// Apply title banner styles
const styleBanner = (worksheet, row, columnCount, fontSize) => {
    for (let col = 0; col < columnCount; col++) {
        const address = XLSX.utils.encode_cell({
            r: row,
            c: col,
        });

        if (!worksheet[address]) {
            worksheet[address] = { v: "", t: "s" };
        }

        worksheet[address].s = {
            font: {
                name: "Calibri",
                bold: true,
                color: { rgb: COLORS.white },
                sz: fontSize,
            },
            fill: {
                patternType: "solid",
                fgColor: { rgb: COLORS.navyBanner },
            },
            alignment: {
                horizontal: "center",
                vertical: "center",
            },
        };
    }
};

// Apply column header styles
const styleColumnHeaders = (worksheet, headers, rowIndex) => {
    headers.forEach((_, colIndex) => {
        const address = XLSX.utils.encode_cell({
            r: rowIndex,
            c: colIndex,
        });

        worksheet[address].s = {
            font: {
                name: "Calibri",
                bold: true,
                color: { rgb: COLORS.white },
                sz: 11,
            },
            fill: {
                patternType: "solid",
                fgColor: { rgb: COLORS.subHeaderFill },
            },
            alignment: {
                horizontal: "center",
                vertical: "center",
            },
            border: headerBorder,
        };
    });
};

// Apply sample data row styles
const styleSampleRows = (
    worksheet,
    startRow,
    rowCount,
    columnCount
) => {
    for (let row = startRow; row < startRow + rowCount; row++) {
        const isZebra = (row - startRow) % 2 === 1;

        const rowBackground = isZebra
            ? COLORS.zebraFill
            : COLORS.white;

        for (let col = 0; col < columnCount; col++) {
            const address = XLSX.utils.encode_cell({
                r: row,
                c: col,
            });

            if (!worksheet[address]) continue;

            worksheet[address].s = {
                font: {
                    name: "Calibri",
                    sz: 11,
                    color: { rgb: COLORS.textDark },
                },
                fill: {
                    patternType: "solid",
                    fgColor: { rgb: rowBackground },
                },
                alignment: {
                    horizontal: "left",
                    vertical: "center",
                    indent: 1,
                },
                border: thinBorder,
            };
        }
    }
};

// Create the main import worksheet
const createImportSheet = (config) => {
    const columnCount = config.headers.length;

    const data = [
        ["STUDYBUDDY"],
        [config.title],
        config.headers,
        ...config.sampleRows,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Merge title banners across all columns
    worksheet["!merges"] = [
        {
            s: { r: 0, c: 0 },
            e: { r: 0, c: columnCount - 1 },
        },
        {
            s: { r: 1, c: 0 },
            e: { r: 1, c: columnCount - 1 },
        },
    ];

    worksheet["!cols"] = config.columnWidths;

    worksheet["!rows"] = [
        { hpt: 30 },
        { hpt: 24 },
        { hpt: 28 },
        ...config.sampleRows.map(() => ({ hpt: 24 })),
    ];

    // Style title banners
    styleBanner(worksheet, 0, columnCount, 16);
    styleBanner(worksheet, 1, columnCount, 12);

    // Style column headers
    styleColumnHeaders(worksheet, config.headers, 2);

    // Style sample rows
    styleSampleRows(
        worksheet,
        3,
        config.sampleRows.length,
        columnCount
    );

    // Freeze rows above the sample data
    worksheet["!views"] = [
        {
            state: "frozen",
            xSplit: 0,
            ySplit: 3,
        },
    ];

    return worksheet;
};

// Create the instructions worksheet
const createInstructionsSheet = (config) => {
    const instructions = [
        ["STUDYBUDDY"],
        [`${config.title} — Instructions`],
        [],
        ["Column", "Requirement", "Description"],
        ...config.instructions,
        [],
        ["IMPORTANT NOTES"],
        ...config.notes.map((note, index) => [
            `${index + 1}. ${note}`,
        ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(instructions);

    worksheet["!cols"] = [
        { wch: 25 },
        { wch: 18 },
        { wch: 65 },
    ];

    // Merge title banners
    worksheet["!merges"] = [
        {
            s: { r: 0, c: 0 },
            e: { r: 0, c: 2 },
        },
        {
            s: { r: 1, c: 0 },
            e: { r: 1, c: 2 },
        },
        {
            s: { r: 3 + config.instructions.length + 1, c: 0 },
            e: { r: 3 + config.instructions.length + 1, c: 2 },
        },
        ...config.notes.map((_, index) => {
            const row = 3 + config.instructions.length + 2 + index;

            return {
                s: { r: row, c: 0 },
                e: { r: row, c: 2 },
            };
        }),
    ];

    // Style title banners
    styleBanner(worksheet, 0, 3, 16);
    styleBanner(worksheet, 1, 3, 12);

    // Style instructions table headers
    styleColumnHeaders(
        worksheet,
        ["Column", "Requirement", "Description"],
        3
    );

    // Style instruction rows
    for (let row = 4; row < 4 + config.instructions.length; row++) {
        for (let col = 0; col < 3; col++) {
            const address = XLSX.utils.encode_cell({
                r: row,
                c: col,
            });

            const isRequirementColumn = col === 1;
            const isRequired =
                worksheet[address]?.v === "Required";

            worksheet[address].s = {
                font: {
                    name: "Calibri",
                    bold: col === 0 || isRequirementColumn,
                    sz: 11,
                    color: {
                        rgb: isRequirementColumn
                            ? isRequired
                                ? "9B1C1C"
                                : "1E429F"
                            : COLORS.textDark,
                    },
                },
                fill: {
                    patternType: "solid",
                    fgColor: {
                        rgb: isRequirementColumn
                            ? isRequired
                                ? "FDE8E8"
                                : "E8F4FD"
                            : COLORS.white,
                    },
                },
                alignment: {
                    horizontal: isRequirementColumn
                        ? "center"
                        : "left",
                    vertical: "center",
                    indent: isRequirementColumn ? 0 : 1,
                },
                border: thinBorder,
            };
        }
    }

    // Style IMPORTANT NOTES banner
    const notesBannerRow = 4 + config.instructions.length + 1;

    styleBanner(worksheet, notesBannerRow, 3, 11);

    // Style individual notes
    const notesStartRow = notesBannerRow + 1;

    for (let row = notesStartRow; row < notesStartRow + config.notes.length; row++) {
        const address = XLSX.utils.encode_cell({
            r: row,
            c: 0,
        });

        worksheet[address].s = {
            font: {
                name: "Calibri",
                sz: 11,
                color: { rgb: COLORS.textDark },
            },
            fill: {
                patternType: "solid",
                fgColor: {
                    rgb: (row - notesStartRow) % 2 === 1
                        ? COLORS.zebraFill
                        : COLORS.white,
                },
            },
            alignment: {
                horizontal: "left",
                vertical: "center",
                indent: 1,
            },
            border: thinBorder,
        };
    }

    return worksheet;
};

// Main reusable generator
const generateBulkImportTemplate = (entity) => {
    const config = TEMPLATE_CONFIG[entity];

    if (!config) {
        throw new Error(
            `Unsupported bulk import entity: ${entity}`
        );
    }

    const workbook = XLSX.utils.book_new();

    const importSheet = createImportSheet(config);
    const instructionsSheet = createInstructionsSheet(config);

    XLSX.utils.book_append_sheet(
        workbook,
        importSheet,
        config.sheetName
    );

    XLSX.utils.book_append_sheet(
        workbook,
        instructionsSheet,
        "Instructions"
    );

    XLSX.writeFile(workbook, config.fileName);
};

export default generateBulkImportTemplate;
