import React from 'react';
import { Button, Stack } from '@mui/material';
import { Download as DownloadIcon, PictureAsPdf as PictureAsPdfIcon } from '@mui/icons-material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function RoleExportButtons({ roles }) {
    // Exportar a Excel
    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Roles');
        worksheet.columns = [
            { header: 'Nombre', key: 'name', width: 30 },
            { header: 'Descripción', key: 'description', width: 40 },
            { header: 'Estado', key: 'status', width: 15 },
        ];
        roles.forEach(role => {
            worksheet.addRow({
                name: role.name,
                description: role.description,
                status: role.status
            });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'roles.xlsx');
    };

    // Exportar a PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text('Roles', 14, 16);

        doc.autoTable({
            startY: 22,
            head: [[
                'Nombre', 'Descripción', 'Estado'
            ]],
            body: roles.map(role => [
                role.name,
                role.description,
                role.status
            ]),
        });

        doc.save('roles.pdf');
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
