import fs from 'fs';
import path from 'path';

// Let's create the 12 categories and 312 products with distinct Unsplash URLs
const categories = [
  {
    id: "cat-1",
    name: "Fruits",
    slug: "fruits",
    description: "Farm-fresh, crisp, and naturally sweet seasonal & exotic fruits",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cat-2",
    name: "Vegetables",
    slug: "vegetables",
    description: "Daily harvested fresh leafy greens, root veggies and organics",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cat-3",
    name: "Dairy Products",
    slug: "dairy-products",
    description: "Fresh farm milk, artisanal cheese, paneer, butter and yogurts",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cat-4",
    name: "Bakery Items",
    slug: "bakery-items",
    description: "Artisan sourdough, whole wheat breads, cookies, buns & muffins",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cat-5",
    name: "Snacks",
    slug: "snacks",
    description: "Crunchy chips, roasted nuts, healthy energy bars & crackers",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cat-6",
    name: "Beverages",
    slug: "beverages",
    description: "Fresh fruit juices, coconut water, cold-brew coffee & organic teas",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cat-7",
    name: "Household Items",
    slug: "household-items",
    description: "Eco-friendly cleaners, laundry detergents, wipes and essentials",
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cat-8",
    name: "Personal Care",
    slug: "personal-care",
    description: "Herbal soaps, shampoos, oral care, lotions and hand washes",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cat-9",
    name: "Rice & Grains",
    slug: "rice-grains",
    description: "Aromatic Basmati rice, quinoa, whole oats, millets & wheat",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cat-10",
    name: "Pulses & Lentils",
    slug: "pulses-lentils",
    description: "Unpolished Toor Dal, Moong, Chana, Rajma and organic lentils",
    image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cat-11",
    name: "Cooking Essentials",
    slug: "cooking-essentials",
    description: "Cold-pressed mustard & olive oils, whole spices, Himalayan salts",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cat-12",
    name: "Frozen Foods",
    slug: "frozen-foods",
    description: "Green peas, sweet corn, frozen berries, ready-to-fry snack bites",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80"
  }
];

export { categories };
