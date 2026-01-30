/**
 * CreateListingPage Component Tests
 * React Testing Library tests for listing creation form
 */

import { render, screen, fireEvent, waitFor, renderWithRouter } from '../test-utils';
import CreateListingPage from '../../pages/dashboard/CreateListingPage';
import { propertiesService } from '../../services/properties-service';
import { listingsService } from '../../services/listings-service';

// Mock services
jest.mock('../../services/properties-service');
jest.mock('../../services/listings-service');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useAuth
const mockUseAuth = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('CreateListingPage', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as const,
    isActive: true,
  };

  const mockProperties = [
    {
      id: 'prop-1',
      type: 'house',
      address: {
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
      },
    },
    {
      id: 'prop-2',
      type: 'apartment',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        country: 'USA',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    (propertiesService.getAllProperties as jest.Mock).mockResolvedValue({
      properties: mockProperties,
    });
    
    // Default mock for listingsService - resolves successfully
    (listingsService.createListing as jest.Mock).mockResolvedValue({
      id: 'listing-1',
      propertyId: 'prop-1',
      type: 'sale',
      status: 'draft',
    });
    
    // Setup useAuth mock to return authenticated user
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false,
    });
  });

  const renderComponent = () => {
    return renderWithRouter(<CreateListingPage />);
  };

  describe('rendering', () => {
    it('should render loading state initially', () => {
      (propertiesService.getAllProperties as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderComponent();

      expect(screen.getByText(/loading properties/i)).toBeInTheDocument();
    });

    it('should render form with property selector after loading', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });

    it('should populate property dropdown with fetched properties', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/house in New York/i)).toBeInTheDocument();
        expect(screen.getByText(/apartment in Los Angeles/i)).toBeInTheDocument();
      });
    });

    it('should render listing type options', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('radio', { name: /sale/i })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: /rent/i })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: /airbnb/i })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: /lease/i })).toBeInTheDocument();
      });
    });

    it('should render status options (draft and published)', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Save as Draft/i)).toBeInTheDocument();
        expect(screen.getByText(/Publish Now/i)).toBeInTheDocument();
      });
    });
  });

  describe('property loading', () => {
    it('should call propertiesService.getAllProperties on mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(propertiesService.getAllProperties).toHaveBeenCalledWith(0, 100);
      });
    });

    it('should display error message when property loading fails', async () => {
      const errorMsg = 'Failed to load properties';
      (propertiesService.getAllProperties as jest.Mock).mockRejectedValueOnce(
        new Error(errorMsg)
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Failed to load your properties/i)).toBeInTheDocument();
      });
    });

    it('should show message when no properties are available', async () => {
      (propertiesService.getAllProperties as jest.Mock).mockResolvedValueOnce({
        properties: [],
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/No properties found/i)).toBeInTheDocument();
      });
    });

    it('should provide link to create property when none exist', async () => {
      (propertiesService.getAllProperties as jest.Mock).mockResolvedValueOnce({
        properties: [],
      });

      renderComponent();

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /Create a property first/i });
        expect(link).toHaveAttribute('href', '/dashboard/create-property');
      });
    });
  });

  describe('form submission', () => {
    it('should call listingsService.createListing with form data', async () => {
      const mockCreatedListing = {
        id: 'listing-1',
        propertyId: 'prop-1',
        type: 'sale',
        status: 'draft',
      };

      (listingsService.createListing as jest.Mock).mockResolvedValueOnce(
        mockCreatedListing
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      // Select property
      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'prop-1' },
      });

      // Select listing type
      fireEvent.click(screen.getByRole('radio', { name: /sale/i }));

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(listingsService.createListing).toHaveBeenCalledWith(
          expect.objectContaining({
            propertyId: 'prop-1',
            type: 'sale',
            status: 'draft',
          })
        );
      });
    });

    it('should show loading state while submitting', async () => {
      (listingsService.createListing as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'prop-1' },
      });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should navigate to my-listings on successful submission', async () => {
      const mockCreatedListing = {
        id: 'listing-1',
        propertyId: 'prop-1',
      };

      (listingsService.createListing as jest.Mock).mockResolvedValueOnce(
        mockCreatedListing
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'prop-1' },
      });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/my-listings');
      });
    });
  });

  describe('error handling', () => {
    it.skip('should display error message when submission fails', async () => {
      const errorMessage = 'Failed to create listing';
      (listingsService.createListing as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'prop-1' },
      });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it.skip('should show error when user is not authenticated', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/You must be logged in to create a listing/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should not navigate on error', async () => {
      (listingsService.createListing as jest.Mock).mockClear();
      (listingsService.createListing as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'prop-1' },
      });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/API Error/i)).toBeInTheDocument();
      }, { timeout: 2000 });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('form interactions', () => {
    it('should display listing summary when property is selected', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'prop-1' },
      });

      await waitFor(() => {
        expect(screen.getByText(/Listing Summary/i)).toBeInTheDocument();
      });
    });
  });
});
