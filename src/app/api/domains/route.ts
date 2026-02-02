import { NextRequest, NextResponse } from 'next/server'
import { dbRepository } from '@/lib/db-repository'
import { CreatePresetDomainDTO } from '@/lib/types'

// GET /api/domains - List all preset domains
export async function GET() {
  try {
    const domains = await dbRepository.getAllPresetDomains()
    return NextResponse.json(domains)
  } catch (error) {
    console.error('Error fetching preset domains:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preset domains' },
      { status: 500 }
    )
  }
}

// POST /api/domains - Create new preset domain
export async function POST(request: NextRequest) {
  try {
    const body: CreatePresetDomainDTO = await request.json()

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    const newDomain = await dbRepository.createPresetDomain(body.name.trim())

    return NextResponse.json(newDomain, { status: 201 })
  } catch (error: any) {
    console.error('Error creating preset domain:', error)

    // Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Domain name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create preset domain' },
      { status: 500 }
    )
  }
}
