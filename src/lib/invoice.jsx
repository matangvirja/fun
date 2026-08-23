import { jsPDF } from 'jspdf';
import { formatPrice } from '@/lib/format';

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

const LH = 14; // standard line height

export function downloadInvoice(order) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const CW = W - M * 2;
  let y = 0;

  // ── Header band ──────────────────────────────────
  const bandH = 88;
  doc.setFillColor(...C.forest);
  doc.rect(0, 0, W, bandH, 'F');

  // Logo block (left) — vertically centered as a group
  const logoX = M;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(STORE.name, logoX, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(205, 218, 212);
  doc.text(STORE.tagline, logoX, 54);
  doc.text(`${STORE.email}  ·  ${STORE.address}`, logoX, 68);

  // "INVOICE" label (right) — vertically centered in band
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', W - M, bandH / 2 + 9, { align: 'right' });

  y = bandH + 36;

  // ── Billed To (left) & Invoice Details (right) ──
  // Two aligned boxes
  const boxW = 232;
  const boxH = 112;
  const leftBoxX = M;
  const rightBoxX = W - M - boxW;
  const boxY = y;

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.6);
  doc.setFillColor(...C.forestSoft);
  doc.roundedRect(leftBoxX, boxY, boxW, boxH, 5, 5, 'FD');
  doc.roundedRect(rightBoxX, boxY, boxW, boxH, 5, 5, 'FD');

  // Left box — Billed To
  const padX = 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  doc.text('BILLED TO', leftBoxX + padX, boxY + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.textDark);
  doc.text(order.customer_name || 'Guest', leftBoxX + padX, boxY + 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.textMuted);
  let by = boxY + 54;
  if (order.customer_email) { doc.text(order.customer_email, leftBoxX + padX, by); by += LH; }
  if (order.address) { doc.text(order.address, leftBoxX + padX, by); by += LH; }
  const cityLine = [order.city, order.zip].filter(Boolean).join(' ');
  if (cityLine) { doc.text(cityLine, leftBoxX + padX, by); by += LH; }
  if (order.country) { doc.text(order.country, leftBoxX + padX, by); }

  // Right box — Invoice Details
  const invNo = `INV-${order.id.slice(0, 8).toUpperCase()}`;
  const orderNo = `#${order.id.slice(0, 8)}`;
  const date = new Date(order.created_date || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  doc.text('INVOICE DETAILS', rightBoxX + padX, boxY + 20);

  const labelX = rightBoxX + padX;
  const valueX = rightBoxX + boxW - padX;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.textMuted);
  doc.text('Invoice No.', labelX, boxY + 38);
  doc.text('Order No.', labelX, boxY + 38 + LH);
  doc.text('Date', labelX, boxY + 38 + LH * 2);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.textDark);
  doc.text(invNo, valueX, boxY + 38, { align: 'right' });
  doc.text(orderNo, valueX, boxY + 38 + LH, { align: 'right' });
  doc.text(date, valueX, boxY + 38 + LH * 2, { align: 'right' });

  // Status badge — below invoice details values
  const status = order.status || 'pending';
  const sc = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const badgeW = 72;
  const badgeH = 16;
  const badgeX = valueX - badgeW;
  const badgeY = boxY + 38 + LH * 3 - 4;
  doc.setFillColor(...sc);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(status.toUpperCase(), badgeX + badgeW / 2, badgeY + 11, { align: 'center' });

  y = boxY + boxH + 28;

  // ── Items table ──────────────────────────────────
  // Column right-edges (values are right-aligned)
  const colItemL = M + 14;
  const colQtyR = M + 350;
  const colPriceR = M + 440;
  const colAmountR = W - M - 14;
  const itemWrapW = 250;

  const tableTop = y;
  const headH = 28;
  const rowH = 28;

  // Header row
  doc.setFillColor(...C.forest);
  doc.rect(M, tableTop, CW, headH, 'F');
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
    if (y > H - 200) { doc.addPage(); y = 56; }

    if (idx % 2 === 0) {
      doc.setFillColor(...C.stripe);
      doc.rect(M, y, CW, rowH, 'F');
    }

    const rowMid = y + rowH / 2 + 3;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.textDark);
    const name = String(item.name || 'Item');
    const wrapped = doc.splitTextToSize(name, itemWrapW);
    doc.text(wrapped, colItemL, rowMid - (wrapped.length - 1) * 5);

    doc.setTextColor(...C.textMuted);
    doc.text(String(item.quantity || 1), colQtyR, rowMid, { align: 'right' });

    doc.setTextColor(...C.textDark);
    doc.text(formatPrice(item.price), colPriceR, rowMid, { align: 'right' });
    doc.text(formatPrice((item.price || 0) * (item.quantity || 1)), colAmountR, rowMid, { align: 'right' });

    doc.setDrawColor(...C.borderLight);
    doc.setLineWidth(0.4);
    doc.line(M, y + rowH, W - M, y + rowH);

    y += rowH;
  });

  // Table border
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.6);
  doc.rect(M, tableTop, CW, y - tableTop);

  y += 26;

  // ── Totals box (right) ──────────────────────────
  const totalsW = 232;
  const totalsX = W - M - totalsW;
  const totalsH = 90;

  doc.setFillColor(...C.forestSoft);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.6);
  doc.roundedRect(totalsX, y, totalsW, totalsH, 5, 5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...C.textDark);
  doc.text('Subtotal', totalsX + padX, y + 22);
  doc.text(formatPrice(order.subtotal || 0), totalsX + totalsW - padX, y + 22, { align: 'right' });

  doc.setTextColor(...C.textMuted);
  doc.text('Shipping', totalsX + padX, y + 42);
  const shipText = (order.shipping || 0) === 0 ? 'FREE' : formatPrice(order.shipping || 0);
  doc.text(shipText, totalsX + totalsW - padX, y + 42, { align: 'right' });

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(totalsX + padX, y + 54, totalsX + totalsW - padX, y + 54);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.forest);
  doc.text('TOTAL', totalsX + padX, y + 74);
  doc.text(formatPrice(order.total || 0), totalsX + totalsW - padX, y + 74, { align: 'right' });

  // ── Footer ───────────────────────────────────────
  const footerY = H - 52;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(M, footerY, W - M, footerY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...C.forest);
  doc.text('Thank you for shopping with FunFable!', W / 2, footerY + 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.textMuted);
  doc.text('This is a computer-generated invoice and does not require a signature.', W / 2, footerY + 32, { align: 'center' });

  doc.save(`${invNo}.pdf`);
}