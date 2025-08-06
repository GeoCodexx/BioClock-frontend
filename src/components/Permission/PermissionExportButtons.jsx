import { Button, Stack } from "@mui/material";
import {
  Download as DownloadIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from "@mui/icons-material";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function PermissionExportButtons({ permissions }) {
  // Exportar a Excel
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Permissions");
    worksheet.columns = [
      { header: "Código", key: "code", width: 30 },
      { header: "Descripción", key: "description", width: 30 },
    ];
    permissions.forEach((permission) => {
      worksheet.addRow({
        code: permission.code,
        description: permission.description,
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "permissions.xlsx");
  };

  // Exportar a PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Permissions", 14, 16);

    doc.autoTable({
      startY: 22,
      head: [["Código", "Descripción"]],
      body: permissions.map((permission) => [
        permission.code,
        permission.description,
      ]),
    });

    doc.save("permissions.pdf");
  };

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleExportExcel}
      >
        Exportar Excel
      </Button>
      <Button
        variant="outlined"
        startIcon={<PictureAsPdfIcon />}
        onClick={handleExportPDF}
      >
        Exportar PDF
      </Button>
    </Stack>
  );
}
