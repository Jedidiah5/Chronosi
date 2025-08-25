import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Logo } from './Logo'

describe('Logo Component', () => {
  describe('Default rendering', () => {
    it('renders with default props', () => {
      render(<Logo />)
      
      expect(screen.getByRole('img', { name: 'Chronosi Logo' })).toBeInTheDocument()
      expect(screen.getByText('chronosi')).toBeInTheDocument()
      expect(screen.getByText('AI Powered')).toBeInTheDocument()
    })

    it('renders with medium size by default', () => {
      render(<Logo />)
      
      const mainText = screen.getByText('chronosi')
      expect(mainText).toHaveClass('text-2xl', 'font-bold', 'text-blue-600')
    })

    it('shows subtitle by default', () => {
      render(<Logo />)
      
      const subtitle = screen.getByText('AI Powered')
      expect(subtitle).toBeInTheDocument()
      expect(subtitle).toHaveClass('text-xs', 'text-gray-500', 'font-medium')
    })
  })

  describe('Size variants', () => {
    it('renders small size variant with correct classes', () => {
      render(<Logo size="small" />)
      
      const mainText = screen.getByText('chronosi')
      const subtitle = screen.getByText('AI Powered')
      
      expect(mainText).toHaveClass('text-lg', 'font-bold', 'text-blue-600')
      expect(subtitle).toHaveClass('text-xs', 'text-gray-500', 'font-medium')
    })

    it('renders medium size variant with correct classes', () => {
      render(<Logo size="medium" />)
      
      const mainText = screen.getByText('chronosi')
      const subtitle = screen.getByText('AI Powered')
      
      expect(mainText).toHaveClass('text-2xl', 'font-bold', 'text-blue-600')
      expect(subtitle).toHaveClass('text-xs', 'text-gray-500', 'font-medium')
    })

    it('renders large size variant with correct classes', () => {
      render(<Logo size="large" />)
      
      const mainText = screen.getByText('chronosi')
      const subtitle = screen.getByText('AI Powered')
      
      expect(mainText).toHaveClass('text-3xl', 'font-bold', 'text-blue-600')
      expect(subtitle).toHaveClass('text-sm', 'text-gray-500', 'font-medium')
    })
  })

  describe('showSubtitle prop', () => {
    it('shows subtitle when showSubtitle is true', () => {
      render(<Logo showSubtitle={true} />)
      
      expect(screen.getByText('AI Powered')).toBeInTheDocument()
    })

    it('hides subtitle when showSubtitle is false', () => {
      render(<Logo showSubtitle={false} />)
      
      expect(screen.queryByText('AI Powered')).not.toBeInTheDocument()
      expect(screen.getByText('chronosi')).toBeInTheDocument()
    })

    it('shows subtitle by default when showSubtitle prop is not provided', () => {
      render(<Logo />)
      
      expect(screen.getByText('AI Powered')).toBeInTheDocument()
    })
  })

  describe('Custom className prop', () => {
    it('applies custom className to the container', () => {
      render(<Logo className="custom-class" />)
      
      const container = screen.getByRole('img', { name: 'Chronosi Logo' })
      expect(container).toHaveClass('custom-class')
    })

    it('preserves base classes when custom className is applied', () => {
      render(<Logo className="custom-class" />)
      
      const container = screen.getByRole('img', { name: 'Chronosi Logo' })
      expect(container).toHaveClass('flex', 'flex-col', 'custom-class')
    })

    it('works without custom className', () => {
      render(<Logo />)
      
      const container = screen.getByRole('img', { name: 'Chronosi Logo' })
      expect(container).toHaveClass('flex', 'flex-col')
      expect(container).not.toHaveClass('custom-class')
    })

    it('applies multiple custom classes correctly', () => {
      render(<Logo className="class1 class2 class3" />)
      
      const container = screen.getByRole('img', { name: 'Chronosi Logo' })
      expect(container).toHaveClass('flex', 'flex-col', 'class1', 'class2', 'class3')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA role and label', () => {
      render(<Logo />)
      
      const logoElement = screen.getByRole('img', { name: 'Chronosi Logo' })
      expect(logoElement).toBeInTheDocument()
    })

    it('maintains accessibility attributes with different props', () => {
      render(<Logo size="large" showSubtitle={false} className="custom" />)
      
      const logoElement = screen.getByRole('img', { name: 'Chronosi Logo' })
      expect(logoElement).toBeInTheDocument()
    })
  })

  describe('Content consistency', () => {
    it('displays "chronosi" as main text for small size', () => {
      render(<Logo size="small" />)
      expect(screen.getByText('chronosi')).toBeInTheDocument()
    })

    it('displays "chronosi" as main text for medium size', () => {
      render(<Logo size="medium" />)
      expect(screen.getByText('chronosi')).toBeInTheDocument()
    })

    it('displays "chronosi" as main text for large size', () => {
      render(<Logo size="large" />)
      expect(screen.getByText('chronosi')).toBeInTheDocument()
    })

    it('displays "AI Powered" as subtitle for small size when shown', () => {
      render(<Logo size="small" showSubtitle={true} />)
      expect(screen.getByText('AI Powered')).toBeInTheDocument()
    })

    it('displays "AI Powered" as subtitle for medium size when shown', () => {
      render(<Logo size="medium" showSubtitle={true} />)
      expect(screen.getByText('AI Powered')).toBeInTheDocument()
    })

    it('displays "AI Powered" as subtitle for large size when shown', () => {
      render(<Logo size="large" showSubtitle={true} />)
      expect(screen.getByText('AI Powered')).toBeInTheDocument()
    })
  })
})