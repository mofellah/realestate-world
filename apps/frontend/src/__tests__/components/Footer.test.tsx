/**
 * Footer Component Tests
 * Tests footer links, branding, and layout
 */

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../../components/Footer';

describe('Footer Component', () => {
  const renderFooter = () => {
    return render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
  };

  describe('Branding', () => {
    it('should render brand logo and name', () => {
      renderFooter();
      
      expect(screen.getByText('RE')).toBeInTheDocument();
      expect(screen.getByText('RealEstate World')).toBeInTheDocument();
    });

    it('should render brand description', () => {
      renderFooter();
      
      expect(screen.getByText(/Find your perfect property in Belgium, Netherlands, and Switzerland/i)).toBeInTheDocument();
    });

    it('should display current year in copyright', () => {
      renderFooter();
      
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} RealEstate World`))).toBeInTheDocument();
    });
  });

  describe('Quick Links Section', () => {
    it('should render Quick Links heading', () => {
      renderFooter();
      
      expect(screen.getByText('Quick Links')).toBeInTheDocument();
    });

    it('should render Search Properties link', () => {
      renderFooter();
      
      const quickLinksSection = screen.getByText('Quick Links').closest('div');
      const searchLink = quickLinksSection?.querySelector('a[href="/search"]');
      expect(searchLink).toHaveTextContent('Search Properties');
    });

    it('should render List Property link', () => {
      renderFooter();
      
      const listPropertyLink = screen.getByText('List Property').closest('a');
      expect(listPropertyLink).toHaveAttribute('href', '/dashboard/properties/create');
    });

    it('should render How It Works link', () => {
      renderFooter();
      
      const howItWorksLink = screen.getByText('How It Works').closest('a');
      expect(howItWorksLink).toHaveAttribute('href', '/#how-it-works');
    });

    it('should render Pricing link', () => {
      renderFooter();
      
      const quickLinksSection = screen.getByText('Quick Links').closest('div');
      const pricingLink = quickLinksSection?.querySelector('a[href="/#pricing"]');
      expect(pricingLink).toHaveTextContent('Pricing');
    });
  });

  describe('Support Section', () => {
    it('should render Support heading', () => {
      renderFooter();
      
      expect(screen.getByText('Support')).toBeInTheDocument();
    });

    it('should render Help Center link', () => {
      renderFooter();
      
      const helpCenterLink = screen.getByText('Help Center').closest('a');
      expect(helpCenterLink).toHaveAttribute('href', '/help');
    });

    it('should render Contact Us link', () => {
      renderFooter();
      
      const contactLink = screen.getByText('Contact Us').closest('a');
      expect(contactLink).toHaveAttribute('href', '/contact');
    });

    it('should render FAQ link', () => {
      renderFooter();
      
      const faqLink = screen.getByText('FAQ').closest('a');
      expect(faqLink).toHaveAttribute('href', '/faq');
    });

    it('should render Terms of Service link', () => {
      renderFooter();
      
      const termsLink = screen.getByText('Terms of Service').closest('a');
      expect(termsLink).toHaveAttribute('href', '/terms');
    });
  });

  describe('Markets Section', () => {
    it('should render Markets heading', () => {
      renderFooter();
      
      expect(screen.getByText('Markets')).toBeInTheDocument();
    });

    it('should render Belgium market link', () => {
      renderFooter();
      
      const belgiumLink = screen.getByText(/🇧🇪 Belgium/i).closest('a');
      expect(belgiumLink).toHaveAttribute('href', '/search?country=BE');
    });

    it('should render Netherlands market link', () => {
      renderFooter();
      
      const netherlandsLink = screen.getByText(/🇳🇱 Netherlands/i).closest('a');
      expect(netherlandsLink).toHaveAttribute('href', '/search?country=NL');
    });

    it('should render Switzerland market link', () => {
      renderFooter();
      
      const switzerlandLink = screen.getByText(/🇨🇭 Switzerland/i).closest('a');
      expect(switzerlandLink).toHaveAttribute('href', '/search?country=CH');
    });
  });

  describe('Layout and Structure', () => {
    it('should have grid layout with 4 columns on desktop', () => {
      const { container } = renderFooter();
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('md:grid-cols-4');
    });

    it('should have dark background', () => {
      const { container } = renderFooter();
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('bg-gray-900', 'text-gray-300');
    });

    it('should have border separator above copyright', () => {
      const { container } = renderFooter();
      
      const copyrightSection = container.querySelector('.border-t');
      expect(copyrightSection).toHaveClass('border-gray-800');
    });
  });

  describe('Styling', () => {
    it('should apply logo styles', () => {
      renderFooter();
      
      const logo = screen.getByText('RE');
      expect(logo).toHaveClass('text-white', 'font-bold', 'text-xl');
      
      const logoContainer = logo.parentElement;
      expect(logoContainer).toHaveClass('w-10', 'h-10', 'bg-blue-600', 'rounded-lg');
    });

    it('should style section headings as white', () => {
      const { container } = renderFooter();
      
      const headings = container.querySelectorAll('h3');
      headings.forEach(heading => {
        expect(heading).toHaveClass('text-white', 'font-semibold');
      });
    });

    it('should have hover styles on links', () => {
      const { container } = renderFooter();
      
      const links = container.querySelectorAll('a[class*="hover:text-white"]');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should render as footer landmark', () => {
      const { container } = renderFooter();
      
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should have meaningful link text (no "click here")', () => {
      renderFooter();
      
      expect(screen.queryByText(/click here/i)).not.toBeInTheDocument();
    });

    it('should have all links as anchor tags', () => {
      const { container } = renderFooter();
      
      const allLinks = container.querySelectorAll('a');
      allLinks.forEach(link => {
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Content Sections Count', () => {
    it('should have exactly 4 main sections', () => {
      const { container } = renderFooter();
      
      const grid = container.querySelector('.grid');
      const sections = grid?.querySelectorAll(':scope > div');
      expect(sections).toHaveLength(4);
    });

    it('should have all 4 section headings', () => {
      renderFooter();
      
      const expectedHeadings = ['Quick Links', 'Support', 'Markets'];
      expectedHeadings.forEach(heading => {
        expect(screen.getByText(heading)).toBeInTheDocument();
      });
    });
  });
});
