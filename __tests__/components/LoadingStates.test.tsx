import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  PageSkeleton,
  WalletLoadingState,
  ApeChainDataSkeleton,
  VideoThumbnailSkeleton,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
} from '@/components/LoadingStates'

describe('LoadingStates', () => {
  describe('PageSkeleton', () => {
    it('renders navigation skeleton', () => {
      render(<PageSkeleton />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('renders hero section skeleton', () => {
      render(<PageSkeleton />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('renders features section skeleton', () => {
      render(<PageSkeleton />)
      // Check for multiple skeleton cards
      const cards = screen.getAllByRole('article')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('WalletLoadingState', () => {
    it('renders loading spinner and text', () => {
      render(<WalletLoadingState />)
      expect(screen.getByText('Connecting wallet...')).toBeInTheDocument()
    })
  })

  describe('ApeChainDataSkeleton', () => {
    it('renders 4 skeleton items', () => {
      render(<ApeChainDataSkeleton />)
      // Should have 4 skeleton items for the grid
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('VideoThumbnailSkeleton', () => {
    it('renders video thumbnail skeleton', () => {
      render(<VideoThumbnailSkeleton />)
      const skeleton = document.querySelector('.aspect-square')
      expect(skeleton).toBeInTheDocument()
    })
  })

  describe('CardSkeleton', () => {
    it('renders card skeleton with default styling', () => {
      render(<CardSkeleton />)
      const card = document.querySelector('[role="article"]')
      expect(card).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<CardSkeleton className="custom-class" />)
      const card = document.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })
  })

  describe('ListSkeleton', () => {
    it('renders default 3 skeleton items', () => {
      render(<ListSkeleton />)
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThanOrEqual(3)
    })

    it('renders custom count of skeleton items', () => {
      render(<ListSkeleton count={5} />)
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('TableSkeleton', () => {
    it('renders table skeleton with default dimensions', () => {
      render(<TableSkeleton />)
      const grids = document.querySelectorAll('.grid')
      expect(grids.length).toBeGreaterThan(0)
    })

    it('renders table skeleton with custom dimensions', () => {
      render(<TableSkeleton rows={3} cols={2} />)
      const grids = document.querySelectorAll('.grid')
      expect(grids.length).toBeGreaterThan(0)
    })
  })
})
