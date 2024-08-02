import { NextRequest, NextResponse } from 'next/server';
import suggestMessages from '@/data/suggest-messages.json';

function getRandomMessages(messages: any[], count: number) {
    const shuffled = messages.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

export async function POST(req: NextRequest) {
    try {
        const randomMessages = getRandomMessages(suggestMessages, 5);
        return NextResponse.json({ suggestions: randomMessages });
    } catch (error) {
        console.error('Error generating suggestions:', error);
        return NextResponse.json(
            {
                error: 'Error generating suggestions',
                details: (error as Error).message,
            },
            {
                status: 500,
            }
        );
    }
}