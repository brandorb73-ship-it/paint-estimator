import * as XLSX from 'xlsx';

export const exportProfessionalReport = (takeoffs, totalEstimate) => {
  if (takeoffs.length === 0) {
    alert("No takeoff data to export!");
    return;
  }

  // 1. Prepare the Forensic Data Rows
  const reportData = takeoffs.map((t) => {
    // COVERAGE & COAT LOGIC
    // Standard Melbourne coverage is 12m2/L. 
    // We adjust for surface: Fresh Render is more porous.
    const coveragePerLiter = t.surfaceType === "Fresh Render" ? 8 : 12;
    const topCoats = 2;
    const undercoats = t.surfaceType === "Fresh Render" || t.needsUndercoat ? 1 : 0;
    
    // Total Paint Calculation
    const totalLiters = ((t.wallArea / coveragePerLiter) * (topCoats + undercoats)).toFixed(2);

    // LABOUR LOGIC
    // Dynamic rates based on site difficulty
    const rates = { 
      "Aged Care": 55,       // High compliance/Bupa standard
      "Boutique": 45,        // High-end finishes
      "New Build": 35, 
      "House Refresh": 30 
    };
    const currentRate = rates[t.projectType] || 35;
    const estimatedLabour = (t.wallArea * currentRate).toFixed(2);

    return {
      "Room/Area": t.label,
      "Project Category": t.projectType || "Standard",
      "Surface Condition": t.surfaceType || "Plaster",
      "Paint Brand": t.paintBrand || "Dulux",
      "Coat Spec": `${undercoats}U + ${topCoats}T`,
      "--- DIMENSIONS ---": "---",
      "Perimeter (m)": t.perimeter || "0.00",
      "Wall Height (m)": t.wallHeight || 2.4,
      "Gross Wall Area (m2)": (t.perimeter * t.wallHeight).toFixed(2),
      "Deductions (m2)": ( (t.doors * 1.6) + (t.windows * 1.5) + (t.cabinets * 2.0) ).toFixed(2),
      "Net Paint Area (m2)": t.wallArea.toFixed(2),
      "Floor/Porch Area (m2)": t.floorArea?.toFixed(2) || "0.00",
      "--- INVENTORY ---": "---",
      "Doors (Qty)": t.doors || 0,
      "Windows (Qty)": t.windows || 0,
      "Cabinets (Qty)": t.cabinets || 0,
      "--- ESTIMATES ---": "---",
      "Est. Paint (L)": `${totalLiters}L`,
      "Labour Cost (AUD)": `$${estimatedLabour}`,
      "Total Est. Cost": `$${(parseFloat(estimatedLabour) + (totalLiters * 25)).toFixed(2)}` // Labour + Material approx
    };
  });

  // 2. Add Summary Rows at the bottom
  reportData.push({}); // Empty spacer row
  
  const grandTotalPaint = takeoffs.reduce((sum, t) => {
    const coverage = t.surfaceType === "Fresh Render" ? 8 : 12;
    return sum + (t.wallArea / coverage * 2);
  }, 0).toFixed(2);

  reportData.push({
    "Room/Area": "GRAND TOTALS",
    "Net Paint Area (m2)": `Total: ${takeoffs.reduce((sum, t) => sum + t.wallArea, 0).toFixed(2)}m²`,
    "Est. Paint (L)": `${grandTotalPaint}L`,
    "Total Est. Cost": totalEstimate.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })
  });

  // 3. Generate Excel File with specific formatting
  const worksheet = XLSX.utils.json_to_sheet(reportData);
  
  // Set Column Widths for readability in the office
  const wscols = [
    {wch: 20}, {wch: 18}, {wch: 18}, {wch: 15}, {wch: 12}, 
    {wch: 15}, {wch: 15}, {wch: 15}, {wch: 18}, {wch: 15},
    {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15},
    {wch: 15}, {wch: 15}, {wch: 15}, {wch: 18}
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "RAV_Takeoff_Forensics");

  // 4. Download with timestamp
  const fileName = `RAV_Project_Estimate_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
