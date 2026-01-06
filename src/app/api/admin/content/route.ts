import { NextRequest, NextResponse } from 'next/server';
import { getSiteContent, saveSiteContent } from '@/lib/site-content';

const allowed = (request: NextRequest) => !!process.env.ADMIN_CONTENT_PASSWORD && request.headers.get('x-admin-password') === process.env.ADMIN_CONTENT_PASSWORD;
export async function GET(request: NextRequest) { if (!allowed(request)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 }); return NextResponse.json(await getSiteContent()); }
export async function PUT(request: NextRequest) { if (!allowed(request)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 }); const content = await request.json(); if (typeof content.about !== 'string' || typeof content.terms !== 'string' || typeof content.shipping !== 'string' || !Array.isArray(content.faq)) return NextResponse.json({ error: 'Invalid content' }, { status: 400 }); await saveSiteContent(content); return NextResponse.json({ ok: true }); }
