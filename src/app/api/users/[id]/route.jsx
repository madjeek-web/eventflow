import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { usersFilePath } from '../route';


export async function GET(request, { params }) {
    const { id } = await params;

    const dataJsonString = await fs.readFile(usersFilePath, 'utf-8');
    const usersData = JSON.parse(dataJsonString);

    const founded = usersData.find(user => user.id == id);
    if (!founded) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(founded);
}


export async function DELETE(request, { params }) {
    const { id } = await params;

    const dataJsonString = await fs.readFile(usersFilePath, 'utf-8');
    const users = JSON.parse(dataJsonString);

    const newUsers = users.filter(event => event.id != id);

    await fs.writeFile(usersFilePath, JSON.stringify(newUsers, null, 4));
    return NextResponse.json(newUsers); 
}