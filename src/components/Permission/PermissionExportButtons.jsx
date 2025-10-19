import {
  Button,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import {
  PictureAsPdf as PictureAsPdfIcon,
  MoreVert as MoreVertIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function PermissionExportButtons({ permissions }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Exportar a Excel
  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Permisos");

      // Configurar columnas
      worksheet.columns = [
        { header: "Nombre", key: "name", width: 30 },
        { header: "Descripción", key: "description", width: 30 },
        { header: "Código", key: "code", width: 30 },
        { header: "Estado", key: "status", width: 15 },
      ];

      // Agregar datos
      permissions.forEach((permission) => {
        worksheet.addRow({
          name: permission.name,
          code: permission.code,
          description: permission.description,
          status: permission.status === "active" ? "Activo" : "Inactivo",
        });
      });

      // Estilo de la cabecera
      worksheet.getRow(1).font = { bold: true, size: 12 };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1976D2" }, // Azul primary de MUI
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      worksheet.getRow(1).height = 25;

      // Bordes y alineación para todas las celdas
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          if (rowNumber > 1) {
            cell.alignment = { vertical: "middle", horizontal: "left" };
          }
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `permisos_${new Date().toISOString().split("T")[0]}.xlsx`);
      handleClose();
    } catch (error) {
      console.error("Error al exportar Excel:", error);
    }
  };

  // Exportar a PDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.setTextColor(25, 118, 210); // Color primary de MUI
      doc.text("Listado de Permisos", 14, 20);

      // Fecha de generación
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Generado: ${new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        14,
        28
      );

      // Tabla
      doc.autoTable({
        startY: 35,
        head: [["Nombre", "Descripción", "Código", "Estado"]],
        body: permissions.map((permission) => [
          permission.name,
          permission.code,
          permission.description,
          permission.status === "active" ? "Activo" : "Inactivo",
        ]),
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [25, 118, 210], // Azul primary de MUI
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        margin: { top: 35 },
      });

      // Footer con número de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`permisos_${new Date().toISOString().split("T")[0]}.pdf`);
      handleClose();
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    }
  };

  // Si no hay permisos, deshabilitar botones
  const isDisabled = !permissions || permissions.length === 0;

  // Versión mobile: Menú con tres puntos
  if (isMobile) {
    return (
      <>
        <Tooltip title="Exportar">
          <span>
            <IconButton
              onClick={handleClick}
              disabled={isDisabled}
              sx={{
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                },
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 200,
              },
            },
          }}
        >
          <MenuItem onClick={handleExportExcel}>
            <ListItemIcon>
              <DescriptionIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Exportar Excel</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleExportPDF}>
            <ListItemIcon>
              <PictureAsPdfIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Exportar PDF</ListItemText>
          </MenuItem>
        </Menu>
      </>
    );
  }

  // Versión tablet: Solo íconos
  if (isTablet) {
    return (
      <Stack direction="row" spacing={1}>
        <Tooltip title="Exportar a Excel" arrow>
          <span>
            <IconButton
              onClick={handleExportExcel}
              disabled={isDisabled}
              sx={{
                bgcolor: theme.palette.success.light + "20",
                color: theme.palette.success.main,
                border: `1px solid ${theme.palette.success.light}`,
                "&:hover": {
                  bgcolor: theme.palette.success.light + "40",
                },
                "&:disabled": {
                  bgcolor: theme.palette.action.disabledBackground,
                },
              }}
            >
              <DescriptionIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Exportar a PDF" arrow>
          <span>
            <IconButton
              onClick={handleExportPDF}
              disabled={isDisabled}
              sx={{
                bgcolor: theme.palette.error.light + "20",
                color: theme.palette.error.main,
                border: `1px solid ${theme.palette.error.light}`,
                "&:hover": {
                  bgcolor: theme.palette.error.light + "40",
                },
                "&:disabled": {
                  bgcolor: theme.palette.action.disabledBackground,
                },
              }}
            >
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    );
  }

  // Versión desktop: Botones completos
  return (
    <Stack direction="row" spacing={1}>
      <Tooltip title="Exportar a Excel" arrow>
        <Button
          variant="outlined"
          color="success"
          startIcon={<DescriptionIcon />}
          onClick={handleExportExcel}
          disabled={isDisabled}
          sx={{
            minWidth: 140,
            borderColor: theme.palette.success.main,
            color: theme.palette.success.main,
            "&:hover": {
              borderColor: theme.palette.success.dark,
              bgcolor: theme.palette.success.light + "20",
            },
          }}
        >
          Excel
        </Button>
      </Tooltip>
      <Tooltip title="Exportar en PDF" arrow>
        <Button
          variant="outlined"
          color="error"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleExportPDF}
          disabled={isDisabled}
          sx={{
            minWidth: 140,
          }}
        >
          PDF
        </Button>
      </Tooltip>
    </Stack>
  );
}
