import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export function exportToExcel(data: any[], columns: ExportColumn[], filename: string) {
  const formattedData = data.map((item) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      row[col.header] = item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : '-';
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Laporan');
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportToPDF(
  title: string,
  data: any[],
  columns: ExportColumn[],
  filename: string,
  orientation: 'p' | 'l' = 'p'
) {
  const doc = new jsPDF(orientation, 'pt', 'a4');

  // Title & Header Branding
  doc.setFontSize(16);
  doc.setTextColor(30, 64, 175); // Lazuardi Navy Blue
  doc.text('LAZUARDI SECURITY MANAGEMENT SYSTEM (LSMS)', 40, 40);

  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text(`Laporan: ${title}`, 40, 60);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, 40, 75);

  const tableHeaders = columns.map((col) => col.header);
  const tableRows = data.map((item) =>
    columns.map((col) => {
      const val = item[col.key];
      if (val === undefined || val === null) return '-';
      if (typeof val === 'boolean') return val ? 'Ya' : 'Tidak';
      return String(val);
    })
  );

  autoTable(doc, {
    startY: 90,
    head: [tableHeaders],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { top: 90, right: 40, bottom: 40, left: 40 },
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function printData(title: string, data: any[], columns: ExportColumn[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const headersHtml = columns.map((col) => `<th style="border: 1px solid #cbd5e1; padding: 8px; background-color: #1e40af; color: white; font-size: 11px;">${col.header}</th>`).join('');

  const rowsHtml = data
    .map((item, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cells = columns
        .map((col) => {
          let val = item[col.key];
          if (val === undefined || val === null) val = '-';
          if (typeof val === 'boolean') val = val ? 'Ya' : 'Tidak';
          return `<td style="border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 11px; color: #1e293b;">${val}</td>`;
        })
        .join('');
      return `<tr style="background-color: ${bg};">${cells}</tr>`;
    })
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cetak - ${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #0f172a; }
          .header { border-bottom: 2px solid #1e40af; padding-bottom: 10px; margin-bottom: 15px; }
          .header h2 { color: #1e40af; margin: 0 0 5px 0; font-size: 18px; }
          .header p { margin: 0; color: #64748b; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>LAZUARDI SECURITY MANAGEMENT SYSTEM (LSMS)</h2>
          <p>Laporan: ${title} | Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        </div>
        <table>
          <thead>
            <tr>${headersHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
