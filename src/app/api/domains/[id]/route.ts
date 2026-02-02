import { NextRequest, NextResponse } from 'next/server'
import { dbRepository } from '@/lib/db-repository'
import { UpdatePresetDomainDTO } from '@/lib/types'

// PUT /api/domains/[id] - Update preset domain
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const domainId = parseInt(id, 10)

    if (isNaN(domainId)) {
      return NextResponse.json(
        { error: 'Invalid domain ID' },
        { status: 400 }
      )
    }

    const body: UpdatePresetDomainDTO = await request.json()

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    const updated = await dbRepository.updatePresetDomain(domainId, body.name.trim())

    if (!updated) {
      return NextResponse.json(
        { error: 'Preset domain not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating preset domain:', error)

    // Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Domain name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update preset domain' },
      { status: 500 }
    )
  }
}

// DELETE /api/domains/[id] - Delete preset domain
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const domainId = parseInt(id, 10)

    if (isNaN(domainId)) {
      return NextResponse.json(
        { error: 'Invalid domain ID' },
        { status: 400 }
      )
    }

    // Get domain name first for cascade update
    const domains = await dbRepository.getAllPresetDomains()
    const domain = domains.find(d => d.id === domainId)

    if (!domain) {
      return NextResponse.json(
        { error: 'Preset domain not found' },
        { status: 404 }
      )
    }

    const success = await dbRepository.deletePresetDomain(domainId, domain.name)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete preset domain' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Preset domain deleted successfully',
      id: domainId
    })
  } catch (error) {
    console.error('Error deleting preset domain:', error)
    return NextResponse.json(
      { error: 'Failed to delete preset domain' },
      { status: 500 }
    )
  }
}
