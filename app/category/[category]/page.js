// app/category/[category]/page.jsx
"use client";

import { use } from 'react';
import CategoryPage from '@/components/CategoryPage';

export default function CategoryDetailPage({ params }) {
  // Use React.use() to unwrap params
  const unwrappedParams = use(params);
  const { category } = unwrappedParams;
  
  if (!category) {
    return null;
  }
  
  return <CategoryPage params={{ category }} />;
}