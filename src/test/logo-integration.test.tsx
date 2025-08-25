import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { Header } from '../components/Header'
import { LoginPage } from '../components/LoginPage'
import { SignupPage } from '../components/SignupPage'
import { Logo } from '../components/Logo'
import { AuthProvider } from '../contexts/AuthContext'

// Mock the AuthContext to avoid API calls during testing
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
}

// Mock the useAuth hook
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext')
  return {
    ...actual,
    useAuth: () => mockAuthContext,
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

// Helper function to render components with necessary providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Logo Integration Tests - Consistency Across Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Logo Component Usage Verification', () => {
    it('Header component uses Logo component', () => {
      renderWithProviders(<Header />)
      
      // Verify Logo component is rendered in Header
      expect(screen.getByRole('img', { name: 'Chronosi Logo' })).toBeInTheDocument()
      expect(screen.getByText('chronosi')).toBeInTheDocument()
      expect(screen.getByText('AI Powered')).toBeInTheDocument()
    })

    it('LoginPage component uses Logo component', () => {
      renderWithProviders(<LoginPage />)
      
      // Verify Logo component is rendered in LoginPage
      expect(screen.getByRole('img', { name: 'Chronosi Logo' })).toBeInTheDocument()
      expect(screen.getByText('chronosi')).toBeInTheDocument()
      expect(screen.getByText('AI Powered')).toBeInTheDocument()
    })

    it('SignupPage component uses Logo component', () => {
      renderWithProviders(<SignupPage />)
      
      // Verify Logo component is rendered in SignupPage
      expect(screen.getByRole('img', { name: 'Chronosi Logo' })).toBeInTheDocument()
      expect(screen.getByText('chronosi')).toBeInTheDocument()
      expect(screen.getByText('AI Powered')).toBeInTheDocument()
    })
  })

  describe('Visual Consistency Verification', () => {
    it('Header uses medium size Logo variant', () => {
      renderWithProviders(<Header />)
      
      const mainText = screen.getByText('chronosi')
      const subtitle = screen.getByText('AI Powered')
      
      // Verify medium size classes
      expect(mainText).toHaveClass('text-2xl', 'font-bold', 'text-blue-600')
      expect(subtitle).toHaveClass('text-xs', 'text-gray-500', 'font-medium')
    })

    it('LoginPage uses large size Logo variant', () => {
      renderWithProviders(<LoginPage />)
      
      const mainText = screen.getByText('chronosi')
      const subtitle = screen.getByText('AI Powered')
      
      // Verify large size classes
      expect(mainText).toHaveClass('text-3xl', 'font-bold', 'text-blue-600')
      expect(subtitle).toHaveClass('text-sm', 'text-gray-500', 'font-medium')
    })

    it('SignupPage uses large size Logo variant', () => {
      renderWithProviders(<SignupPage />)
      
      const mainText = screen.getByText('chronosi')
      const subtitle = screen.getByText('AI Powered')
      
      // Verify large size classes
      expect(mainText).toHaveClass('text-3xl', 'font-bold', 'text-blue-600')
      expect(subtitle).toHaveClass('text-sm', 'text-gray-500', 'font-medium')
    })
  })

  describe('Content Consistency Verification', () => {
    it('all pages display consistent main text "chronosi"', () => {
      // Test Header
      const { unmount: unmountHeader } = renderWithProviders(<Header />)
      expect(screen.getByText('chronosi')).toBeInTheDocument()
      unmountHeader()

      // Test LoginPage
      const { unmount: unmountLogin } = renderWithProviders(<LoginPage />)
      expect(screen.getByText('chronosi')).toBeInTheDocument()
      unmountLogin()

      // Test SignupPage
      renderWithProviders(<SignupPage />)
      expect(screen.getByText('chronosi')).toBeInTheDocument()
    })

    it('all pages display consistent subtitle "AI Powered"', () => {
      // Test Header
      const { unmount: unmountHeader } = renderWithProviders(<Header />)
      expect(screen.getByText('AI Powered')).toBeInTheDocument()
      unmountHeader()

      // Test LoginPage
      const { unmount: unmountLogin } = renderWithProviders(<LoginPage />)
      expect(screen.getByText('AI Powered')).toBeInTheDocument()
      unmountLogin()

      // Test SignupPage
      renderWithProviders(<SignupPage />)
      expect(screen.getByText('AI Powered')).toBeInTheDocument()
    })

    it('all pages use consistent color scheme for logo text', () => {
      // Test Header
      const { unmount: unmountHeader } = renderWithProviders(<Header />)
      let mainText = screen.getByText('chronosi')
      let subtitle = screen.getByText('AI Powered')
      expect(mainText).toHaveClass('text-blue-600')
      expect(subtitle).toHaveClass('text-gray-500')
      unmountHeader()

      // Test LoginPage
      const { unmount: unmountLogin } = renderWithProviders(<LoginPage />)
      mainText = screen.getByText('chronosi')
      subtitle = screen.getByText('AI Powered')
      expect(mainText).toHaveClass('text-blue-600')
      expect(subtitle).toHaveClass('text-gray-500')
      unmountLogin()

      // Test SignupPage
      renderWithProviders(<SignupPage />)
      mainText = screen.getByText('chronosi')
      subtitle = screen.getByText('AI Powered')
      expect(mainText).toHaveClass('text-blue-600')
      expect(subtitle).toHaveClass('text-gray-500')
    })
  })

  describe('Accessibility Consistency Verification', () => {
    it('all pages have consistent ARIA labels for logo', () => {
      // Test Header
      const { unmount: unmountHeader } = renderWithProviders(<Header />)
      expect(screen.getByRole('img', { name: 'Chronosi Logo' })).toBeInTheDocument()
      unmountHeader()

      // Test LoginPage
      const { unmount: unmountLogin } = renderWithProviders(<LoginPage />)
      expect(screen.getByRole('img', { name: 'Chronosi Logo' })).toBeInTheDocument()
      unmountLogin()

      // Test SignupPage
      renderWithProviders(<SignupPage />)
      expect(screen.getByRole('img', { name: 'Chronosi Logo' })).toBeInTheDocument()
    })

    it('all pages maintain semantic structure for logo', () => {
      // Test Header
      const { unmount: unmountHeader } = renderWithProviders(<Header />)
      let logoContainer = screen.getByRole('img', { name: 'Chronosi Logo' })
      expect(logoContainer).toHaveClass('flex', 'flex-col')
      unmountHeader()

      // Test LoginPage
      const { unmount: unmountLogin } = renderWithProviders(<LoginPage />)
      logoContainer = screen.getByRole('img', { name: 'Chronosi Logo' })
      expect(logoContainer).toHaveClass('flex', 'flex-col')
      unmountLogin()

      // Test SignupPage
      renderWithProviders(<SignupPage />)
      logoContainer = screen.getByRole('img', { name: 'Chronosi Logo' })
      expect(logoContainer).toHaveClass('flex', 'flex-col')
    })
  })

  describe('Size Variant Consistency', () => {
    it('verifies correct size variants are used across different contexts', () => {
      // Create a comparison object to track expected sizes
      const expectedSizes = {
        header: 'medium',
        login: 'large',
        signup: 'large'
      }

      // Test Header (medium size)
      const { unmount: unmountHeader } = renderWithProviders(<Header />)
      let mainText = screen.getByText('chronosi')
      expect(mainText).toHaveClass('text-2xl') // medium size
      unmountHeader()

      // Test LoginPage (large size)
      const { unmount: unmountLogin } = renderWithProviders(<LoginPage />)
      mainText = screen.getByText('chronosi')
      expect(mainText).toHaveClass('text-3xl') // large size
      unmountLogin()

      // Test SignupPage (large size)
      renderWithProviders(<SignupPage />)
      mainText = screen.getByText('chronosi')
      expect(mainText).toHaveClass('text-3xl') // large size
    })

    it('verifies subtitle sizes match main text sizes appropriately', () => {
      // Test Header (medium main = xs subtitle)
      const { unmount: unmountHeader } = renderWithProviders(<Header />)
      let subtitle = screen.getByText('AI Powered')
      expect(subtitle).toHaveClass('text-xs')
      unmountHeader()

      // Test LoginPage (large main = sm subtitle)
      const { unmount: unmountLogin } = renderWithProviders(<LoginPage />)
      subtitle = screen.getByText('AI Powered')
      expect(subtitle).toHaveClass('text-sm')
      unmountLogin()

      // Test SignupPage (large main = sm subtitle)
      renderWithProviders(<SignupPage />)
      subtitle = screen.getByText('AI Powered')
      expect(subtitle).toHaveClass('text-sm')
    })
  })

  describe('Logo Component Integration', () => {
    it('ensures all pages import and use the same Logo component', () => {
      // This test verifies that the Logo component is consistently used
      // by checking that all pages render the same component structure
      
      const pages = [
        { name: 'Header', component: <Header /> },
        { name: 'LoginPage', component: <LoginPage /> },
        { name: 'SignupPage', component: <SignupPage /> }
      ]

      pages.forEach(({ name, component }) => {
        const { unmount } = renderWithProviders(component)
        
        // Verify the Logo component's distinctive structure is present
        const logoContainer = screen.getByRole('img', { name: 'Chronosi Logo' })
        expect(logoContainer).toBeInTheDocument()
        
        // Verify the flex layout structure that's unique to our Logo component
        expect(logoContainer).toHaveClass('flex', 'flex-col')
        
        // Verify both text elements are present
        expect(screen.getByText('chronosi')).toBeInTheDocument()
        expect(screen.getByText('AI Powered')).toBeInTheDocument()
        
        unmount()
      })
    })

    it('verifies Logo component props are correctly applied in each context', () => {
      // Test that each page uses appropriate props for their context
      
      // Header should use medium size (default)
      const { unmount: unmountHeader } = renderWithProviders(<Header />)
      let logoContainer = screen.getByRole('img', { name: 'Chronosi Logo' })
      let mainText = screen.getByText('chronosi')
      expect(mainText).toHaveClass('text-2xl') // medium size
      expect(screen.getByText('AI Powered')).toBeInTheDocument() // subtitle shown by default
      unmountHeader()

      // LoginPage should use large size
      const { unmount: unmountLogin } = renderWithProviders(<LoginPage />)
      logoContainer = screen.getByRole('img', { name: 'Chronosi Logo' })
      mainText = screen.getByText('chronosi')
      expect(mainText).toHaveClass('text-3xl') // large size
      expect(screen.getByText('AI Powered')).toBeInTheDocument() // subtitle shown
      unmountLogin()

      // SignupPage should use large size
      renderWithProviders(<SignupPage />)
      logoContainer = screen.getByRole('img', { name: 'Chronosi Logo' })
      mainText = screen.getByText('chronosi')
      expect(mainText).toHaveClass('text-3xl') // large size
      expect(screen.getByText('AI Powered')).toBeInTheDocument() // subtitle shown
    })
  })
})
describe(
'Responsive Behavior Tests', () => {
  // Mock window.matchMedia for responsive testing
  const mockMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  }

  describe('Mobile Responsive Behavior', () => {
    beforeEach(() => {
      // Mock mobile viewport
      mockMatchMedia(true) // matches mobile media query
    })

    it('Header logo maintains consistency on mobile screens', () => {
      renderWithProviders(<Header />)
      
      const mainText = screen.getByText('chronosi')
      const subtitle = screen.getByText('AI Powered')
      
      // Logo should still use medium size on mobile
      expect(mainText).toHaveClass('text-2xl', 'font-bold', 'text-blue-600')
      expect(subtitle).toHaveClass('text-xs', 'text-gray-500', 'font-medium')
    })

    it('LoginPage logo maintains consistency on mobile screens', () => {
      renderWithProviders(<LoginPage />)
      
      const mainText = screen.getByText('chronosi')
      const subtitle = screen.getByText('AI Powered')
      
      // Logo should still use large size on mobile
      expect(mainText).toHaveClass('text-3xl', 'font-bold', 'text-blue-600')
      expect(subtitle).toHaveClass('text-sm', 'text-gray-500', 'font-medium')
    })

    it('SignupPage logo maintains consistency on mobile screens', () => {
      renderWithProviders(<SignupPage />)
      
      const mainText = screen.getByText('chronosi')
      const subtitle = screen.getByText('AI Powered')
      
      // Logo should still use large size on mobile
      expect(mainText).toHaveClass('text-3xl', 'font-bold', 'text-blue-600')
      expect(subtitle).toHaveClass('text-sm', 'text-gray-500', 'font-medium')
    })
  })

  describe('Desktop Responsive Behavior', () => {
    beforeEach(() => {
      // Mock desktop viewport
      mockMatchMedia(false) // doesn't match mobile media query
    })

    it('Header logo maintains consistency on desktop screens', () => {
      renderWithProviders(<Header />)
      
      const mainText = screen.getByText('chronosi')
      const subtitle = screen.getByText('AI Powered')
      
      // Logo should use medium size on desktop
      expect(mainText).toHaveClass('text-2xl', 'font-bold', 'text-blue-600')
      expect(subtitle).toHaveClass('text-xs', 'text-gray-500', 'font-medium')
    })

    it('LoginPage logo maintains consistency on desktop screens', () => {
      renderWithProviders(<LoginPage />)
      
      const mainText = screen.getByText('chronosi')
      const subtitle = screen.getByText('AI Powered')
      
      // Logo should use large size on desktop
      expect(mainText).toHaveClass('text-3xl', 'font-bold', 'text-blue-600')
      expect(subtitle).toHaveClass('text-sm', 'text-gray-500', 'font-medium')
    })

    it('SignupPage logo maintains consistency on desktop screens', () => {
      renderWithProviders(<SignupPage />)
      
      const mainText = screen.getByText('chronosi')
      const subtitle = screen.getByText('AI Powered')
      
      // Logo should use large size on desktop
      expect(mainText).toHaveClass('text-3xl', 'font-bold', 'text-blue-600')
      expect(subtitle).toHaveClass('text-sm', 'text-gray-500', 'font-medium')
    })
  })

  describe('Cross-Screen Size Consistency', () => {
    it('verifies logo content remains identical across different screen sizes', () => {
      const testScreenSizes = [
        { name: 'mobile', matches: true },
        { name: 'desktop', matches: false }
      ]

      testScreenSizes.forEach(({ name, matches }) => {
        mockMatchMedia(matches)

        // Test each page at this screen size
        const pages = [
          { name: 'Header', component: <Header /> },
          { name: 'LoginPage', component: <LoginPage /> },
          { name: 'SignupPage', component: <SignupPage /> }
        ]

        pages.forEach(({ name: pageName, component }) => {
          const { unmount } = renderWithProviders(component)
          
          // Content should be identical regardless of screen size
          expect(screen.getByText('chronosi')).toBeInTheDocument()
          expect(screen.getByText('AI Powered')).toBeInTheDocument()
          expect(screen.getByRole('img', { name: 'Chronosi Logo' })).toBeInTheDocument()
          
          unmount()
        })
      })
    })

    it('verifies logo accessibility remains consistent across screen sizes', () => {
      const testScreenSizes = [
        { name: 'mobile', matches: true },
        { name: 'desktop', matches: false }
      ]

      testScreenSizes.forEach(({ name, matches }) => {
        mockMatchMedia(matches)

        // Test Header
        const { unmount: unmountHeader } = renderWithProviders(<Header />)
        let logoElement = screen.getByRole('img', { name: 'Chronosi Logo' })
        expect(logoElement).toHaveAttribute('role', 'img')
        expect(logoElement).toHaveAttribute('aria-label', 'Chronosi Logo')
        unmountHeader()

        // Test LoginPage
        const { unmount: unmountLogin } = renderWithProviders(<LoginPage />)
        logoElement = screen.getByRole('img', { name: 'Chronosi Logo' })
        expect(logoElement).toHaveAttribute('role', 'img')
        expect(logoElement).toHaveAttribute('aria-label', 'Chronosi Logo')
        unmountLogin()

        // Test SignupPage
        const { unmount: unmountSignup } = renderWithProviders(<SignupPage />)
        logoElement = screen.getByRole('img', { name: 'Chronosi Logo' })
        expect(logoElement).toHaveAttribute('role', 'img')
        expect(logoElement).toHaveAttribute('aria-label', 'Chronosi Logo')
        unmountSignup()
      })
    })
  })
})

