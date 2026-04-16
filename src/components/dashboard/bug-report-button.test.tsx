// @vitest-environment jsdom
/**
 * Tests for BugReportButton component.
 */
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { getFeedbackMock, getClientMock, feedbackIntegrationMock } = vi.hoisted(
  () => ({
    getFeedbackMock: vi.fn(),
    getClientMock: vi.fn(),
    feedbackIntegrationMock: vi.fn(),
  }),
)

vi.mock('@sentry/nextjs', () => ({
  getFeedback: getFeedbackMock,
  getClient: getClientMock,
  feedbackIntegration: feedbackIntegrationMock,
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { BugReportButton } from './bug-report-button'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFeedback() {
  const unsubscribe = vi.fn()
  const form = { appendToDom: vi.fn(), open: vi.fn() }
  return {
    attachTo: vi.fn(() => unsubscribe),
    createForm: vi.fn().mockResolvedValue(form),
    _unsubscribe: unsubscribe,
    _form: form,
  }
}

function makeClient() {
  return { addIntegration: vi.fn() }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('BugReportButton', () => {
  describe('rendering', () => {
    it('renders button with correct label and text', () => {
      getFeedbackMock.mockReturnValue(null)
      getClientMock.mockReturnValue(null)
      render(<BugReportButton />)
      expect(
        screen.getByRole('button', { name: 'Reportar un bug' }),
      ).toBeInTheDocument()
      expect(screen.getByText('Reportar bug')).toBeInTheDocument()
    })

    it('renders in drawer variant with same label', () => {
      getFeedbackMock.mockReturnValue(null)
      getClientMock.mockReturnValue(null)
      render(<BugReportButton variant="drawer" />)
      expect(
        screen.getByRole('button', { name: 'Reportar un bug' }),
      ).toBeInTheDocument()
    })
  })

  describe('mount — attachTo', () => {
    it('calls attachTo on the button when feedback is available', async () => {
      const feedback = makeFeedback()
      getFeedbackMock.mockReturnValue(feedback)
      render(<BugReportButton />)
      await vi.waitFor(() => {
        expect(feedback.attachTo).toHaveBeenCalledWith(
          expect.any(HTMLButtonElement),
        )
      })
    })

    it('adds integration via addIntegration when getFeedback initially returns null', async () => {
      const client = makeClient()
      const feedback = makeFeedback()
      // First call null → triggers addIntegration; second call returns feedback
      getFeedbackMock.mockReturnValueOnce(null).mockReturnValue(feedback)
      getClientMock.mockReturnValue(client)
      render(<BugReportButton />)
      await vi.waitFor(() => {
        expect(client.addIntegration).toHaveBeenCalledOnce()
        expect(feedback.attachTo).toHaveBeenCalledWith(
          expect.any(HTMLButtonElement),
        )
      })
    })

    it('does nothing when no Sentry client is present', () => {
      getFeedbackMock.mockReturnValue(null)
      getClientMock.mockReturnValue(null)
      render(<BugReportButton />)
      expect(
        screen.getByRole('button', { name: 'Reportar un bug' }),
      ).toBeInTheDocument()
    })

    it('calls unsubscribe returned by attachTo on unmount', async () => {
      const feedback = makeFeedback()
      getFeedbackMock.mockReturnValue(feedback)
      const { unmount } = render(<BugReportButton />)
      await vi.waitFor(() => {
        expect(feedback.attachTo).toHaveBeenCalledOnce()
      })
      unmount()
      expect(feedback._unsubscribe).toHaveBeenCalledOnce()
    })
  })

  describe('onClick — opens feedback form', () => {
    it('calls createForm → appendToDom → open when clicked', async () => {
      const user = userEvent.setup()
      const feedback = makeFeedback()
      getFeedbackMock.mockReturnValue(feedback)
      render(<BugReportButton />)
      await user.click(screen.getByRole('button', { name: 'Reportar un bug' }))
      await vi.waitFor(() => {
        expect(feedback.createForm).toHaveBeenCalledOnce()
        expect(feedback._form.appendToDom).toHaveBeenCalledOnce()
        expect(feedback._form.open).toHaveBeenCalledOnce()
      })
    })

    it('does nothing when feedback is null on click', async () => {
      const user = userEvent.setup()
      getFeedbackMock.mockReturnValue(null)
      getClientMock.mockReturnValue(null)
      render(<BugReportButton />)
      await user.click(screen.getByRole('button', { name: 'Reportar un bug' }))
      // No error thrown — component stays mounted
      expect(
        screen.getByRole('button', { name: 'Reportar un bug' }),
      ).toBeInTheDocument()
    })

    it('logs error when createForm rejects', async () => {
      const user = userEvent.setup()
      const feedback = makeFeedback()
      feedback.createForm = vi.fn().mockRejectedValue(new Error('form error'))
      getFeedbackMock.mockReturnValue(feedback)
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      render(<BugReportButton />)
      await user.click(screen.getByRole('button', { name: 'Reportar un bug' }))
      await vi.waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          '[BugReport] createForm error:',
          expect.any(Error),
        )
      })
    })
  })
})
