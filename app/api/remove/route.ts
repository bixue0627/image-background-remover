import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: '请选择图片文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: '仅支持 PNG/JPG 格式' },
        { status: 400 }
      );
    }

    // 验证文件大小 (10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件过大，最大支持 10MB' },
        { status: 400 }
      );
    }

    // Convert to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Get API key from environment
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 未配置' },
        { status: 500 }
      );
    }

    // Call Remove.bg API with FormData
    const removeBgFormData = new FormData();
    removeBgFormData.append('image_file_b64', base64);
    removeBgFormData.append('size', 'auto');
    removeBgFormData.append('format', 'png');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.errors?.[0]?.detail || 'API 调用失败';
      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
    }

    // Return the processed image
    const resultBuffer = await response.arrayBuffer();
    return new NextResponse(resultBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="result.png"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '处理失败' },
      { status: 500 }
    );
  }
}