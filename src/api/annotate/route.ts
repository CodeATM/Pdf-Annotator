import { NextResponse } from 'next/server';
import { addAnnotationsToPdf } from '@/lib/pdf-utils';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const annotations = JSON.parse(formData.get('annotations') as string);

    if (!file || !annotations) {
      return NextResponse.json(
        { error: 'File and annotations are required' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const modifiedPdf = await addAnnotationsToPdf(arrayBuffer, annotations);

    return new NextResponse(modifiedPdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="annotated_${file.name}"`,
      },
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}