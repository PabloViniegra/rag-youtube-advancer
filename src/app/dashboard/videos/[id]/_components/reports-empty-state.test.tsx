// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  refreshMock,
  regenerateIntelligenceReportMock,
  regenerateSeoReportMock,
  sileoSuccessMock,
  sileoErrorMock,
} = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  regenerateIntelligenceReportMock: vi.fn(),
  regenerateSeoReportMock: vi.fn(),
  sileoSuccessMock: vi.fn(),
  sileoErrorMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}))

vi.mock('../../actions', () => ({
  regenerateIntelligenceReport: (...args: unknown[]) =>
    regenerateIntelligenceReportMock(...args),
  regenerateSeoReport: (...args: unknown[]) => regenerateSeoReportMock(...args),
}))

vi.mock('sileo', () => ({
  sileo: {
    success: sileoSuccessMock,
    error: sileoErrorMock,
  },
  Toaster: () => null,
}))

import { ReportsEmptyState } from './reports-empty-state'

describe('ReportsEmptyState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    regenerateIntelligenceReportMock.mockResolvedValue({ ok: true })
    regenerateSeoReportMock.mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders both report cards and regenerate-all when both are missing', () => {
    render(
      <ReportsEmptyState
        videoId="vid-1"
        hasIntelligence={false}
        hasSeo={false}
      />,
    )

    expect(screen.getByText('Reportes de este video')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Regenerar todo' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('No generado')).toHaveLength(2)
  })

  it('hides regenerate-all when only one report is missing', () => {
    render(
      <ReportsEmptyState
        videoId="vid-1"
        hasIntelligence={true}
        hasSeo={false}
      />,
    )

    expect(
      screen.queryByRole('button', { name: 'Regenerar todo' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Disponible')).toBeInTheDocument()
    expect(screen.getByText('No generado')).toBeInTheDocument()
  })

  it('regenerates single missing report and refreshes on success', async () => {
    const user = userEvent.setup()

    render(
      <ReportsEmptyState
        videoId="vid-77"
        hasIntelligence={false}
        hasSeo={true}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Generar informe' }))

    await waitFor(() => {
      expect(regenerateIntelligenceReportMock).toHaveBeenCalledWith('vid-77')
      expect(sileoSuccessMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Reporte regenerado' }),
      )
      expect(refreshMock).toHaveBeenCalled()
    })
  })

  it('regenerates all and reports partial failure when one action fails', async () => {
    regenerateIntelligenceReportMock.mockResolvedValueOnce({ ok: true })
    regenerateSeoReportMock.mockResolvedValueOnce({
      ok: false,
      error: 'seo failed',
    })

    const user = userEvent.setup()

    render(
      <ReportsEmptyState
        videoId="vid-22"
        hasIntelligence={false}
        hasSeo={false}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Regenerar todo' }))

    await waitFor(() => {
      expect(regenerateIntelligenceReportMock).toHaveBeenCalledWith('vid-22')
      expect(regenerateSeoReportMock).toHaveBeenCalledWith('vid-22')
      expect(sileoErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Regeneración parcial' }),
      )
      expect(refreshMock).toHaveBeenCalled()
    })
  })

  it('regenerates all and shows success when everything succeeds', async () => {
    const user = userEvent.setup()

    render(
      <ReportsEmptyState
        videoId="vid-55"
        hasIntelligence={false}
        hasSeo={false}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Regenerar todo' }))

    await waitFor(() => {
      expect(sileoSuccessMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Reportes regenerados' }),
      )
      expect(refreshMock).toHaveBeenCalled()
    })
  })
})
