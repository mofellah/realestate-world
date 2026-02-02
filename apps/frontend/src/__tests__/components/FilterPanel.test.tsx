/**
 * FilterPanel Component Tests
 * Tests filter controls, state management, and user interactions
 */

import { render, screen, fireEvent } from "@testing-library/react";
import FilterPanel, { PropertyFilters } from "../../components/Map/FilterPanel";

describe("FilterPanel Component", () => {
  const mockOnChange = jest.fn();
  const mockOnApply = jest.fn();

  const defaultFilters: PropertyFilters = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderFilterPanel = (filters: PropertyFilters = defaultFilters) => {
    return render(<FilterPanel filters={filters} onChange={mockOnChange} onApply={mockOnApply} />);
  };

  describe("Rendering", () => {
    it("should render the filter panel heading", () => {
      renderFilterPanel();
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("should render all filter labels", () => {
      renderFilterPanel();

      expect(screen.getByText("Price Range")).toBeInTheDocument();
      expect(screen.getByText("Property Type")).toBeInTheDocument();
      expect(screen.getByText("Bedrooms")).toBeInTheDocument();
      expect(screen.getByText("Bathrooms")).toBeInTheDocument();
      expect(screen.getByText("Proximity Radius")).toBeInTheDocument();
    });

    it("should render Apply Filters button", () => {
      renderFilterPanel();
      expect(screen.getByText("Apply Filters")).toBeInTheDocument();
    });

    it("should render price inputs", () => {
      renderFilterPanel();

      const minInput = screen.getByPlaceholderText("Min");
      const maxInput = screen.getByPlaceholderText("Max");

      expect(minInput).toBeInTheDocument();
      expect(maxInput).toBeInTheDocument();
      expect(minInput).toHaveAttribute("type", "number");
      expect(maxInput).toHaveAttribute("type", "number");
    });
  });

  describe("Price Range Filter", () => {
    it("should display existing priceMin value", () => {
      renderFilterPanel({ priceMin: 100000 });

      const minInput = screen.getByPlaceholderText("Min") as HTMLInputElement;
      expect(minInput.value).toBe("100000");
    });

    it("should display existing priceMax value", () => {
      renderFilterPanel({ priceMax: 500000 });

      const maxInput = screen.getByPlaceholderText("Max") as HTMLInputElement;
      expect(maxInput.value).toBe("500000");
    });

    it("should call onChange when priceMin changes", () => {
      renderFilterPanel();

      const minInput = screen.getByPlaceholderText("Min");
      fireEvent.change(minInput, { target: { value: "200000" } });

      expect(mockOnChange).toHaveBeenCalledWith({ priceMin: 200000 });
    });

    it("should call onChange when priceMax changes", () => {
      renderFilterPanel();

      const maxInput = screen.getByPlaceholderText("Max");
      fireEvent.change(maxInput, { target: { value: "600000" } });

      expect(mockOnChange).toHaveBeenCalledWith({ priceMax: 600000 });
    });

    it("should set priceMin to undefined when input is cleared", () => {
      renderFilterPanel({ priceMin: 100000 });

      const minInput = screen.getByPlaceholderText("Min");
      fireEvent.change(minInput, { target: { value: "" } });

      expect(mockOnChange).toHaveBeenCalledWith({ priceMin: undefined });
    });
  });

  describe("Select Filters", () => {
    it("should render all select dropdowns", () => {
      renderFilterPanel();

      const selects = screen.getAllByRole("combobox");
      expect(selects).toHaveLength(5); // PropertyType, Bedrooms, Bathrooms, Radius, Distance Metric
    });

    it("should handle property type changes", () => {
      renderFilterPanel();

      const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
      const propertyTypeSelect = selects[0]; // First select: Property Type

      fireEvent.change(propertyTypeSelect, { target: { value: "apartment" } });
      expect(mockOnChange).toHaveBeenCalledWith({ type: "apartment" });
    });

    it("should handle bedrooms changes", () => {
      renderFilterPanel();

      const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
      const bedroomsSelect = selects[1]; // Second select: Bedrooms

      fireEvent.change(bedroomsSelect, { target: { value: "3" } });
      expect(mockOnChange).toHaveBeenCalledWith({ bedrooms: 3 });
    });

    it("should handle bathrooms changes", () => {
      renderFilterPanel();

      const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
      const bathroomsSelect = selects[2]; // Third select: Bathrooms

      fireEvent.change(bathroomsSelect, { target: { value: "2" } });
      expect(mockOnChange).toHaveBeenCalledWith({ bathrooms: 2 });
    });

    it("should handle radius changes", () => {
      renderFilterPanel();

      const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
      const radiusSelect = selects[3]; // Fourth select: Radius

      fireEvent.change(radiusSelect, { target: { value: "10" } });
      expect(mockOnChange).toHaveBeenCalledWith({ radius: 10 });
    });

    it("should display existing filter values", () => {
      renderFilterPanel({
        type: "house",
        bedrooms: 3,
        bathrooms: 2,
        radius: 5,
      });

      const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];

      expect(selects[0].value).toBe("house"); // Property Type
      expect(selects[1].value).toBe("3"); // Bedrooms
      expect(selects[2].value).toBe("2"); // Bathrooms
      expect(selects[3].value).toBe("5"); // Radius
    });
  });

  describe("Apply Button", () => {
    it("should call onApply when clicked", () => {
      renderFilterPanel();

      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);

      expect(mockOnApply).toHaveBeenCalledTimes(1);
    });

    it("should have correct styling classes", () => {
      renderFilterPanel();

      const applyButton = screen.getByText("Apply Filters");
      expect(applyButton).toHaveClass("bg-blue-600", "text-white");
    });
  });

  describe("Filter Combinations", () => {
    it("should handle multiple filters simultaneously", () => {
      const filters: PropertyFilters = {
        priceMin: 150000,
        priceMax: 400000,
        type: "apartment",
        bedrooms: 2,
        bathrooms: 1,
        radius: 5,
      };

      renderFilterPanel(filters);

      expect((screen.getByPlaceholderText("Min") as HTMLInputElement).value).toBe("150000");
      expect((screen.getByPlaceholderText("Max") as HTMLInputElement).value).toBe("400000");

      const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
      expect(selects[0].value).toBe("apartment"); // Property Type
      expect(selects[1].value).toBe("2"); // Bedrooms
      expect(selects[2].value).toBe("1"); // Bathrooms
      expect(selects[3].value).toBe("5"); // Radius
    });

    it("should preserve other filters when one changes", () => {
      renderFilterPanel({ priceMin: 100000, type: "house" });

      const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
      fireEvent.change(selects[1], { target: { value: "3" } }); // Change bedrooms (index 1)

      expect(mockOnChange).toHaveBeenCalledWith({
        priceMin: 100000,
        type: "house",
        bedrooms: 3,
      });
    });
  });

  describe("Layout and Styling", () => {
    it("should have white background and shadow", () => {
      const { container } = renderFilterPanel();

      const panel = container.firstChild;
      expect(panel).toHaveClass("bg-white", "rounded-lg", "shadow-md");
    });

    it("should have consistent spacing", () => {
      const { container } = renderFilterPanel();

      const panel = container.firstChild;
      expect(panel).toHaveClass("space-y-4");
    });

    it("should style inputs correctly", () => {
      renderFilterPanel();

      const minInput = screen.getByPlaceholderText("Min");
      expect(minInput).toHaveClass("border", "border-gray-300", "rounded-md");
    });
  });
});
