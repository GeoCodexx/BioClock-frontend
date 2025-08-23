import { Button, Stack } from '@mui/material';
import { Download as DownloadIcon, PictureAsPdf as PictureAsPdfIcon } from '@mui/icons-material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function DepartmentExportButtons({ departments }) {
    // Exportar a Excel
    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Departments');
        worksheet.columns = [
            { header: 'Nombre', key: 'name', width: 30 },
            { header: 'Ubicación', key: 'location', width: 30 },
        ];
        departments.forEach(department => {
            worksheet.addRow({
                name: department.name,
                location: department.location,
            });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'departments.xlsx');
    };

    // Exportar a PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text('Departments', 14, 16);

        doc.autoTable({
            startY: 22,
            head: [[
                'Nombre', 'Ubicación'
            ]],
            body: departments.map(department => [
                department.name,
                department.location,
            ]),
        });

        doc.save('departments.pdf');
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
