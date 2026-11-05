# FreshCart – Online Grocery Shopping Platform

FreshCart is a modern, responsive, full-stack e-commerce web application engineered with React, Vite, Tailwind CSS, Node.js, Express REST APIs, JWT authentication, and Razorpay Test Mode integration.

---

## 🚀 Key Features

### 🛒 Customer Experience
- **12 Grocery Categories**: Fruits, Vegetables, Dairy Products, Bakery Items, Snacks, Beverages, Household Items, Personal Care, Rice & Grains, Pulses & Lentils, Cooking Essentials, Frozen Foods.
- **200+ Fresh Grocery Items**: Realistic images, organic tags, discounts, units (`1 kg`, `500 g`, `1 Litre`), real-time stock levels, ratings, and customer reviews.
- **Smart Shopping Cart**: Real-time quantity stepper directly on cards, auto subtotal calculation, coupon discounts (`FRESH20`, `FIRST50`, `SUPER100`), free delivery meter, 5% GST calculation.
- **Delivery Zone Picker**: Indiranagar Bengaluru (560038), Koramangala (560034), Mumbai Bandra (400050), and custom PIN code support with 10-15 minute delivery promises.
- **Checkout & Payment Integration**:
  - **Razorpay Test Payment Gateway**: Simulated authentic modal with UPI (GPay/PhonePe/Paytm), test cards, Net Banking, and server-side signature verification.
  - **Cash on Delivery (COD)** support.
- **Order Management & Tracking**:
  - Live 6-step progress stepper: *Order Placed &rarr; Confirmed &rarr; Processing &rarr; Packed &rarr; Out for Delivery &rarr; Delivered*.
  - **Downloadable PDF Tax Invoices** generated via jsPDF.
  - 1-Click **Reorder Past Baskets**.
- **Customer Account & Security**: JWT Authentication, bcrypt password hashing, multiple saved delivery addresses (Home, Work, Other), default address selection, password updates.

### 🛡️ Admin Portal & Operations Hub
- **Executive KPI Dashboard**: Total Revenue, Total Orders, Active Customers, Total Catalog Items, Pending Dispatches, Delivered Orders, and Low Stock Alerts (&le; 30 units).
- **Product CRUD**: Add products, edit prices/discounts/stock, upload images, tag as *Deal of the Day* or *Organic*, delete items.
- **Category Management**: Create and manage grocery aisles.
- **Order Management**: Live order status transitions (*Placed &rarr; Confirmed &rarr; Processing &rarr; Packed &rarr; Out for Delivery &rarr; Delivered &rarr; Cancelled*).
- **Customer CRM**: View customer lifetime spend, order history, and saved address counts.
- **Reports & Excel Export**: Export all orders and daily sales revenue analytics to `.xlsx` Excel spreadsheets.
- **1-Click Demo Switcher**: Switch between Customer Mode and Admin Mode in the header navigation or Auth modal.

---

## 🔑 Test Credentials

| Role | Email / Login | Password | Notes |
|---|---|---|---|
| **Admin** | `admin@freshcart.com` | `Admin@123` | Full dashboard access, product CRUD, status updates, Excel export |
| **Customer** | `customer@freshcart.com` | `Customer@123` | Demo customer with sample orders, addresses, and wishlist |

*Tip: You can also click the "Demo Customer" or "Admin Portal" buttons in the Sign-In modal for instant 1-click access.*

---

## 🎟️ Active Promo Coupons

- **`FRESH20`**: 20% OFF up to ₹150 (Minimum order ₹499)
- **`FIRST50`**: Flat ₹50 OFF (Minimum order ₹299)
- **`SUPER100`**: Flat ₹100 OFF (Minimum order ₹999)

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React Icons, Canvas Confetti.
- **Backend**: Node.js, Express.js REST API architecture, JWT authentication (`jsonwebtoken`), password hashing (`bcryptjs`).
- **Database**: Persistent document store with automatic file backup (`data/freshcart_db.json`), unique constraints, schema validation, and instant database reset capability.
- **Exports**: `jspdf` for client-side downloadable PDF Tax Invoices, `xlsx` for Excel data reporting.

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Full-Stack Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000` with the Express API and Vite frontend bundled seamlessly.

### 3. Production Build
```bash
npm run build
npm start
```
