import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { categoriesFilePath } from '../route';


export async function GET(request, { params }) {
    const { id } = await params;

    const dataJsonString = await fs.readFile(categoriesFilePath, 'utf-8');
    const categoriesData = JSON.parse(dataJsonString);

    const founded = categoriesData.find(categorie => categorie.id === parseInt(id));
    if (!founded) {
        return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(founded);
}


export async function DELETE(request, { params }) {
    const { id } = await params;

    const dataJsonString = await fs.readFile(categoriesFilePath, 'utf-8');
    const categories = JSON.parse(dataJsonString);

    const newCategories = categories.filter(category => category.id !== parseInt(id));

    await fs.writeFile(categoriesFilePath, JSON.stringify(newCategories, null, 4));
    return NextResponse.json(newCategories); 
}