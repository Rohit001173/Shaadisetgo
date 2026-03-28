import { NextResponse } from 'next/server';
import { weddingCategories, flatCategories } from '@/lib/categories';

// GET /api/categories - Get all categories
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        categories: weddingCategories,
        flatCategories,
        totalCategories: weddingCategories.length,
        totalSubcategories: weddingCategories.reduce((acc, cat) => acc + cat.subcategories.length, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
