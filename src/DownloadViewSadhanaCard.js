
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from "jspdf";
import "jspdf-autotable";
import './CustomToast.css';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

// Helper to convert Blob to base64 for Capacitor Filesystem
async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}


const formatTime = (minutes) => {
    if (!minutes && minutes !== 0) return '';
    if (minutes >= 60 && minutes % 60 === 0) {
        return `${minutes / 60} hr`;
    }
    return `${minutes} min`;
};
// --- Month/Year Dropdown Implementation ---

const getMonthName = (monthNumber) => {
    return new Date(2000, monthNumber - 1, 1).toLocaleString('default', { month: 'long' });
};

const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1];
};

const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);


export default function DownloadViewSadhanaCard({ userRole, devoteeId, email }) {
    const [entries, setEntries] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    const [userInfo, setUserInfo] = useState(null);

    // Remove useEffect for userInfo fetch; fetch on demand in download

        // Download table as PDF
    const handleDownloadPDF = async () => {
        if (!entries || entries.length === 0) return;
        const { PDFDocument, rgb } = await import('pdf-lib');
        // Create PDF and use default font
        const pdfDoc = await PDFDocument.create();
        // Always fetch user info before export
        let userInfoData = userInfo;
        if (!userInfoData && devoteeId) {
            try {
                const token = localStorage.getItem("token");
                const API_BASE = process.env.REACT_APP_API_BASE;
                const res = await axios.get(`${API_BASE}/api/devotees`, {
                    params: { userId: email, type: 'Name' },
                    headers: { Authorization: `Bearer ${token}` }
                });
                userInfoData = res.data && res.data.length > 0 ? res.data[0] : null;
                setUserInfo(userInfoData);
            } catch (err) {
                userInfoData = null;
            }
        }

        // Get table headers and rows
        let headers = Array.from(document.querySelectorAll("table thead th")).map(th => th.innerText.trim());
        let rows = Array.from(document.querySelectorAll("table tbody tr")).map(tr => Array.from(tr.querySelectorAll("td")).map(td => td.innerText.trim()));
        // Remove Actions column (last column)
        if (headers.length > 0 && headers[headers.length - 1] === "Actions") {
            headers = headers.slice(0, -1);
            rows = rows.map(row => row.slice(0, -1));
        }

        // Calculate page width based on columns
        const margin = 40;
        // Dynamically calculate column widths based on max text length in each column
        const fontSize = 12;
        const pageHeight = 1000;
        // Use default font for all text rendering
        const font = undefined;
        const colWidths = headers.map((header, colIdx) => {
            // Find max text length in this column (header or any cell)
            let maxLen = header.length;
            rows.forEach(row => {
                if (row[colIdx] && row[colIdx].length > maxLen) maxLen = row[colIdx].length;
            });
            // Estimate width: 7px per character + padding
            return Math.max(90, maxLen * 7 + 20);
        });
        const tableWidth = colWidths.reduce((sum, w) => sum + w, 0);
        const pageWidth = Math.max(800, tableWidth + margin * 2);

        // Add devotee info and image to first page
        let y = pageHeight - 50;
        let infoBlockHeight = 90;
        let infoBlockWidth = 350;
        let imageWidth = 120;
        let imageHeight = 90;
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        // Draw 'Hare Krishna!' above devotee info, left-aligned
        page.drawRectangle({ x: margin, y: pageHeight - 40, width: infoBlockWidth, height: 32, borderColor: rgb(0.8,0.6,0.2), borderWidth: 2 });
        page.drawText('Hare Krishna!', { x: margin + 15, y: pageHeight - 28, size: 24, font, color: rgb(0.7,0.2,0.2) });
        page.drawRectangle({ x: margin, y: y - infoBlockHeight, width: infoBlockWidth, height: infoBlockHeight, borderColor: rgb(0.27,0.27,0.27), borderWidth: 1 });
        if (userInfoData) {
            const name = userInfoData.initiated_name && userInfoData.initiated_name.trim() ? userInfoData.initiated_name : `${userInfoData.first_name || ''} ${userInfoData.middle_name || ''} ${userInfoData.last_name || ''}`.replace(/ +/g, ' ').trim();
            const temple = userInfoData.temple_name || '';
            const period = `${getMonthName(month)} ${year}`;
            page.drawText(`Name: ${name}`, { x: margin + 15, y: y - 30, size: 16, font });
            page.drawText(`Temple: ${temple}`, { x: margin + 15, y: y - 55, size: 14, font });
            page.drawText(`Period: ${period}`, { x: margin + 15, y: y - 75, size: 14, font });
            if (userInfoData.photo) {
                try {
                    const baseUrl = process.env.REACT_APP_API_BASE || '';
                    const imageUrl = baseUrl.replace(/\/$/, '') + userInfoData.photo;
                    const imgRes = await fetch(imageUrl);
                    const imgBuffer = await imgRes.arrayBuffer();
                    const imgBytes = new Uint8Array(imgBuffer);
                    const img = await pdfDoc.embedJpg(imgBytes);
                    page.drawImage(img, {
                        x: margin + infoBlockWidth + 20,
                        y: y - imageHeight,
                        width: imageWidth,
                        height: imageHeight
                    });
                    page.drawRectangle({ x: margin + infoBlockWidth + 20, y: y - imageHeight, width: imageWidth, height: imageHeight, borderColor: rgb(0.27,0.27,0.27), borderWidth: 1 });
                } catch (err) {
                    // If image fails, skip
                }
            }
        }

        // Draw table, split across pages if needed
        let tableY = y - infoBlockHeight - 40;
        let rowY = tableY;
        let rowsPerPage = Math.floor((pageHeight - 120 - infoBlockHeight) / 25);
        let rowIndex = 0;
        while (rowIndex < rows.length) {
            // Draw header
            let colX = margin;
            headers.forEach((header, i) => {
                // Draw colored header background
                page.drawRectangle({ x: colX, y: rowY, width: colWidths[i], height: 25, borderColor: rgb(0.27,0.27,0.27), borderWidth: 1, color: rgb(0.98,0.91,0.71) }); // light yellow
                // Draw header text in bold and dark color
                page.drawText(header, { x: colX + 5, y: rowY + 7, size: fontSize, font, color: rgb(0.35,0.22,0.07) });
                colX += colWidths[i];
            });
            rowY -= 25;
            // Draw rows for this page
            for (let r = 0; r < rowsPerPage && rowIndex < rows.length; r++, rowIndex++) {
                colX = margin;
                rows[rowIndex].forEach((cell, i) => {
                    page.drawRectangle({ x: colX, y: rowY, width: colWidths[i], height: 25, borderColor: rgb(0.27,0.27,0.27), borderWidth: 1 });
                    page.drawText(cell, { x: colX + 5, y: rowY + 7, size: 11, font });
                    colX += colWidths[i];
                });
                rowY -= 25;
            }
            // If more rows, add new page
            if (rowIndex < rows.length) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                // Draw the 'Generated by...' text at the top-right of each new page
                page.drawText("Generated by https://www.vaidhisadhanabhakti.cloud", {
                    x: pageWidth - margin - 320,
                    y: pageHeight - 30,
                    size: 12,
                    font,
                    color: rgb(0.2,0.2,0.2)
                });
                rowY = pageHeight - margin - 25;
            } else {
                // After last table row, add two confirmation rows before the footer
                colX = margin;
                page.drawRectangle({ x: colX, y: rowY, width: tableWidth, height: 25, borderColor: rgb(0.27,0.27,0.27), borderWidth: 1 });
                page.drawText("Prabhu Gopal! (Krishna)", { x: colX + 5, y: rowY + 7, size: 12, font });
                rowY -= 25;
                page.drawRectangle({ x: colX, y: rowY, width: tableWidth, height: 25, borderColor: rgb(0.27,0.27,0.27), borderWidth: 1 });
                page.drawText("Hereby I am confirming that whatever mentioned in my above sadhana chart is true and correct.", { x: colX + 5, y: rowY + 7, size: 12, font });
                rowY -= 25;
                // Draw the 'Generated by...' text at the top-right of the last page as well
                page.drawText("Generated by https://www.vaidhisadhanabhakti.cloud", {
                    x: pageWidth - margin - 320,
                    y: pageHeight - 30,
                    size: 12,
                    font,
                    color: rgb(0.2,0.2,0.2)
                });
            }
        }

        // (Removed bottom-left footer to avoid overlap)

        // Save PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const fileName = `Sadhana_${year}_${String(month).padStart(2, '0')}.pdf`;
        if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
            // Save to device using Filesystem (base64)
            const base64 = await blobToBase64(blob);
            try {
                await Filesystem.writeFile({
                    path: fileName,
                    data: base64,
                    directory: Directory.Documents,
                    recursive: true,
                });
                alert('PDF saved to Documents folder');
            } catch (e) {
                alert('Failed to save PDF: ' + e.message);
            }
        } else {
            saveAs(blob, fileName);
        }
    };

    // Download table as XLS
    const handleDownloadXLS = async () => {
        if (!entries || entries.length === 0) return;
        const table = document.querySelector("table");
        if (!table) return;
        let headers = Array.from(table.querySelectorAll("thead th")).map(th => th.innerText.trim());
        let rows = Array.from(table.querySelectorAll("tbody tr")).map(tr =>
            Array.from(tr.querySelectorAll("td")).map(td => td.innerText.trim())
        );
        // Remove Actions column (last column)
        if (headers.length > 0 && headers[headers.length - 1] === "Actions") {
            headers = headers.slice(0, -1);
            rows = rows.map(row => row.slice(0, -1));
        }

        // Always fetch user info before export
        let userInfoData = userInfo;
        if (!userInfoData && devoteeId) {
            try {
                const token = localStorage.getItem("token");
                const API_BASE = process.env.REACT_APP_API_BASE;
                const res = await axios.get(`${API_BASE}/api/devotees`, {
                    params: { userId: email, type: 'Name' },
                    headers: { Authorization: `Bearer ${token}` }
                });
                userInfoData = res.data && res.data.length > 0 ? res.data[0] : null;
                setUserInfo(userInfoData);
            } catch (err) {
                userInfoData = null;
            }
        }

        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sadhana");

        // Add 'Hare Krishna!' just above Name cell, with border and normal background
        const hkRow = worksheet.addRow(["Hare Krishna!", ""]);
        hkRow.font = { bold: true, size: 16 };
        hkRow.alignment = { horizontal: 'center', vertical: 'middle' };
        hkRow.height = 28;
        worksheet.mergeCells('A1:B1');
        hkRow.eachCell(cell => {
            cell.border = {
                top: { style: 'medium', color: { argb: 'FF444444' } },
                left: { style: 'medium', color: { argb: 'FF444444' } },
                bottom: { style: 'medium', color: { argb: 'FF444444' } },
                right: { style: 'medium', color: { argb: 'FF444444' } }
            };
        });

        // Add user info rows
        let infoRowCount = 1;
        if (userInfoData) {
            const name = userInfoData.initiated_name && userInfoData.initiated_name.trim() ? userInfoData.initiated_name : `${userInfoData.first_name || ''} ${userInfoData.middle_name || ''} ${userInfoData.last_name || ''}`.replace(/ +/g, ' ').trim();
            const temple = userInfoData.temple_name || '';
            const period = `${getMonthName(month)} ${year}`;
            const infoRows = [];
            infoRows.push(worksheet.addRow(["Name", name])); infoRowCount++;
            if (temple) { infoRows.push(worksheet.addRow(["Temple", temple])); infoRowCount++; }
            infoRows.push(worksheet.addRow(["Period", period])); infoRowCount++;
            // Apply thin border to user info cells
            infoRows.forEach(row => {
                row.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FF444444' } },
                        left: { style: 'thin', color: { argb: 'FF444444' } },
                        bottom: { style: 'thin', color: { argb: 'FF444444' } },
                        right: { style: 'thin', color: { argb: 'FF444444' } }
                    };
                });
            });
            // Render image to the right of info block
            if (userInfoData.photo) {
                try {
                    const baseUrl = process.env.REACT_APP_API_BASE || '';
                    const imageUrl = baseUrl.replace(/\/$/, '') + userInfoData.photo;
                    const imgRes = await fetch(imageUrl);
                    const imgBuffer = await imgRes.arrayBuffer();
                    const imageId = workbook.addImage({
                        buffer: imgBuffer,
                        extension: 'jpeg'
                    });
                    // Place image in column D, spanning info block height
                    worksheet.addImage(imageId, {
                        tl: { col: 3, row: 0 },
                        ext: { width: 80, height: infoRowCount * 22 }
                    });
                } catch (err) {
                    // If image fails, do nothing (no Profile Image row)
                }
            }
        }
        if (infoRowCount > 0) worksheet.addRow([]);

        // Add table headers and rows
        const headerRow = worksheet.addRow(headers);
        rows.forEach(row => worksheet.addRow(row));

        // Style table borders: slightly bolder and darker
        // Header row
        headerRow.eachCell(cell => {
            cell.border = {
                top: { style: 'medium', color: { argb: 'FF444444' } },
                left: { style: 'medium', color: { argb: 'FF444444' } },
                bottom: { style: 'medium', color: { argb: 'FF444444' } },
                right: { style: 'medium', color: { argb: 'FF444444' } }
            };
        });
        // Data rows
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > headerRow.number) {
                row.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FF444444' } },
                        left: { style: 'thin', color: { argb: 'FF444444' } },
                        bottom: { style: 'thin', color: { argb: 'FF444444' } },
                        right: { style: 'thin', color: { argb: 'FF444444' } }
                    };
                });
            }
        });

        // Auto-size columns
        worksheet.columns.forEach((col, i) => {
            let maxLen = 10;
            col.eachCell({ includeEmpty: true }, cell => {
                maxLen = Math.max(maxLen, (cell.value ? cell.value.toString().length : 0));
            });
            col.width = Math.max(10, Math.ceil(maxLen * 1.2));
        });

        // Add two confirmation rows at the end, merged across all columns
        const colCount = worksheet.columns.length;
        // First confirmation row: Prabhu Gopal (Kṛṣṇa), normal font, left-aligned
        const confirmRow1 = worksheet.addRow(["Prabhu Gopal (Krishna)"]);
        confirmRow1.font = { size: 12 };
        confirmRow1.alignment = { horizontal: 'left', vertical: 'middle' };
        confirmRow1.height = 22;
        worksheet.mergeCells(confirmRow1.number, 1, confirmRow1.number, colCount);
        confirmRow1.eachCell(cell => {
            cell.border = {
                top: { style: 'medium', color: { argb: 'FF444444' } },
                left: { style: 'medium', color: { argb: 'FF444444' } },
                bottom: { style: 'medium', color: { argb: 'FF444444' } },
                right: { style: 'medium', color: { argb: 'FF444444' } }
            };
        });
        // Second confirmation row: confirmation statement, normal font, left-aligned
        const confirmRow2 = worksheet.addRow(["Hereby I am confirming that whatever mentioned in my above sadhana chart is true and correct."]);
        confirmRow2.font = { size: 12 };
        confirmRow2.alignment = { horizontal: 'left', vertical: 'middle' };
        confirmRow2.height = 22;
        worksheet.mergeCells(confirmRow2.number, 1, confirmRow2.number, colCount);
        confirmRow2.eachCell(cell => {
            cell.border = {
                top: { style: 'medium', color: { argb: 'FF444444' } },
                left: { style: 'medium', color: { argb: 'FF444444' } },
                bottom: { style: 'medium', color: { argb: 'FF444444' } },
                right: { style: 'medium', color: { argb: 'FF444444' } }
            };
        });
        // Export file
        const buffer = await workbook.xlsx.writeBuffer();
        const xlsBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const xlsFileName = `Sadhana_${year}_${String(month).padStart(2, '0')}.xlsx`;
        if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
            const base64 = await blobToBase64(xlsBlob);
            try {
                await Filesystem.writeFile({
                    path: xlsFileName,
                    data: base64,
                    directory: Directory.Documents,
                    recursive: true,
                });
                alert('XLSX saved to Documents folder');
            } catch (e) {
                alert('Failed to save XLSX: ' + e.message);
            }
        } else {
            saveAs(xlsBlob, xlsFileName);
        }
    };
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingEntry, setDeletingEntry] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [editFormData, setEditFormData] = useState({
        entryDate: '',
        wakeUpTime: '',
        chantingRounds: '',
        readingTime: '',
        readingTimeUnit: 'minutes',
        readingTopic: '',
        hearingTime: '',
        hearingTimeUnit: 'minutes',
        hearingTopic: '',
        serviceName: '',
        serviceTime: '',
        serviceTimeUnit: 'minutes',
        sleepingTime: '',
        chantingBefore700Time: '',
        chantingBefore730Time: '',
        attendedMangalAratiTime: '',
        attendedBhagavatamClass: false,
        bookDistribution: '',
        prasadamHonored: false,
        ekadashiFollowed: false,
        japaQuality: ''
        ,sixteenRoundCompletedTime: ''
    });
    const [templateFields, setTemplateFields] = useState(null);

    useEffect(() => {
        if (!devoteeId) return;
        const fetchTemplate = async () => {
            try {
                const API_BASE = process.env.REACT_APP_API_BASE;
                const res = await axios.get(`${API_BASE}/api/sadhana/template/${encodeURIComponent(devoteeId)}`);
                setTemplateFields(res.data);
            } catch (err) {
                setTemplateFields(null);
            }
        };
        fetchTemplate();
    }, [devoteeId]);

    // Toast auto-hide
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    useEffect(() => {
        if (!devoteeId) return;
        const fetchEntries = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries-by-month`, {
                    params: { user_id: devoteeId, month: String(month).padStart(2, '0'), year }
                });
                setEntries(res.data || []);
            } catch (err) {
                setError("Failed to fetch sadhana entries.");
                setEntries([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, [devoteeId, year, month]);

    // Helper to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString();
    };
    // Helper to format time in hours/minutes
    const formatMinutes = (minutes) => {
        if (!minutes && minutes !== 0) return '';
        if (minutes >= 60 && minutes % 60 === 0) {
            return `${minutes / 60} hr`;
        }
        if (minutes > 60) {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            return `${h} hr${h > 1 ? 's' : ''}${m ? ' ' + m + ' min' : ''}`;
        }
        return `${minutes} min`;
    };

    // Convert minutes to display value and unit
    const convertMinutesToForm = (minutes) => {
        if (!minutes) return { value: '', unit: 'minutes' };
        if (minutes >= 60 && minutes % 60 === 0) {
            return { value: minutes / 60, unit: 'hours' };
        }
        return { value: minutes, unit: 'minutes' };
    };

    // Handle Edit Click
    const handleEditClick = (entry) => {
        const readingData = convertMinutesToForm(entry.reading_time);
        const hearingData = convertMinutesToForm(entry.hearing_time);
        const serviceData = convertMinutesToForm(entry.service_time);
        const toBoolean = (value) =>
            value === true ||
            value === 1 ||
            value === '1' ||
            (typeof value === 'string' && value.trim().toLowerCase() === 'yes');

        setEditingEntry(entry);
        setEditFormData({
            entryDate: entry.entry_date
                ? (() => {
                    const d = new Date(entry.entry_date);
                    const offset = d.getTimezoneOffset();
                    d.setMinutes(d.getMinutes() - offset);
                    return d.toISOString().split('T')[0];
                })()
                : '',
            wakeUpTime: entry.wake_up_time || '',
            chantingRounds: entry.chanting_rounds || '',
            readingTime: readingData.value,
            readingTimeUnit: readingData.unit,
            readingTopic: entry.reading_topic || '',
            hearingTime: hearingData.value,
            hearingTimeUnit: hearingData.unit,
            hearingTopic: entry.hearing_topic || '',
            serviceName: entry.service_name || '',
            serviceTime: serviceData.value,
            serviceTimeUnit: serviceData.unit,
            sleepingTime: entry.sleeping_time || '',
            chantingBefore700Time: entry.chanting_before_700 || '',
            chantingBefore730Time: entry.chanting_before_730 || '',
            attendedMangalAratiTime: entry.attended_mangal_arati || '',
            attendedBhagavatamClass: toBoolean(entry.attended_bhagavatam_class),
            bookDistribution: entry.book_distribution || '',
            prasadamHonored: toBoolean(entry.prasadam_honored),
            ekadashiFollowed: toBoolean(entry.ekadashi_followed),
            japaQuality: entry.japa_quality || '',
            sixteenRoundCompletedTime: entry.sixteenRoundCompletedTime || entry.sixteen_round_completed_time || ''
        });
        setShowEditModal(true);
    };

    // Handle Delete Click
    const handleDeleteClick = (entry) => {
        setDeletingEntry(entry);
        setDeleteConfirmText('');
        setShowDeleteModal(true);
    };

    // Confirm Delete
    const confirmDelete = async () => {
        if (!deletingEntry) return;

        try {
            await axios.delete(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries/${deletingEntry.id}`);
            setShowDeleteModal(false);
            setDeletingEntry(null);
            setDeleteConfirmText('');
            setToast({ show: true, message: 'Sadhana entry deleted successfully!', type: 'success' });
            
            // Refresh entries
            const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries-by-month`, {
                params: { user_id: devoteeId, month: String(month).padStart(2, '0'), year }
            });
            setEntries(res.data || []);
        } catch (err) {
            setShowDeleteModal(false);
            setDeletingEntry(null);
            setDeleteConfirmText('');
            setToast({ show: true, message: 'Failed to delete entry. Please try again.', type: 'error' });
            console.error(err);
        }
    };

    // Handle Edit Form Change
    const handleEditFormChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    // Handle Edit Form Submit
    const handleEditFormSubmit = async (e) => {
        e.preventDefault();

        const convertToMinutes = (value, unit) => {
            if (!value || value === '') return null;
            const num = parseInt(value);
            if (isNaN(num)) return null;
            return unit === 'hours' ? num * 60 : num;
        };

        const entryDate = editFormData.entryDate || null;
        const wakeUpTime = editFormData.wakeUpTime || null;
        const chantingRounds = editFormData.chantingRounds ? parseInt(editFormData.chantingRounds) : null;
        const readingTime = convertToMinutes(editFormData.readingTime, editFormData.readingTimeUnit);
        const readingTopic = editFormData.readingTopic || null;
        const hearingTime = convertToMinutes(editFormData.hearingTime, editFormData.hearingTimeUnit);
        const hearingTopic = editFormData.hearingTopic || null;
        const serviceName = editFormData.serviceName || null;
        const serviceTime = convertToMinutes(editFormData.serviceTime, editFormData.serviceTimeUnit);
        const sleepingTime = templateFields?.sleeping_time ? (editFormData.sleepingTime || null) : null;
        const chantingBefore700Time = templateFields?.chanting_before_700 ? (editFormData.chantingBefore700Time || null) : null;
        const chantingBefore730Time = templateFields?.chanting_before_730 ? (editFormData.chantingBefore730Time || null) : null;
        const attendedMangalAratiTime = templateFields?.attended_mangal_arati ? (editFormData.attendedMangalAratiTime || null) : null;
        const attendedBhagavatamClass = templateFields?.attended_bhagavatam_class ? editFormData.attendedBhagavatamClass : null;
        const sixteenRoundCompletedTime = (templateFields?.sixteenRoundCompletedTime || templateFields?.sixteen_round_completed_time) ? (editFormData.sixteenRoundCompletedTime || null) : null;
        const bookDistribution = templateFields?.book_distribution ? (editFormData.bookDistribution ? parseInt(editFormData.bookDistribution) : null) : null;
        const prasadamHonored = templateFields?.prasadam_honored ? editFormData.prasadamHonored : null;
        const ekadashiFollowed = templateFields?.ekadashi_followed ? editFormData.ekadashiFollowed : null;
        const japaQuality = templateFields?.japa_quality ? (editFormData.japaQuality ? parseInt(editFormData.japaQuality) : null) : null;

        const updatedData = {
            entryDate,
            wakeUpTime,
            chantingRounds,
            readingTime,
            readingTopic,
            hearingTime,
            hearingTopic,
            serviceName,
            serviceTime,
            sleepingTime,
            chantingBefore700Time,
            chantingBefore730Time,
            attendedMangalAratiTime,
            attendedBhagavatamClass,
            sixteen_round_completed_time: sixteenRoundCompletedTime,
            bookDistribution,
            prasadamHonored,
            ekadashiFollowed,
            japaQuality,
            entry_date: entryDate,
            wake_up_time: wakeUpTime,
            chanting_rounds: chantingRounds,
            reading_time: readingTime,
            reading_topic: readingTopic,
            hearing_time: hearingTime,
            hearing_topic: hearingTopic,
            service_name: serviceName,
            service_time: serviceTime,
            sleeping_time: sleepingTime,
            chanting_before_700: chantingBefore700Time,
            chanting_before_730: chantingBefore730Time,
            attended_mangal_arati: attendedMangalAratiTime,
            attended_bhagavatam_class: attendedBhagavatamClass,
            book_distribution: bookDistribution,
            prasadam_honored: prasadamHonored,
            ekadashi_followed: ekadashiFollowed,
            japa_quality: japaQuality
        };

        console.log("Updating entry ID:", editingEntry.id);
        console.log("Update payload:", updatedData);
        console.log("Form data before conversion:", editFormData);

        try {
            await axios.put(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries/${editingEntry.id}`, updatedData);
            setToast({ show: true, message: 'Sadhana entry updated successfully!', type: 'success' });
            setShowEditModal(false);
            setEditingEntry(null);
            
            // Refresh entries
            const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries-by-month`, {
                params: { user_id: devoteeId, month: String(month).padStart(2, '0'), year }
            });
            setEntries(res.data || []);
        } catch (err) {
            setToast({ show: true, message: 'Failed to update entry. Please try again.', type: 'error' });
            console.error(err);
        }
    };

    return (
        <div className="container py-4">
            {/* Custom Toast */}
            <div className={`custom-toast${toast.show ? ' show' : ''} ${toast.type}`} role="alert" style={{ pointerEvents: toast.show ? 'auto' : 'none' }}>
                <span>{toast.message}</span>
                <button className="toast-close" onClick={() => setToast(t => ({ ...t, show: false }))} aria-label="Close">&times;</button>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-header bg-primary text-white rounded-top-4 d-flex align-items-center justify-content-between">
                            <h4 className="mb-0">📅 Month Wise</h4>
                            <div className="d-flex gap-2 align-items-end flex-wrap">
                                <div className="d-flex align-items-center">
                                    <label htmlFor="yearSelect" className="form-label mb-0 me-2">Year</label>
                                    <select
                                        id="yearSelect"
                                        className="form-select d-inline-block w-auto me-3"
                                        value={year}
                                        onChange={e => setYear(Number(e.target.value))}
                                    >
                                        {getYearOptions().map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="d-flex align-items-center">
                                    <label htmlFor="monthSelect" className="form-label mb-0 me-2">Month</label>
                                    <select
                                        id="monthSelect"
                                        className="form-select d-inline-block w-auto me-3"
                                        value={month}
                                        onChange={e => setMonth(Number(e.target.value))}
                                    >
                                        {monthOptions.map(m => (
                                            <option key={m} value={m}>{getMonthName(m)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="card-body bg-light rounded-bottom-4">
                                                        {/* XLS and PDF buttons inside card above table */}
                                                        <div className="d-flex justify-content-end gap-2 mb-3">
                                                            <button
                                                                className="btn btn-xls align-middle px-3 d-flex align-items-center gap-2"
                                                                type="button"
                                                                style={{ fontWeight: 500 }}
                                                                onClick={handleDownloadXLS}
                                                            >
                                                                <i className="bi bi-download" style={{ fontSize: '1.2em' }}></i>
                                                                XLS
                                                            </button>
                                                            <button
                                                                className="btn btn-pdf align-middle px-3 d-flex align-items-center gap-2"
                                                                type="button"
                                                                style={{ fontWeight: 500 }}
                                                                onClick={handleDownloadPDF}
                                                            >
                                                                <i className="bi bi-file-earmark-pdf" style={{ fontSize: '1.2em' }}></i>
                                                                PDF
                                                            </button>
                                                        </div>
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary mb-2" role="status" />
                                    <div>Loading...</div>
                                </div>
                            ) : error ? (
                                <div className="alert alert-danger text-center">{error}</div>
                            ) : entries.length === 0 ? (
                                <div className="alert alert-warning text-center">No data</div>
                            ) : (
                                <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
                                    <table className="table table-hover align-middle table-bordered border-primary rounded-3 overflow-hidden mb-0">
                                        <thead className="table-primary">
                                            <tr>
                                                {templateFields && templateFields.entry_date && <th>Date</th>}
                                                {templateFields && templateFields.wake_up_time && <th>Wake Up Time</th>}
                                                {templateFields && templateFields.chanting_rounds && <th>Chanting Rounds</th>}
                                                {templateFields && templateFields.reading_time && <th>Reading Time</th>}
                                                {templateFields && templateFields.reading_topic && <th>Reading Topic</th>}
                                                {templateFields && templateFields.hearing_time && <th>Hearing Time</th>}
                                                {templateFields && templateFields.hearing_topic && <th>Hearing Topic</th>}
                                                {templateFields && templateFields.service_name && <th>Service Name</th>}
                                                {templateFields && templateFields.service_time && <th>Service Time</th>}
                                                {templateFields && (templateFields.sixteenRoundCompletedTime || templateFields.sixteen_round_completed_time) && <th>16 Round Completed Time</th>}
                                                {templateFields && templateFields.sleeping_time && <th>Sleeping Time</th>}
                                                {templateFields && templateFields.chanting_before_700 && <th>Chanting Before 7:00 AM</th>}
                                                {templateFields && templateFields.chanting_before_730 && <th>Chanting Before 7:30 AM</th>}
                                                {templateFields && templateFields.attended_mangal_arati && <th>Attended Mangal Arati</th>}
                                                {templateFields && templateFields.attended_bhagavatam_class && <th>Attended Bhagavatam Class</th>}
                                                {templateFields && templateFields.book_distribution && <th>Book Distribution</th>}
                                                {templateFields && templateFields.prasadam_honored && <th>Prasadam Honored</th>}
                                                {templateFields && templateFields.ekadashi_followed && <th>Ekadashi Followed</th>}
                                                {templateFields && templateFields.japa_quality && <th>Japa Quality</th>}
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {entries.map(entry => (
                                                <tr key={entry.id || entry.entry_date}>
                                                    {templateFields && templateFields.entry_date && <td>{formatDate(entry.entry_date)}</td>}
                                                    {templateFields && templateFields.wake_up_time && <td>{entry.wake_up_time}</td>}
                                                    {templateFields && templateFields.chanting_rounds && <td>{entry.chanting_rounds}</td>}
                                                    {templateFields && templateFields.reading_time && <td>{formatMinutes(entry.reading_time)}</td>}
                                                    {templateFields && templateFields.reading_topic && <td>{entry.reading_topic}</td>}
                                                    {templateFields && templateFields.hearing_time && <td>{formatMinutes(entry.hearing_time)}</td>}
                                                    {templateFields && templateFields.hearing_topic && <td>{entry.hearing_topic}</td>}
                                                    {templateFields && templateFields.service_name && <td>{entry.service_name}</td>}
                                                    {templateFields && templateFields.service_time && <td>{formatMinutes(entry.service_time)}</td>}
                                                    {templateFields && (templateFields.sixteenRoundCompletedTime || templateFields.sixteen_round_completed_time) && (
                                                        <td>{entry.sixteenRoundCompletedTime || entry.sixteen_round_completed_time || '-'}</td>
                                                    )}
                                                    {templateFields && templateFields.sleeping_time && <td>{entry.sleeping_time === 0 ? '-' : entry.sleeping_time}</td>}
                                                    {templateFields && templateFields.chanting_before_700 && <td>{entry.chanting_before_700 === 0 ? '-' : entry.chanting_before_700}</td>}
                                                    {templateFields && templateFields.chanting_before_730 && <td>{entry.chanting_before_730 === 0 ? '-' : entry.chanting_before_730}</td>}
                                                    {templateFields && templateFields.attended_mangal_arati && <td>{entry.attended_mangal_arati === 0 ? '-' : entry.attended_mangal_arati}</td>}
                                                    {templateFields && templateFields.attended_bhagavatam_class && <td>{entry.attended_bhagavatam_class === 0 ? '-' : entry.attended_bhagavatam_class}</td>}
                                                    {templateFields && templateFields.book_distribution && <td>{entry.book_distribution === 0 ? '-' : entry.book_distribution}</td>}
                                                    {templateFields && templateFields.prasadam_honored && <td>{entry.prasadam_honored === 0 ? '-' : entry.prasadam_honored}</td>}
                                                    {templateFields && templateFields.ekadashi_followed && <td>{entry.ekadashi_followed === 0 ? '-' : entry.ekadashi_followed}</td>}
                                                    {templateFields && templateFields.japa_quality && <td>{entry.japa_quality === 0 ? '-' : entry.japa_quality}</td>}
                                                    <td style={{ whiteSpace: 'nowrap' }}>
                                                        <div className="d-flex gap-1">
                                                            <button 
                                                                className="btn btn-sm btn-warning" 
                                                                onClick={() => handleEditClick(entry)}
                                                                title="Edit"
                                                            >
                                                                <i className="bi bi-pencil-square"></i>
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-danger" 
                                                                onClick={() => handleDeleteClick(entry)}
                                                                title="Delete"
                                                            >
                                                                <i className="bi bi-trash3-fill"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Edit Sadhana Entry</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleEditFormSubmit} id="editSadhanaForm">
                                    <div className="row g-3">
                                        {(!templateFields || templateFields.entry_date) && (<div className="col-md-4">
                                            <label className="form-label">Date</label>
                                            <input 
                                                type="date" 
                                                name="entryDate" 
                                                value={editFormData.entryDate} 
                                                onChange={handleEditFormChange} 
                                                className="form-control" 
                                                required 
                                            />
                                        </div>)}
                                        {(!templateFields || templateFields.sixteenRoundCompletedTime || templateFields?.sixteen_round_completed_time) && (
                                            <div className="col-md-4">
                                                <label className="form-label">16 Round Completed Time</label>
                                                <input
                                                    type="time"
                                                    step="1"
                                                    name="sixteenRoundCompletedTime"
                                                    value={editFormData.sixteenRoundCompletedTime}
                                                    onChange={handleEditFormChange}
                                                    className="form-control"
                                                    placeholder="hh:mm:ss"
                                                />
                                            </div>
                                        )}
                                        {(!templateFields || templateFields.wake_up_time) && (<div className="col-md-4">
                                            <label className="form-label">Wake-up Time</label>
                                            <input 
                                                type="time" 
                                                name="wakeUpTime" 
                                                value={editFormData.wakeUpTime} 
                                                onChange={handleEditFormChange} 
                                                className="form-control" 
                                            />
                                        </div>)}
                                        {(!templateFields || templateFields.chanting_rounds) && (<div className="col-md-4">
                                            <label className="form-label">Chanting Rounds</label>
                                            <input 
                                                type="number" 
                                                name="chantingRounds" 
                                                value={editFormData.chantingRounds} 
                                                onChange={handleEditFormChange} 
                                                className="form-control" 
                                            />
                                        </div>)}
                                        {(!templateFields || templateFields.reading_topic) && (<div className="col-md-6">
                                            <label className="form-label">Reading Topic</label>
                                            <input 
                                                type="text" 
                                                name="readingTopic" 
                                                value={editFormData.readingTopic} 
                                                onChange={handleEditFormChange} 
                                                className="form-control" 
                                            />
                                        </div>)}
                                        {(!templateFields || templateFields.reading_time) && (<div className="col-md-6">
                                            <label className="form-label">Reading Time</label>
                                            <div className="input-group">
                                                <input 
                                                    type="number" 
                                                    name="readingTime" 
                                                    value={editFormData.readingTime} 
                                                    onChange={handleEditFormChange} 
                                                    className="form-control" 
                                                />
                                                <select 
                                                    name="readingTimeUnit" 
                                                    value={editFormData.readingTimeUnit} 
                                                    onChange={handleEditFormChange} 
                                                    className="form-select"
                                                    style={{ maxWidth: '120px' }}
                                                >
                                                    <option value="minutes">Minutes</option>
                                                    <option value="hours">Hours</option>
                                                </select>
                                            </div>
                                        </div>)}
                                        {(!templateFields || templateFields.hearing_topic) && (<div className="col-md-6">
                                            <label className="form-label">Hearing Topic</label>
                                            <input 
                                                type="text" 
                                                name="hearingTopic" 
                                                value={editFormData.hearingTopic} 
                                                onChange={handleEditFormChange} 
                                                className="form-control" 
                                            />
                                        </div>)}
                                        {(!templateFields || templateFields.hearing_time) && (<div className="col-md-6">
                                            <label className="form-label">Hearing Time</label>
                                            <div className="input-group">
                                                <input 
                                                    type="number" 
                                                    name="hearingTime" 
                                                    value={editFormData.hearingTime} 
                                                    onChange={handleEditFormChange} 
                                                    className="form-control" 
                                                />
                                                <select 
                                                    name="hearingTimeUnit" 
                                                    value={editFormData.hearingTimeUnit} 
                                                    onChange={handleEditFormChange} 
                                                    className="form-select"
                                                    style={{ maxWidth: '120px' }}
                                                >
                                                    <option value="minutes">Minutes</option>
                                                    <option value="hours">Hours</option>
                                                </select>
                                            </div>
                                        </div>)}
                                        {(!templateFields || templateFields.service_name) && (<div className="col-md-6">
                                            <label className="form-label">Service Name</label>
                                            <input 
                                                type="text" 
                                                name="serviceName" 
                                                value={editFormData.serviceName} 
                                                onChange={handleEditFormChange} 
                                                className="form-control" 
                                            />
                                        </div>)}
                                        {(!templateFields || templateFields.service_time) && (<div className="col-md-6">
                                            <label className="form-label">Service Time</label>
                                            <div className="input-group">
                                                <input 
                                                    type="number" 
                                                    name="serviceTime" 
                                                    value={editFormData.serviceTime} 
                                                    onChange={handleEditFormChange} 
                                                    className="form-control" 
                                                />
                                                <select 
                                                    name="serviceTimeUnit" 
                                                    value={editFormData.serviceTimeUnit} 
                                                    onChange={handleEditFormChange} 
                                                    className="form-select"
                                                    style={{ maxWidth: '120px' }}
                                                >
                                                    <option value="minutes">Minutes</option>
                                                    <option value="hours">Hours</option>
                                                </select>
                                            </div>
                                        </div>)}

                                        {templateFields && templateFields.chanting_before_700 && (
                                            <div className="col-md-4">
                                                <label className="form-label">How many Round Chanted Before 7:00 AM</label>
                                                <input
                                                    type="text"
                                                    name="chantingBefore700Time"
                                                    value={editFormData.chantingBefore700Time || ''}
                                                    onChange={handleEditFormChange}
                                                    className="form-control"
                                                    placeholder="Enter time or note"
                                                />
                                            </div>
                                        )}

                                        {templateFields && templateFields.chanting_before_730 && (
                                            <div className="col-md-4">
                                                <label className="form-label">How many Round Chanted Before 7:30 AM</label>
                                                <input
                                                    type="text"
                                                    name="chantingBefore730Time"
                                                    value={editFormData.chantingBefore730Time || ''}
                                                    onChange={handleEditFormChange}
                                                    className="form-control"
                                                    placeholder="Enter time or note"
                                                />
                                            </div>
                                        )}

                                        {templateFields && templateFields.sleeping_time && (
                                            <div className="col-md-4">
                                                <label className="form-label">Sleeping Time</label>
                                                <input
                                                    type="time"
                                                    name="sleepingTime"
                                                    value={editFormData.sleepingTime || ''}
                                                    onChange={handleEditFormChange}
                                                    className="form-control"
                                                />
                                            </div>
                                        )}

                                        {templateFields && templateFields.attended_mangal_arati && (
                                            <div className="col-md-4">
                                                <label className="form-label">Attended Mangal Arati</label>
                                                <input
                                                    type="text"
                                                    name="attendedMangalAratiTime"
                                                    value={editFormData.attendedMangalAratiTime || ''}
                                                    onChange={handleEditFormChange}
                                                    className="form-control"
                                                    placeholder="Enter time or note"
                                                />
                                            </div>
                                        )}

                                        {templateFields && templateFields.attended_bhagavatam_class && (
                                            <div className="col-md-4">
                                                <label className="form-label d-block">Program Attendance</label>
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        name="attendedBhagavatamClass"
                                                        checked={editFormData.attendedBhagavatamClass}
                                                        onChange={(e) => setEditFormData({ ...editFormData, attendedBhagavatamClass: e.target.checked })}
                                                        className="form-check-input"
                                                        id="editAttendedBhagavatamClass"
                                                    />
                                                    <label className="form-check-label" htmlFor="editAttendedBhagavatamClass">
                                                        Attended Bhagavatam Class
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {templateFields && templateFields.book_distribution && (
                                            <div className="col-md-4">
                                                <label className="form-label">Book Distribution (Books)</label>
                                                <input
                                                    type="number"
                                                    name="bookDistribution"
                                                    value={editFormData.bookDistribution}
                                                    onChange={handleEditFormChange}
                                                    className="form-control"
                                                />
                                            </div>
                                        )}

                                        {templateFields && templateFields.prasadam_honored && (
                                            <div className="col-md-4">
                                                <label className="form-label d-block">Prasadam</label>
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        name="prasadamHonored"
                                                        checked={editFormData.prasadamHonored}
                                                        onChange={(e) => setEditFormData({ ...editFormData, prasadamHonored: e.target.checked })}
                                                        className="form-check-input"
                                                        id="editPrasadamHonored"
                                                    />
                                                    <label className="form-check-label" htmlFor="editPrasadamHonored">
                                                        Prasadam Honored
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {templateFields && templateFields.ekadashi_followed && (
                                            <div className="col-md-4">
                                                <label className="form-label d-block">Fasting</label>
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        name="ekadashiFollowed"
                                                        checked={editFormData.ekadashiFollowed}
                                                        onChange={(e) => setEditFormData({ ...editFormData, ekadashiFollowed: e.target.checked })}
                                                        className="form-check-input"
                                                        id="editEkadashiFollowed"
                                                    />
                                                    <label className="form-check-label" htmlFor="editEkadashiFollowed">
                                                        Ekadashi Followed
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {templateFields && templateFields.japa_quality && (
                                            <div className="col-md-4">
                                                <label className="form-label">Japa Quality (1-10)</label>
                                                <input
                                                    type="number"
                                                    name="japaQuality"
                                                    min="1"
                                                    max="10"
                                                    value={editFormData.japaQuality}
                                                    onChange={handleEditFormChange}
                                                    className="form-control"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" form="editSadhanaForm" className="btn btn-primary">
                                    <i className="bi bi-check-circle"></i> Update Entry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deletingEntry && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete the sadhana entry for <strong>{formatDate(deletingEntry.entry_date)}</strong>?</p>
                                <p className="mb-2">Type <strong>delete</strong> to confirm:</p>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Type 'delete' to confirm"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button 
                                    type="button" 
                                    className="btn btn-danger" 
                                    onClick={confirmDelete}
                                    disabled={deleteConfirmText.toLowerCase() !== 'delete'}
                                >
                                    <i className="bi bi-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
