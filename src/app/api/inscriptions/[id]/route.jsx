import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { inscriptionsFilePath } from '../route';


export async function GET(request, { params }) {
    const { id } = await params;

    const dataJsonString = await fs.readFile(inscriptionsFilePath, 'utf-8');
    const inscriptionsData = JSON.parse(dataJsonString);

    const founded = inscriptionsData.find(inscription => inscription.id == id);
    if (!founded) {
        return NextResponse.json({ message: 'Inscription not found' }, { status: 404 });
    }
    return NextResponse.json(founded);
}


export async function DELETE(request, { params }) {
    const { id } = await params;

    const dataJsonString = await fs.readFile(inscriptionsFilePath, 'utf-8');
    const inscriptions = JSON.parse(dataJsonString);

    const newInscriptions = inscriptions.filter(event => event.id != id);

    await fs.writeFile(inscriptionsFilePath, JSON.stringify(newInscriptions, null, 4));
    return NextResponse.json(newInscriptions); 
}