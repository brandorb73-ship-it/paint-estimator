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
      "--- TRIM WORK ---": "---",
  "Doors/Win/Cab Detail": `${t.doors}D / ${t.windows}W / ${t.cabinets}C`,
  "Trim Paint Type": "Water-Based Enamel (Aquanamel)",
  "Trim & Prep Cost": `$${t.trimCost || 0}`, // This shows the client the extra value
  "Total Est. Cost": `$${t.totalRoomValue}`
    };
  });

  // 2. Calculate Grand Totals and Profit Margin
  reportData.push({}); // Empty spacer row

  // Sum up all the individual components
  const totalNetArea = takeoffs.reduce((sum, t) => sum + (t.wallArea || 0), 0);
  
  const totalLitersCalculated = takeoffs.reduce((sum, t) => {
    const coverage = t.surfaceType === "Fresh Render" ? 8 : 12;
    const coats = (t.surfaceType === "Fresh Render" || t.needsUndercoat ? 1 : 0) + 2;
    return sum + ((t.wallArea / coverage) * coats);
  }, 0);

  const totalLabourCalculated = takeoffs.reduce((sum, t) => {
    const rates = { "Aged Care": 55, "Boutique": 45, "New Build": 35, "House Refresh": 30 };
    return sum + (t.wallArea * (rates[t.projectType] || 35));
  }, 0);

  // Material cost (Paint + Consumables) approx $25 per Liter
  const totalMaterialCost = totalLitersCalculated * 25;
  const subTotalCost = totalLabourCalculated + totalMaterialCost;

  // --- PROFIT MARGIN LOGIC ---
  const marginPercent = 0.30; // 30% Profit Margin
  const profitAmount = subTotalCost * marginPercent;
  const grandTotalWithMargin = subTotalCost + profitAmount;

  // Add the Rows to the Excel
  reportData.push({
    "Room/Area": "SUBTOTAL (Labour + Materials)",
    "Net Paint Area (m2)": `${totalNetArea.toFixed(2)}m²`,
    "Est. Paint (L)": `${totalLitersCalculated.toFixed(2)}L`,
    "Total Est. Cost": `$${subTotalCost.toFixed(2)}`
  });

  reportData.push({
    "Room/Area": "MANAGEMENT & PROFIT (30%)",
    "Total Est. Cost": `$${profitAmount.toFixed(2)}`
  });

  reportData.push({
    "Room/Area": "GRAND TOTAL (QUOTED PRICE)",
    "Total Est. Cost": `$${grandTotalWithMargin.toFixed(2)}`
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
