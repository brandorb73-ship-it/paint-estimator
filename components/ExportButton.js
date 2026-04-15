// components/ExportButton.js
import * as XLSX from 'xlsx';

export const exportToExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Painting Estimate");
  
  // Generate download
  XLSX.writeFile(workbook, "Melbourne_Job_Estimate.xlsx");
};
