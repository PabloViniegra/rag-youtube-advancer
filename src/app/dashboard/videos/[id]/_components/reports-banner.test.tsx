// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  refreshMock,
  replaceMock,
  regenerateIntelligenceReportMock,
  regenerateSeoReportMock,
  sileoSuccessMock,
  sileoErrorMock,
} = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  replaceMock: vi.fn(),
  regenerateIntelligenceReportMock: vi.fn(),
  regenerateSeoReportMock: vi.fn(),
  sileoSuccessMock: vi.fn(),
  sileoErrorMock: vi.fn(),
}))

let currentSearchParams = new URLSearchParams('')

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: refreshMock,
    replace: replaceMock,
  }),
  useSearchParams: () => ({
    get: (key: string) => currentSearchParams.get(key),
    toString: () => currentSearchParams.toString(),
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

import { ReportsBanner } from './reports-banner'

describe('ReportsBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentSearchParams = new URLSearchParams('')
    regenerateIntelligenceReportMock.mockResolvedValue({ ok: true })
    regenerateSeoReportMock.mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    cleanup()
  })

  it('does not render when fromIngest is missing', () => {
    render(
      <ReportsBanner videoId="vid-1" hasIntelligence={false} hasSeo={false} />,
    )

    expect(
      screen.queryByText(/Video indexado correctamente/i),
    ).not.toBeInTheDocument()
  })

  it('renders warning copy when fromIngest=1 and missing=both', () => {
    currentSearchParams = new URLSearchParams('fromIngest=1&missing=both')

    render(
      <ReportsBanner videoId="vid-1" hasIntelligence={false} hasSeo={false} />,
    )

    expect(
      screen.getByText(/faltan Informe de Inteligencia y SEO Pack/i),
    ).toBeInTheDocument()
  })

  it('clears query params on Cerrar', async () => {
    currentSearchParams = new URLSearchParams('fromIngest=1&missing=seo')
    const user = userEvent.setup()

    render(
      <ReportsBanner videoId="vid-2" hasIntelligence={true} hasSeo={false} />,
    )

    await user.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(replaceMock).toHaveBeenCalledWith('/dashboard/videos/vid-2')
  })

  it('regenerates missing reports and refreshes on success', async () => {
    currentSearchParams = new URLSearchParams('fromIngest=1&missing=both')
    const user = userEvent.setup()

    render(
      <ReportsBanner videoId="vid-10" hasIntelligence={false} hasSeo={false} />,
    )

    await user.click(screen.getByRole('button', { name: 'Regenerar ahora' }))

    await waitFor(() => {
      expect(regenerateIntelligenceReportMock).toHaveBeenCalledWith('vid-10')
      expect(regenerateSeoReportMock).toHaveBeenCalledWith('vid-10')
      expect(sileoSuccessMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Reportes regenerados' }),
      )
      expect(refreshMock).toHaveBeenCalled()
      expect(replaceMock).toHaveBeenCalledWith('/dashboard/videos/vid-10')
    })
  })

  it('shows partial failure when one report regeneration fails', async () => {
    currentSearchParams = new URLSearchParams('fromIngest=1&missing=both')
    regenerateSeoReportMock.mockResolvedValueOnce({ ok: false, error: 'fail' })
    const user = userEvent.setup()

    render(
      <ReportsBanner videoId="vid-11" hasIntelligence={false} hasSeo={false} />,
    )

    await user.click(screen.getByRole('button', { name: 'Regenerar ahora' }))

    await waitFor(() => {
      expect(sileoErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Regeneración parcial' }),
      )
      expect(refreshMock).toHaveBeenCalled()
      expect(replaceMock).toHaveBeenCalledWith('/dashboard/videos/vid-11')
    })
  })
})
