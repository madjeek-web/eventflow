import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const categoriesFilePath = path.join(process.cwd(), 'src', 'data', 'categories.json');



export async function GET(request) {
    const dataJsonString = await fs.readFile(categoriesFilePath, 'utf-8');
    const categories = JSON.parse(dataJsonString);
    return NextResponse.json(categories);
}


export async function POST(request) {
    const dataJsonString = await fs.readFile(categoriesFilePath, 'utf-8');
    const categories = JSON.parse(dataJsonString);
    const newCategory = await request.json();
    categories.push({id: "test", ...newCategory});

    await fs.writeFile(categoriesFilePath, JSON.stringify(categories, null, 4));
    return NextResponse.json(newCategory); 
}   
