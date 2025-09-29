/**
 * Integration tests for wallet connection functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThirdwebProvider } from 'thirdweb/react'
import { thirdwebClient } from '@/lib/thirdweb'
import HeaderUser from '@/components/auth/HeaderUser'
import LoginInline from '@/components/auth/LoginInline'

// Mock thirdweb hooks
const mockConnect = jest.fn()
const mockDisconnect = jest.fn()
const mockAccount = null

jest.mock('thirdweb/react', () => ({
  ...jest.requireActual('thirdweb/react'),
  useActiveAccount: () => mockAccount,
  useConnect: () => ({ connect: mockConnect }),
  useDisconnect: () => ({ disconnect: mockDisconnect }),
}))

// Mock user store
jest.mock('@/src/stores/userStore', () => ({
  __esModule: true,
  default: () => ({
    email: null,
    setEmail: jest.fn(),
    clearUser: jest.fn(),
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

describe('Wallet Connection Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login button when not connected', () => {
    render(
      <TestWrapper>
        <HeaderUser onLoginClick={jest.fn()} />
      </TestWrapper>
    )

    expect(screen.getByText(/connect/i)).toBeInTheDocument()
  })

  it('should open login modal when login button is clicked', async () => {
    const onLoginClick = jest.fn()
    
    render(
      <TestWrapper>
        <HeaderUser onLoginClick={onLoginClick} />
      </TestWrapper>
    )

    const loginButton = screen.getByText(/connect/i)
    fireEvent.click(loginButton)

    expect(onLoginClick).toHaveBeenCalled()
  })

  it('should render login form with email input', () => {
    render(
      <TestWrapper>
        <LoginInline onDone={jest.fn()} />
      </TestWrapper>
    )

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByText(/send code/i)).toBeInTheDocument()
  })

  it('should show wallet connection options', () => {
    render(
      <TestWrapper>
        <LoginInline onDone={jest.fn()} />
      </TestWrapper>
    )

    // Check for wallet connection buttons
    expect(screen.getByText(/metamask/i)).toBeInTheDocument()
    expect(screen.getByText(/walletconnect/i)).toBeInTheDocument()
  })
})
