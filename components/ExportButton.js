// components/ExportButton.js
import * as XLSX from 'xlsx';

export const exportProfessionalReport = (takeoffs, totalQuote) => {
  // 1. Prepare the Data Rows
  const rows = takeoffs.map(item => ({
    "Room/Area": item.label,
    "Surface Type": item.type === 'interior' ? `Interior (${item.ceilingType})` : `Exterior (${item.exteriorType})`,
    "Wall Area (m2)": item.wallArea ? item.wallArea.toFixed(2) : "-",
    "Floor Area (m2)": item.floorArea ? item.floorArea.toFixed(2) : "-",
    "Doors": item.doors || 0,
    "Windows": item.windows || 0,
    "Window Type": item.windowType || "N/A",
    "Cabinets": item.cabinets || 0,
    "Est. Cost (AUD)": `$${(item.subTotal || 0).toLocaleString()}`
  }));

  // 2. Create Worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // 3. Add a Summary Row at the bottom
  XLSX.utils.sheet_add_aoa(worksheet, [
    [], // Empty row
    ["TOTAL PROJECT ESTIMATE", "", "", "", "", "", "", "", `$${totalQuote.toLocaleString()}`]
  ], { origin: -1 });

  // 4. Style Columns (Widths)
  const wscols = [
    { wch: 20 }, // Room
    { wch: 20 }, // Surface
    { wch: 15 }, // Wall
    { wch: 15 }, // Floor
    { wch: 8 },  // Doors
    { wch: 8 },  // Windows
    { wch: 15 }, // Window Type
    { wch: 10 }, // Cabinets
    { wch: 15 }  // Cost
  ];
  worksheet['!cols'] = wscols;

  // 5. Generate Workbook and Download
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Quote Summary");
  
  const fileName = `Painting_Quote_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
