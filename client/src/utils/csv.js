import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatINRCurrency } from './currency';

export const exportToCsv = (filename, rows) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? '';
          return `"${String(value).replaceAll('"', '""')}"`;
        })
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportAnalyticsToPdf = (
  filename,
  { rows, dateWindow, totalRevenue, totalFuel, avgRoi, chartImages = [] }
) => {
  if (!rows?.length) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const generatedAt = new Date().toLocaleString();

  doc.setFontSize(18);
  doc.text('FleetFlow Analytics Report', 40, 44);

  doc.setFontSize(11);
  doc.text(`Window: Last ${dateWindow} days`, 40, 66);
  doc.text(`Generated: ${generatedAt}`, 40, 84);

  doc.setFontSize(12);
  doc.text(`Total Revenue: ${formatINRCurrency(totalRevenue || 0)}`, 40, 112);
  doc.text(`Total Fuel Cost: ${formatINRCurrency(totalFuel || 0)}`, 290, 112);
  doc.text(`Average ROI: ${(Number(avgRoi || 0) * 100).toFixed(2)}%`, 540, 112);
  doc.text(`Records: ${rows.length}`, 760, 112);

  let nextY = 132;
  const safeChartImages = chartImages.filter(Boolean);

  if (safeChartImages.length) {
    doc.setFontSize(11);
    doc.text('Analytics Charts', 40, nextY);
    nextY += 12;

    const chartWidth = 380;
    const chartHeight = 170;

    if (safeChartImages[0]) {
      doc.addImage(safeChartImages[0], 'PNG', 40, nextY, chartWidth, chartHeight);
    }

    if (safeChartImages[1]) {
      doc.addImage(safeChartImages[1], 'PNG', 460, nextY, chartWidth, chartHeight);
    }

    nextY += chartHeight + 20;
  }

  autoTable(doc, {
    startY: nextY,
    head: [
      [
        'Vehicle',
        'Distance (km)',
        'Liters',
        'Fuel Efficiency (km/L)',
        'Fuel Cost',
        'Maintenance Cost',
        'Revenue',
        'ROI (%)'
      ]
    ],
    body: rows.map((row) => [
      row.vehicle ?? '-',
      Number(row.distanceKm ?? 0).toFixed(2),
      Number(row.liters ?? 0).toFixed(2),
      Number(row.fuelEfficiency ?? 0).toFixed(2),
      formatINRCurrency(Number(row.fuelCost ?? 0)),
      formatINRCurrency(Number(row.maintenanceCost ?? 0)),
      formatINRCurrency(Number(row.revenue ?? 0)),
      `${(Number(row.roi ?? 0) * 100).toFixed(2)}%`
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255
    },
    theme: 'grid'
  });

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
};
