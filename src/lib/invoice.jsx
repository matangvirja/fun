import { jsPDF } from 'jspdf';

const STORE = {
  name: 'FunFable',
  tagline: 'Toys That Tell Stories',
  email: 'hello@funfable.store',
  address: 'Bengaluru, India',
};

// Brand palette (RGB)
const C = {
  forest: [26, 77, 61],
  forestSoft: [245, 247, 245],
  paper: [252, 250, 247],
  border: [221, 216, 209],
  borderLight: [235, 231, 225],
  textDark: [28, 28, 28],
  textMuted: [118, 118, 118],
  stripe: [248, 245, 240],
};

const STATUS_COLORS = {
  pending: [176, 118, 28],
  paid: [22, 120, 70],
  shipped: [30, 100, 160],
  delivered: [22, 120, 70],
  cancelled: [190, 60, 55],
};

// Safe price formatter for PDF — avoids Unicode rupee symbol that Helvetica can't render
function pdfPrice(n) {
  const v = Number(n || 0);
  const formatted = v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return `Rs. ${formatted}`;
}

export function downloadInvoice(order) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48; // margin
  const CW = W - M * 2; // content width
  let y = 0;

  // ── Header band ──────────────────────────────────
  const bandH = 96;
  doc.setFillColor(...C.forest);
  doc.rect(0, 0, W, bandH, 'F');

  // Logo block (left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text(STORE.name, M, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(205, 218, 212);
  doc.text(STORE.tagline, M, 58);
  doc.text(`${STORE.email}  |  ${STORE.address}`, M, 74);

  // "INVOICE" label (right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', W - M, bandH / 2 + 10, { align: 'right' });

  y = bandH + 40;

  // ── Billed To (left) & Invoice Details (right) ──
  const boxW = 230;
  const boxH = 130;
  const leftBoxX = M;
  const rightBoxX = W - M - boxW;
  const boxY = y;
  const padX = 16;
  const lineH = 16; // line height inside boxes

  // Draw boxes
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.6);
  doc.setFillColor(...C.forestSoft);
  doc.roundedRect(leftBoxX, boxY, boxW, boxH, 5, 5, 'FD');
  doc.roundedRect(rightBoxX, boxY, boxW, boxH, 5, 5, 'FD');

  // Left box — Billed To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  doc.text('BILLED TO', leftBoxX + padX, boxY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.textDark);
  doc.text(order.customer_name || 'Guest', leftBoxX + padX, boxY + 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.textMuted);
  let by = boxY + 60;
  if (order.customer_email) {
    doc.text(order.customer_email, leftBoxX + padX, by);
    by += lineH;
  }
  if (order.address) {
    // Wrap long address lines
    const addrLines = doc.splitTextToSize(order.address, boxW - padX * 2);
    addrLines.forEach((line) => {
      doc.text(line, leftBoxX + padX, by);
      by += lineH;
    });
  }
  const cityLine = [order.city, order.zip].filter(Boolean).join(' ');
  if (cityLine) {
    doc.text(cityLine, leftBoxX + padX, by);
    by += lineH;
  }
  if (order.country) {
    doc.text(order.country, leftBoxX + padX, by);
  }

  // Right box — Invoice Details
  const invNo = `INV-${(order.id || '').slice(0, 8).toUpperCase()}`;
  const orderNo = `#${(order.id || '').slice(0, 8)}`;
  const rawDate = order.created_at || order.created_date || Date.now();
  const date = new Date(rawDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  doc.text('INVOICE DETAILS', rightBoxX + padX, boxY + 22);

  const labelX = rightBoxX + padX;
  const valueX = rightBoxX + boxW - padX;

  const detailRows = [
    { label: 'Invoice No.', value: invNo },
    { label: 'Order No.', value: orderNo },
    { label: 'Date', value: date },
  ];

  detailRows.forEach((row, i) => {
    const rowY = boxY + 44 + i * 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.textMuted);
    doc.text(row.label, labelX, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.textDark);
    doc.text(row.value, valueX, rowY, { align: 'right' });
  });

  // Status badge
  const status = order.status || 'pending';
  const sc = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const badgeW = 76;
  const badgeH = 18;
  const badgeX = valueX - badgeW;
  const badgeY = boxY + 44 + detailRows.length * 20 + 2;
  doc.setFillColor(...sc);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(status.toUpperCase(), badgeX + badgeW / 2, badgeY + 12, { align: 'center' });

  y = boxY + boxH + 32;

  // ── Items table ──────────────────────────────────
  const colItemL = M + 16;
  const colQtyR = W - M - 240;
  const colPriceR = W - M - 120;
  const colAmountR = W - M - 16;
  const itemWrapW = colQtyR - colItemL - 20;

  const tableTop = y;
  const headH = 32;
  const rowPadY = 10;

  // Header row
  doc.setFillColor(...C.forest);
  doc.roundedRect(M, tableTop, CW, headH, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ITEM', colItemL, tableTop + headH / 2 + 3);
  doc.text('QTY', colQtyR, tableTop + headH / 2 + 3, { align: 'right' });
  doc.text('UNIT PRICE', colPriceR, tableTop + headH / 2 + 3, { align: 'right' });
  doc.text('AMOUNT', colAmountR, tableTop + headH / 2 + 3, { align: 'right' });

  y = tableTop + headH;

  // Item rows
  const items = order.items || [];
  doc.setFontSize(9);
  items.forEach((item, idx) => {
    // Calculate row height based on text wrapping
    const name = String(item.name || 'Item');
    const wrapped = doc.splitTextToSize(name, itemWrapW);
    const textH = wrapped.length * 14;
    const rowH = Math.max(36, textH + rowPadY * 2);

    // Page break check
    if (y + rowH > H - 200) {
      doc.addPage();
      y = 56;
    }

    // Stripe background
    if (idx % 2 === 0) {
      doc.setFillColor(...C.stripe);
      doc.rect(M, y, CW, rowH, 'F');
    }

    const rowMidY = y + rowH / 2 + 3;

    // Item name (left-aligned, wrapped)
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.textDark);
    const nameStartY = y + rowPadY + 12;
    wrapped.forEach((line, li) => {
      doc.text(line, colItemL, nameStartY + li * 14);
    });

    // Quantity
    doc.setTextColor(...C.textMuted);
    doc.text(String(item.quantity || 1), colQtyR, rowMidY, { align: 'right' });

    // Unit price
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.textDark);
    doc.text(pdfPrice(item.price), colPriceR, rowMidY, { align: 'right' });

    // Amount
    doc.setFont('helvetica', 'bold');
    doc.text(pdfPrice((item.price || 0) * (item.quantity || 1)), colAmountR, rowMidY, { align: 'right' });

    // Row separator
    doc.setDrawColor(...C.borderLight);
    doc.setLineWidth(0.4);
    doc.line(M, y + rowH, W - M, y + rowH);

    y += rowH;
  });

  // Table border
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.6);
  doc.roundedRect(M, tableTop, CW, y - tableTop, 3, 3, 'S');

  y += 30;

  // ── Totals box (right-aligned) ──────────────────
  const totalsW = 240;
  const totalsX = W - M - totalsW;
  const totalsH = 100;

  // Page break check for totals
  if (y + totalsH + 80 > H) {
    doc.addPage();
    y = 56;
  }

  doc.setFillColor(...C.forestSoft);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.6);
  doc.roundedRect(totalsX, y, totalsW, totalsH, 5, 5, 'FD');

  const tPad = 18;

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...C.textDark);
  doc.text('Subtotal', totalsX + tPad, y + 24);
  doc.text(pdfPrice(order.subtotal || 0), totalsX + totalsW - tPad, y + 24, { align: 'right' });

  // Shipping
  doc.setTextColor(...C.textMuted);
  doc.text('Shipping', totalsX + tPad, y + 46);
  const shipText = (order.shipping || 0) === 0 ? 'FREE' : pdfPrice(order.shipping || 0);
  doc.text(shipText, totalsX + totalsW - tPad, y + 46, { align: 'right' });

  // Divider line
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(totalsX + tPad, y + 58, totalsX + totalsW - tPad, y + 58);

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...C.forest);
  doc.text('TOTAL', totalsX + tPad, y + 80);
  doc.text(pdfPrice(order.total || 0), totalsX + totalsW - tPad, y + 80, { align: 'right' });

  // ── Footer ───────────────────────────────────────
  const footerY = H - 56;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(M, footerY, W - M, footerY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...C.forest);
  doc.text('Thank you for shopping with FunFable!', W / 2, footerY + 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.textMuted);
  doc.text('This is a computer-generated invoice and does not require a signature.', W / 2, footerY + 36, { align: 'center' });

  doc.save(`${invNo}.pdf`);
}