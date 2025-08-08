import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  
  // Generate Excel file and download
  XLSX.writeFile(wb, `${fileName}.xlsx`, {
    bookType: 'xlsx',
    type: 'array',
    RTL: true, // Right-to-left for Persian content
    cellStyles: true,
  });
};