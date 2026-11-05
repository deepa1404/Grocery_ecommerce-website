import { jsPDF } from 'jspdf';
import { IOrder } from '../types/index.ts';

export function downloadOrderInvoice(order: IOrder): void {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4'
  });

  // Colors
  const emeraldPrimary = [16, 149, 106]; // #10b981
  const darkSlate = [30, 41, 59];       // #1e293b
  const lightBg = [248, 250, 252];       // #f8fafc

  // Header background
  doc.setFillColor(emeraldPrimary[0], emeraldPrimary[1], emeraldPrimary[2]);
  doc.rect(0, 0, 210, 32, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('FreshCart', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Online Grocery Shopping Platform | GSTIN: 29AAAAA0000A1Z5', 15, 25);

  // Invoice Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TAX INVOICE', 195, 18, { align: 'right' });
  doc.setFontSize(10);
  doc.text(`Original for Recipient`, 195, 25, { align: 'right' });

  // Order Details Block
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFontSize(10);

  let y = 42;
  doc.setFont('helvetica', 'bold');
  doc.text('Order Details', 15, y);
  doc.text('Billed & Shipped To:', 110, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Order Number: ${order.orderNumber}`, 15, y);
  doc.text(`${order.customerName}`, 110, y);

  y += 5;
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 15, y);
  doc.text(`${order.shippingAddress?.street || 'Address'}`, 110, y);

  y += 5;
  doc.text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, 15, y);
  doc.text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`, 110, y);

  y += 5;
  if (order.razorpayPaymentId) {
    doc.text(`Txn ID: ${order.razorpayPaymentId}`, 15, y);
  } else {
    doc.text(`Delivery Slot: ${order.deliverySlot}`, 15, y);
  }
  doc.text(`Phone: ${order.customerMobile || order.shippingAddress?.mobile}`, 110, y);

  // Table Headers
  y += 14;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(15, y, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('#', 18, y + 5.5);
  doc.text('Item Description', 28, y + 5.5);
  doc.text('Unit', 105, y + 5.5);
  doc.text('Qty', 130, y + 5.5);
  doc.text('Price (INR)', 150, y + 5.5);
  doc.text('Total (INR)', 188, y + 5.5, { align: 'right' });

  // Table Rows
  y += 10;
  doc.setFont('helvetica', 'normal');

  order.items.forEach((item, index) => {
    const rowY = y + index * 8;
    // alternating background
    if (index % 2 === 1) {
      doc.setFillColor(252, 252, 253);
      doc.rect(15, rowY - 4, 180, 8, 'F');
    }

    doc.text(`${index + 1}`, 18, rowY);
    // truncate long names
    const itemName = item.name.length > 35 ? item.name.substring(0, 32) + '...' : item.name;
    doc.text(itemName, 28, rowY);
    doc.text(item.unit || '1 pc', 105, rowY);
    doc.text(`${item.quantity}`, 130, rowY);
    doc.text(`₹${item.price}`, 150, rowY);
    doc.text(`₹${item.total}`, 188, rowY, { align: 'right' });
  });

  const tableBottomY = y + order.items.length * 8 + 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, tableBottomY, 195, tableBottomY);

  // Financial Breakdown
  let summaryY = tableBottomY + 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.text('Subtotal:', 140, summaryY);
  doc.text(`₹${order.subtotal}`, 188, summaryY, { align: 'right' });

  if (order.discount > 0) {
    summaryY += 6;
    doc.setTextColor(16, 149, 106);
    doc.text(`Coupon Savings (${order.couponCode || 'Promo'}):`, 140, summaryY);
    doc.text(`-₹${order.discount}`, 188, summaryY, { align: 'right' });
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  }

  summaryY += 6;
  doc.text('Delivery Charges:', 140, summaryY);
  doc.text(order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`, 188, summaryY, { align: 'right' });

  summaryY += 6;
  doc.text('Estimated GST (5%):', 140, summaryY);
  doc.text(`₹${order.tax}`, 188, summaryY, { align: 'right' });

  summaryY += 8;
  doc.setFillColor(emeraldPrimary[0], emeraldPrimary[1], emeraldPrimary[2]);
  doc.rect(135, summaryY - 5, 60, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Grand Total:', 140, summaryY + 1.5);
  doc.text(`₹${order.total}`, 190, summaryY + 1.5, { align: 'right' });

  // Guarantee & Footer note
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for shopping with FreshCart!', 15, 270);
  doc.text('100% Quality & Freshness Guarantee. For queries, contact support@freshcart.com or call 1800-FRESH-CART.', 15, 275);
  doc.text('This is a computer-generated tax invoice and requires no physical signature.', 15, 280);

  // Save the PDF
  doc.save(`FreshCart_Invoice_${order.orderNumber}.pdf`);
}
