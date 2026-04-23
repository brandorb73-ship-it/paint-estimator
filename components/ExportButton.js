import * as XLSX from 'xlsx';

export const exportProfessionalReport = (takeoffs, totalEstimate) => {
  if (takeoffs.length === 0) {
    alert("No takeoff data to export!");
    return;
  }

  // 1. Prepare the Forensic Rows
  const reportData = takeoffs.map((t) => {
    // COVERAGE LOGIC based on surface
    const surfaceRates = { "Fresh Render": 8, "Smooth Plaster": 12, "Brick": 6, "Weatherboard": 10 };
    const coverage = surfaceRates[t.surfaceType] || 12;
    
    // COAT LOGIC
    const wallCoats = t.wallCoats || 2;
    const undercoat = t.needsUndercoat ? 1 : 0;
    const totalCoats = wallCoats + undercoat;
    
    // PAINT CALCULATION
    const paintNeeded = ((t.wallArea / coverage) * totalCoats).toFixed(2);

    // LABOUR LOGIC (Manpower/Rate per Project Type)
    const projectRates = {
      "New Build": 30,
      "Aged Care": 55,
      "Boutique": 45,
      "Pre-sale Touch up": 35,
      "House Refresh": 40
    };
    const hourlyRate = projectRates[t.projectType] || 35;
    const labourCost = (t.wallArea * hourlyRate).toFixed(2);

    return {
      "Room/Area": t.label,
      "Project Category": t.projectType || "Standard",
      "Surface Condition": t.surfaceType || "Plaster",
      "Paint Brand": t.paintBrand || "Dulux",
      "Perimeter (m)": t.perimeter || "0.00",
      "Wall Height (m)": t.wallHeight || 2.4,
      "Gross Wall Area (m2)": t.grossArea || "0.00",
      "Deductions (m2)": t.deductions || 0,
      "Net Wall Area (m2)": t.wallArea.toFixed(2),
      "Ceiling Area (m2)": t.floorArea || "0.00",
      "--- INVENTORY ---": "---",
      "Doors (Qty)": t.doors || 0,
      "Doors Finish": t.doorFinish || "Water-based", // Oil vs Water based
      "Windows (Qty)": t.windows || 0,
      "Cabinets (Qty)": t.cabinets || 0,
      "Trim/Cabinet Finish": t.trimFinish || "Oil-based Satin",
      "--- SPECS ---": "---",
      "Coat Spec": `${undercoat}U + ${wallCoats}T`,
      "Est. Paint (L)": `${paintNeeded}L`,
      "Labour Estimate": `$${labourCost}`
    };
  });

  // 2. Add a Summary Row for the RAV Team
  reportData.push({}); // Spacer
  const totalLiters = takeoffs.reduce((sum, t) => sum + (t.wallArea / 6), 0).toFixed(1);
  
  reportData.push({
    "Room/Area": "PROJECT TOTALS",
    "Est. Paint (L)": `${totalLiters}L Total`,
    "Labour Estimate": totalEstimate.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })
  });

  // 3. Generate Excel File
  const worksheet = XLSX.utils.json_to_sheet(reportData);
  
  // Set Column Widths for readability
  const wscols = [
    {wch: 20}, {wch: 18}, {wch: 18}, {wch: 15}, {wch: 12}, 
    {wch: 12}, {wch: 18}, {wch: 15}, {wch: 15}, {wch: 15}
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "RAV_Takeoff");

  // 4. Download
  XLSX.writeFile(workbook, `RAV_Full_Estimate_${new Date().toISOString().split('T')[0]}.xlsx`);
};
