import * as XLSX from 'xlsx';

export const exportProfessionalReport = (takeoffs, totalEstimate) => {
  if (takeoffs.length === 0) {
    alert("No takeoff data to export!");
    return;
  }

  // 1. Prepare the Forensic Rows
  const reportData = takeoffs.map((t) => {
    const paintCoverage = 12; // m2 per liter
    const coats = 2;
    const paintNeeded = ((t.wallArea / paintCoverage) * coats).toFixed(2);

    return {
      "Room/Area": t.label,
      "Type": t.mode === 'interior' ? "Interior" : t.exteriorType,
      "Perimeter (m)": t.perimeter || "N/A",
      "Wall Height (m)": t.heightUsed || t.wallHeight,
      "Gross Wall Area (m2)": t.grossArea || (t.wallArea).toFixed(2),
      "Deductions (m2)": t.deductions || 0,
      "Net Paint Area (m2)": t.wallArea.toFixed(2),
      "Floor/Ceiling Area (m2)": t.floorArea?.toFixed(2) || "0.00",
      "Doors": t.doors || 0,
      "Cabinets/Windows": t.cabinets || 0,
      "Est. Paint Needed (L)": `${paintNeeded}L`,
    };
  });

  // 2. Add a Summary Row at the bottom
  reportData.push({}); // Empty spacer row
  reportData.push({
    "Room/Area": "TOTAL PROJECT ESTIMATE",
    "Est. Paint Needed (L)": `${takeoffs.reduce((sum, t) => sum + (t.wallArea / 6), 0).toFixed(2)}L`, // Approx total
    "Net Paint Area (m2)": `Total: ${totalEstimate.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })}`
  });

  // 3. Generate Excel File
  const worksheet = XLSX.utils.json_to_sheet(reportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "RAV_Takeoff_Report");

  // 4. Download
  XLSX.writeFile(workbook, `RAV_Project_Takeoff_${new Date().toLocaleDateString()}.xlsx`);
};
