import React from 'react';
import { Button, Stack } from '@mui/material';
import { Download as DownloadIcon, PictureAsPdf as PictureAsPdfIcon } from '@mui/icons-material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function DeviceExportButtons({ devices }) {
    // Exportar a Excel
    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Devices');
        worksheet.columns = [
            { header: 'Nombre', key: 'name', width: 30 },
            { header: 'Descripción', key: 'description', width: 30 },
        ];
        devices.forEach(device => {
            worksheet.addRow({
                name: device.name,
                description: device.description,
            });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'devices.xlsx');
    }

    // Exportar a PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text('Devices', 14, 16);

        doc.autoTable({
            startY: 22,
            head: [[
                'Nombre', 'Descripción'
            ]],
            body: devices.map(device => [
                device.name,
                device.description,
            ]),
        });

        doc.save('devices.pdf');
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