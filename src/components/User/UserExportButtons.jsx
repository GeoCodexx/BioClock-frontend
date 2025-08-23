import { Button, Stack } from '@mui/material';
import { Download as DownloadIcon, PictureAsPdf as PictureAsPdfIcon } from '@mui/icons-material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function UserExportButtons({ users }) {
    // Exportar a Excel
    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Usuarios');
        worksheet.columns = [
            { header: 'Nombre', key: 'name', width: 20 },
            { header: 'Apellido Paterno', key: 'firstSurname', width: 20 },
            { header: 'Apellido Materno', key: 'secondSurname', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Rol', key: 'role', width: 20 },
            { header: 'Departamento', key: 'department', width: 20 },
            { header: 'Estado', key: 'status', width: 15 },
        ];
        users.forEach(user => {
            worksheet.addRow({
                name: user.name,
                firstSurname: user.firstSurname,
                secondSurname: user.secondSurname,
                email: user.email,
                role: user.roleId?.name || '',
                department: user.departmentId?.name || '',
                status: user.status
            });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'usuarios.xlsx');
    };

    // Exportar a PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text('Usuarios', 14, 16);

        doc.autoTable({
            startY: 22,
            head: [[
                'Nombre', 'Apellido Paterno', 'Apellido Materno', 'Email', 'Rol', 'Departamento', 'Estado'
            ]],
            body: users.map(user => [
                user.name,
                user.firstSurname,
                user.secondSurname,
                user.email,
                user.roleId?.name || '',
                user.departmentId?.name || '',
                user.status
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [22, 160, 133] }
        });
        doc.save('usuarios.pdf');
    };

    return (
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportExcel}>
                Exportar Excel
            </Button>
            <Button variant="outlined" color="error" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF}>
                Exportar PDF
            </Button>
        </Stack>
    );
} 