describe('Logo Standardization Compliance', () => {
  describe('Requirements Verification', () => {
    it('satisfies Requirement 3.1: uses single reusable Logo component', () => {
      // Verify that all pages use the same Logo component by checking
      // for the distinctive structure and attributes
      const pages = [
        { name: 'Header', component: <Header /> },
        { name: 'LoginPage', component: <LoginPage /> },
        { name: 'SignupPage', component: <SignupPage /> }
      ]

      pages.forEach(({ name, component }) => {
        const { unmount } = renderWithProviders(component)
        
        // Check for Logo component's unique attributes
        const logoContainer = screen.getByRole('img', { name: 'Chronosi Logo' })
        expect(logoContainer).toHaveClass('flex', 'flex-col')
        
        // Verify the component structure matches Logo component
        expect(screen.getByText('chronosi')).toBeInTheDocument()
        expect(screen.getByText('AI Powered')).toBeInTheDocument()
        
        unmount()
      })
    })

    it('satisfies Requirement 3.2: supports different size variants', () => {
      // Verify Header uses medium size
      const { unmount: unmountHeader } = renderWithProviders(<Header />)
      let mainText = screen.getByText('chronosi')
      expect(mainText).toHaveClass('text-2xl') // medium size
      unmountHeader()

      // Verify LoginPage uses large size
      const { unmount: unmountLogin } = renderWithProviders(<LoginPage />)
      mainText = screen.getByText('chronosi')
      expect(mainText).toHaveClass('text-3xl') // large size
      unmountLogin()

      // Verify SignupPage uses large size
      renderWithProviders(<SignupPage />)
      mainText = screen.getByText('chronosi')
      expect(mainText).toHaveClass('text-3xl') // large size
    })

    it('satisfies Requirement 3.4: maintains consistent typography, colors, and spacing', () => {
      const pages = [
        { name: 'Header', component: <Header /> },
        { name: 'LoginPage', component: <LoginPage /> },
        { name: 'SignupPage', component: <SignupPage /> }
      ]

      pages.forEach(({ name, component }) => {
        const { unmount } = renderWithProviders(component)
        
        const mainText = screen.getByText('chronosi')
        const subtitle = screen.getByText('AI Powered')
        
        // Consistent typography (font-bold for main text, font-medium for subtitle)
        expect(mainText).toHaveClass('font-bold')
        expect(subtitle).toHaveClass('font-medium')
        
        // Consistent colors
        expect(mainText).toHaveClass('text-blue-600')
        expect(subtitle).toHaveClass('text-gray-500')
        
        // Consistent spacing (flex-col layout)
        const logoContainer = screen.getByRole('img', { name: 'Chronosi Logo' })
        expect(logoContainer).toHaveClass('flex', 'flex-col')
        
        unmount()
      })
    })
  })

  describe('Design Compliance Verification', () => {
    it('verifies text-only logo approach is implemented consistently', () => {
      const pages = [
        { name: 'Header', component: <Header /> },
        { name: 'LoginPage', component: <LoginPage /> },
        { name: 'SignupPage', component: <SignupPage /> }
      ]

      pages.forEach(({ name, component }) => {
        const { unmount } = renderWithProviders(component)
        
        // Should only contain text elements, no icon elements
        expect(screen.getByText('chronosi')).toBeInTheDocument()
        expect(screen.getByText('AI Powered')).toBeInTheDocument()
        
        // Should not contain any Brain icon or other icon elements in logo area
        const logoContainer = screen.getByRole('img', { name: 'Chronosi Logo' })
        const svgElements = logoContainer.querySelectorAll('svg')
        expect(svgElements).toHaveLength(0) // No SVG icons in logo
        
        unmount()
      })
    })

    it('verifies component-based architecture is properly implemented', () => {
      // This test ensures that changes to the Logo component would affect all pages
      // by verifying they all use the same component structure
      
      const pages = [
        { name: 'Header', component: <Header /> },
        { name: 'LoginPage', component: <LoginPage /> },
        { name: 'SignupPage', component: <SignupPage /> }
      ]

      const logoStructures: Array<{ mainTextClasses: string[], subtitleClasses: string[] }> = []

      pages.forEach(({ name, component }) => {
        const { unmount } = renderWithProviders(component)
        
        const mainText = screen.getByText('chronosi')
        const subtitle = screen.getByText('AI Powered')
        
        // Collect the class structures to verify they follow the same pattern
        const mainTextClasses = Array.from(mainText.classList).sort()
        const subtitleClasses = Array.from(subtitle.classList).sort()
        
        logoStructures.push({ mainTextClasses, subtitleClasses })
        
        unmount()
      })

      // Verify all logos follow the same base structure patterns
      logoStructures.forEach((structure) => {
        // All should have font-bold for main text
        expect(structure.mainTextClasses).toContain('font-bold')
        expect(structure.mainTextClasses).toContain('text-blue-600')
        
        // All should have font-medium for subtitle
        expect(structure.subtitleClasses).toContain('font-medium')
        expect(structure.subtitleClasses).toContain('text-gray-500')
      })
    })
  })
})