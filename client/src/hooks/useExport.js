import { downloadUrl } from '../utils/api';

export function useExport(datasetId) {
  const exportCSV = (type = 'responses') => {
    downloadUrl(`/api/export/${datasetId}/csv?type=${type}`, `pulsepoint-${type}.csv`);
  };

  const exportPDF = async () => {
    const node = document.querySelector('[data-dashboard-content]');
    if (!node) return;
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
    const canvas = await html2canvas(node, { backgroundColor: '#FAFAFA', scale: 2 });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(img, 'PNG', 0, 0, width, height);
    pdf.save(`pulsepoint-dashboard-${Date.now()}.pdf`);
  };

  return { exportCSV, exportPDF };
}
