/**
 * End-to-End tests for critical user flows
 * These tests simulate real user interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThirdwebProvider } from 'thirdweb/react'
import { thirdwebClient } from '@/lib/thirdweb'
import ApeBeatLanding from '@/app/page'

// Mock all external dependencies
jest.mock('thirdweb/react', () => ({
  ...jest.requireActual('thirdweb/react'),
  useActiveAccount: () => null,
  useConnect: () => ({ connect: jest.fn() }),
  useDisconnect: () => ({ disconnect: jest.fn() }),
}))

jest.mock('@/src/stores/userStore', () => ({
  __esModule: true,
  default: () => ({
    email: null,
    setEmail: jest.fn(),
    clearUser: jest.fn(),
  }),
}))

jest.mock('@/lib/utils', () => ({
  fetchApeChainStats: jest.fn().mockResolvedValue({
    blockNumber: BigInt(12345),
    gasPriceWei: BigInt(20000000000),
    blockTimeSeconds: 2,
  }),
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        {children}
      </ThirdwebProvider>
    </QueryClientProvider>
  )
}

describe('Critical User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should complete the main landing page flow', async () => {
    render(
      <TestWrapper>
        <ApeBeatLanding />
      </TestWrapper>
    )

    // 1. User sees the main heading
    expect(screen.getByText(/ApeBeats/i)).toBeInTheDocument()
    expect(screen.getByText(/Sonic Swamp Hub/i)).toBeInTheDocument()

    // 2. User sees the waitlist button
    const waitlistButton = screen.getByText(/join the waitlist/i)
    expect(waitlistButton).toBeInTheDocument()

    // 3. User can navigate to different sections
    const aboutButton = screen.getByText(/about/i)
    fireEvent.click(aboutButton)

    // 4. User sees the features section
    await waitFor(() => {
      expect(screen.getByText(/Enter the Sonic Swamp/i)).toBeInTheDocument()
    })

    // 5. User can scroll to collections
    const collectionsButton = screen.getByText(/collections/i)
    fireEvent.click(collectionsButton)

    await waitFor(() => {
      expect(screen.getByText(/Two Collections/i)).toBeInTheDocument()
    })
  })

  it('should handle video preview interactions', async () => {
    render(
      <TestWrapper>
        <ApeBeatLanding />
      </TestWrapper>
    )

    // Wait for Genesis collection section to load
    await waitFor(() => {
      expect(screen.getByText(/Genesis Collection Preview/i)).toBeInTheDocument()
    })

    // Check that video previews are displayed
    const genesisBadges = screen.getAllByText(/Genesis #/i)
    expect(genesisBadges.length).toBeGreaterThan(0)
  })

  it('should handle theme switching', () => {
    render(
      <TestWrapper>
        <ApeBeatLanding />
      </TestWrapper>
    )

    // Find and click the theme toggle button
    const themeButton = screen.getByLabelText(/switch to light mode/i)
    fireEvent.click(themeButton)

    // Verify theme button text changes
    expect(screen.getByLabelText(/switch to dark mode/i)).toBeInTheDocument()
  })

  it('should handle back to top functionality', async () => {
    render(
      <TestWrapper>
        <ApeBeatLanding />
      </TestWrapper>
    )

    // Scroll down to trigger back to top button
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 1500,
    })
    fireEvent.scroll(window)

    // Check if back to top button appears
    await waitFor(() => {
      const backToTopButton = screen.getByLabelText(/back to top/i)
      expect(backToTopButton).toBeInTheDocument()
    })
  })

  it('should display live ApeChain data', async () => {
    render(
      <TestWrapper>
        <ApeBeatLanding />
      </TestWrapper>
    )

    // Wait for ApeChain stats to load
    await waitFor(() => {
      expect(screen.getByText(/BLOCK/i)).toBeInTheDocument()
      expect(screen.getByText(/GAS/i)).toBeInTheDocument()
      expect(screen.getByText(/BPM/i)).toBeInTheDocument()
    })
  })
})
