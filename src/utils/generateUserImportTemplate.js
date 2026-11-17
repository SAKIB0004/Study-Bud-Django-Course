import * as XLSX from "xlsx-js-style";

const generateUserImportTemplate = () => {
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // ==========================================
    // 1. USERS SHEET
    // ==========================================
    const usersData = [
        ["STUDYBUDDY", "", ""],                    // Row 1: Brand Title Banner
        ["Bulk User Import Template", "", ""],     // Row 2: Subtitle Banner
        ["username", "email", "name"],             // Row 3: Table Column Headers
        ["sakib", "sakib@example.com", "Mahmudul Haque Sakib"],
        ["rahim", "rahim@example.com", "Rahim Ahmed"],
        ["karim", "karim@example.com", "Karim Hasan"],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(usersData);

    // Merge banners across columns A to C
    worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // STUDYBUDDY
        { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }  // Bulk User Import Template
    ];

    // Column widths
    worksheet["!cols"] = [
        { wch: 22 },
        { wch: 34 },
        { wch: 32 },
    ];

    // Row heights
    worksheet["!rows"] = [
        { hpt: 30 }, // Row 1: Brand Title
        { hpt: 24 }, // Row 2: Subtitle
        { hpt: 28 }, // Row 3: Table Headers
        { hpt: 24 }, // Row 4: Sample 1
        { hpt: 24 }, // Row 5: Sample 2
        { hpt: 24 }, // Row 6: Sample 3
    ];

    // Styling definitions
    const navyBanner = "1A365D";     // Deep Navy Header Banner
    const subHeaderFill = "245B8F";  // Slate Blue Table Headers
    const zebraFill = "F4F7FA";      // Subtle alternating row tint
    const white = "FFFFFF";
    const textDark = "1F2328";
    const borderGray = "D0D7DE";

    const thinBorder = {
        top: { style: "thin", color: { rgb: borderGray } },
        bottom: { style: "thin", color: { rgb: borderGray } },
        left: { style: "thin", color: { rgb: borderGray } },
        right: { style: "thin", color: { rgb: borderGray } },
    };

    const headerBorder = {
        ...thinBorder,
        bottom: { style: "medium", color: { rgb: navyBanner } }
    };

    // Style Row 1: STUDYBUDDY (Brand Title)
    for (let c = 0; c < 3; c++) {
        const addr = XLSX.utils.encode_cell({ r: 0, c });
        if (!worksheet[addr]) worksheet[addr] = { v: "", t: "s" };
        worksheet[addr].s = {
            font: { name: "Calibri", bold: true, color: { rgb: white }, sz: 16 },
            fill: { patternType: "solid", fgColor: { rgb: navyBanner } },
            alignment: { horizontal: "center", vertical: "center" },
        };
    }

    // Style Row 2: Bulk User Import Template (Subtitle)
    for (let c = 0; c < 3; c++) {
        const addr = XLSX.utils.encode_cell({ r: 1, c });
        if (!worksheet[addr]) worksheet[addr] = { v: "", t: "s" };
        worksheet[addr].s = {
            font: { name: "Calibri", bold: true, color: { rgb: white }, sz: 12 },
            fill: { patternType: "solid", fgColor: { rgb: navyBanner } },
            alignment: { horizontal: "center", vertical: "center" },
        };
    }

    // Style Row 3: Table Column Headers (Centered & Colored)
    const headers = ["username", "email", "name"];
    headers.forEach((_, index) => {
        const addr = XLSX.utils.encode_cell({ r: 2, c: index });
        if (worksheet[addr]) {
            worksheet[addr].s = {
                font: { name: "Calibri", bold: true, color: { rgb: white }, sz: 11 },
                fill: { patternType: "solid", fgColor: { rgb: subHeaderFill } },
                alignment: { horizontal: "center", vertical: "center" },
                border: headerBorder,
            };
        }
    });

    // Style Sample & Template Data Rows (Rows 4+)
    for (let r = 3; r < usersData.length; r++) {
        const isZebra = (r - 3) % 2 === 1;
        const rowBg = isZebra ? zebraFill : white;

        for (let c = 0; c < headers.length; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            if (worksheet[addr]) {
                worksheet[addr].s = {
                    font: { name: "Calibri", sz: 11, color: { rgb: textDark } },
                    fill: { patternType: "solid", fgColor: { rgb: rowBg } },
                    alignment: {
                        horizontal: "left",
                        vertical: "center",
                        indent: 1
                    },
                    border: thinBorder,
                };
            }
        }
    }

    // Freeze panes below header row so scrolling keeps headers in view
    worksheet["!views"] = [{ state: "frozen", xSplit: 0, ySplit: 3 }];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // ==========================================
    // 2. INSTRUCTIONS SHEET
    // ==========================================
    const instructions = [
        ["STUDYBUDDY", "", ""],
        ["Bulk User Import Template — Instructions", "", ""],
        ["", "", ""],
        ["Column", "Requirement", "Description"],
        ["username", "Required", "Unique username"],
        ["email", "Required", "Unique email address"],
        ["name", "Optional", "Full name of the user"],
        ["", "", ""],
        ["IMPORTANT NOTES", "", ""],
        ["1. Do not change the column headers.", "", ""],
        ["2. Remove the sample rows before importing your actual users.", "", ""],
        ["3. Username and email must be unique.", "", ""],
        ["4. Imported users will receive an unusable password by default.", "", ""],
        ["5. Save the file as .xlsx before uploading.", "", ""],
    ];

    const instructionSheet = XLSX.utils.aoa_to_sheet(instructions);

    instructionSheet["!cols"] = [
        { wch: 25 },
        { wch: 18 },
        { wch: 65 },
    ];

    instructionSheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
        { s: { r: 8, c: 0 }, e: { r: 8, c: 2 } },
        ...instructions.map((_, idx) => idx >= 9 ? { s: { r: idx, c: 0 }, e: { r: idx, c: 2 } } : null).filter(Boolean)
    ];

    // Style Instructions Title Banner (Row 1 & 2)
    for (let r = 0; r <= 1; r++) {
        for (let c = 0; c < 3; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            if (!instructionSheet[addr]) instructionSheet[addr] = { v: "", t: "s" };
            instructionSheet[addr].s = {
                font: { name: "Calibri", bold: true, color: { rgb: white }, sz: r === 0 ? 16 : 12 },
                fill: { patternType: "solid", fgColor: { rgb: navyBanner } },
                alignment: { horizontal: "center", vertical: "center" },
            };
        }
    }

    // Style Instructions Table Headers (Row 4)
    ["Column", "Requirement", "Description"].forEach((_, index) => {
        const addr = XLSX.utils.encode_cell({ r: 3, c: index });
        if (instructionSheet[addr]) {
            instructionSheet[addr].s = {
                font: { name: "Calibri", bold: true, color: { rgb: white }, sz: 11 },
                fill: { patternType: "solid", fgColor: { rgb: subHeaderFill } },
                alignment: { horizontal: "center", vertical: "center" },
                border: headerBorder,
            };
        }
    });

    // Style Instructions Spec Rows (Rows 5-7)
    for (let r = 4; r <= 6; r++) {
        for (let c = 0; c < 3; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            const isReqCol = c === 1;
            const isRequired = instructionSheet[addr]?.v === "Required";

            instructionSheet[addr].s = {
                font: {
                    name: "Calibri",
                    bold: c === 0 || isReqCol,
                    sz: 11,
                    color: { rgb: isReqCol ? (isRequired ? "9B1C1C" : "1E429F") : textDark },
                },
                fill: {
                    patternType: "solid",
                    fgColor: { rgb: isReqCol ? (isRequired ? "FDE8E8" : "E8F4FD") : white },
                },
                alignment: { horizontal: isReqCol ? "center" : "left", vertical: "center", indent: isReqCol ? 0 : 1 },
                border: thinBorder,
            };
        }
    }

    // Style Important Notes Banner (Row 9)
    for (let c = 0; c < 3; c++) {
        const addr = XLSX.utils.encode_cell({ r: 8, c });
        instructionSheet[addr].s = {
            font: { name: "Calibri", bold: true, color: { rgb: white }, sz: 11 },
            fill: { patternType: "solid", fgColor: { rgb: navyBanner } },
            alignment: { horizontal: "left", vertical: "center", indent: 1 },
        };
    }

    // Style Note Rows (Rows 10-14)
    for (let r = 9; r < instructions.length; r++) {
        for (let c = 0; c < 3; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            instructionSheet[addr].s = {
                font: { name: "Calibri", sz: 11, color: { rgb: textDark } },
                fill: { patternType: "solid", fgColor: { rgb: (r - 9) % 2 === 1 ? zebraFill : white } },
                alignment: { horizontal: "left", vertical: "center", indent: 1 },
                border: thinBorder,
            };
        }
    }

    XLSX.utils.book_append_sheet(workbook, instructionSheet, "Instructions");

    // Download file
    XLSX.writeFile(workbook, "studybuddy_user_import_template.xlsx");
};

export default generateUserImportTemplate;