import * as XLSX from 'xlsx';
import { IOrder } from '../types/index.ts';

export function exportOrdersToExcel(orders: IOrder[], filename: string = 'FreshCart_Orders_Report.xlsx'): void {
  const rows = orders.map(o => ({
    'Order Number': o.orderNumber,
    'Date': new Date(o.createdAt).toLocaleString(),
    'Customer Name': o.customerName,
    'Customer Email': o.customerEmail,
    'Customer Mobile': o.customerMobile,
    'Delivery City': o.shippingAddress?.city || '',
    'Delivery Pincode': o.shippingAddress?.pincode || '',
    'Total Items': o.items.reduce((acc, i) => acc + i.quantity, 0),
    'Subtotal (INR)': o.subtotal,
    'Discount (INR)': o.discount,
    'Delivery Fee (INR)': o.deliveryFee,
    'GST Tax (INR)': o.tax,
    'Total Amount (INR)': o.total,
    'Payment Method': o.paymentMethod,
    'Payment Status': o.paymentStatus,
    'Razorpay Txn ID': o.razorpayPaymentId || 'N/A',
    'Order Status': o.orderStatus,
    'Delivery Slot': o.deliverySlot
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  XLSX.writeFile(workbook, filename);
}

export function exportSalesReportToExcel(reportData: {
  salesTimeline: { date: string; orders: number; revenue: number }[];
  topProducts: { id: string; name: string; quantity: number; revenue: number }[];
}): void {
  const workbook = XLSX.utils.book_new();

  // Daily/Weekly sheet
  const timelineRows = reportData.salesTimeline.map(s => ({
    'Date': s.date,
    'Total Orders': s.orders,
    'Total Revenue (INR)': s.revenue
  }));
  const wsTimeline = XLSX.utils.json_to_sheet(timelineRows);
  XLSX.utils.book_append_sheet(workbook, wsTimeline, 'Daily Revenue');

  // Top products sheet
  const productRows = reportData.topProducts.map((p, idx) => ({
    'Rank': idx + 1,
    'Product ID': p.id,
    'Product Name': p.name,
    'Units Sold': p.quantity,
    'Revenue Generated (INR)': p.revenue
  }));
  const wsProducts = XLSX.utils.json_to_sheet(productRows);
  XLSX.utils.book_append_sheet(workbook, wsProducts, 'Top Selling Products');

  XLSX.writeFile(workbook, 'FreshCart_Sales_Analytics_Report.xlsx');
}
