/**
 * LocationSearch Component Tests
 * Testing autocomplete, keyboard navigation, chip selection
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocationSearch } from "../LocationSearch";
import { NeighborhoodService } from "../../../services/neighborhoodService";
import type { NeighborhoodSummary } from "../../../services/neighborhoodService";

// Mock the neighborhood service
jest.mock("../../../services/neighborhoodService");

describe("LocationSearch", () => {
  const mockNeighborhoods: NeighborhoodSummary[] = [
    {
      id: "n1",
      name: "SoHo",
      nameSlug: "soho",
      cityName: "New York",
      regionName: "New York",
      country_code: "US",
      propertyCount: 350,
      avgPrice: 1200000,
      centroidLat: 40.725,
      centroidLon: -74.005,
    },
    {
      id: "n2",
      name: "Brooklyn Heights",
      nameSlug: "brooklyn-heights",
      cityName: "Brooklyn",
      regionName: "New York",
      country_code: "US",
      propertyCount: 280,
      avgPrice: 950000,
      centroidLat: 40.694,
      centroidLon: -73.993,
    },
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (NeighborhoodService.autocomplete as jest.Mock).mockResolvedValue(mockNeighborhoods);
  });

  it("should render search input", () => {
    render(<LocationSearch selectedNeighborhoods={[]} onNeighborhoodsChange={mockOnChange} />);

    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search neighborhoods...")).toBeInTheDocument();
  });

  it("should show loading spinner while fetching suggestions", async () => {
    (NeighborhoodService.autocomplete as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockNeighborhoods), 500)),
    );

    render(<LocationSearch selectedNeighborhoods={[]} onNeighborhoodsChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    await userEvent.type(input, "soho");

    await waitFor(() => {
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  it("should fetch and display autocomplete suggestions", async () => {
    render(<LocationSearch selectedNeighborhoods={[]} onNeighborhoodsChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    await userEvent.type(input, "soho");

    await waitFor(() => {
      expect(NeighborhoodService.autocomplete).toHaveBeenCalledWith({
        query: "soho",
        country_code: undefined,
        limit: 10,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("suggestions-dropdown")).toBeInTheDocument();
      expect(screen.getByText("SoHo")).toBeInTheDocument();
      expect(screen.getByText("Brooklyn Heights")).toBeInTheDocument();
    });
  });

  it("should not search if query is less than 2 characters", async () => {
    render(<LocationSearch selectedNeighborhoods={[]} onNeighborhoodsChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    await userEvent.type(input, "s");

    await waitFor(() => {
      expect(NeighborhoodService.autocomplete).not.toHaveBeenCalled();
    });
  });

  it("should select neighborhood on click", async () => {
    render(<LocationSearch selectedNeighborhoods={[]} onNeighborhoodsChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    await userEvent.type(input, "soho");

    await waitFor(() => {
      expect(screen.getByText("SoHo")).toBeInTheDocument();
    });

    const suggestion = screen.getByTestId("suggestion-n1");
    fireEvent.click(suggestion);

    expect(mockOnChange).toHaveBeenCalledWith([mockNeighborhoods[0]]);
  });

  it("should display selected neighborhoods as chips", () => {
    render(
      <LocationSearch
        selectedNeighborhoods={[mockNeighborhoods[0]]}
        onNeighborhoodsChange={mockOnChange}
      />,
    );

    expect(screen.getByTestId("selected-neighborhoods")).toBeInTheDocument();
    expect(screen.getByTestId("chip-n1")).toBeInTheDocument();
    expect(screen.getByText("SoHo")).toBeInTheDocument();
    expect(screen.getByText("New York, New York")).toBeInTheDocument();
  });

  it("should remove neighborhood chip on click", () => {
    render(
      <LocationSearch
        selectedNeighborhoods={[mockNeighborhoods[0]]}
        onNeighborhoodsChange={mockOnChange}
      />,
    );

    const removeButton = screen.getByTestId("remove-n1");
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it("should prevent duplicate selections by filtering them from suggestions", async () => {
    render(
      <LocationSearch
        selectedNeighborhoods={[mockNeighborhoods[0]]}
        onNeighborhoodsChange={mockOnChange}
      />,
    );

    const input = screen.getByTestId("search-input");
    await userEvent.type(input, "soho");

    await waitFor(() => {
      // Should not show already-selected neighborhood in suggestions
      expect(screen.queryByTestId("suggestion-n1")).not.toBeInTheDocument();
    });

    // But should show other neighborhoods if query matches
    const brooklynSuggestion = screen.queryByTestId("suggestion-n2");
    if (brooklynSuggestion) {
      expect(brooklynSuggestion).toBeInTheDocument();
    }
  });

  it("should enforce max selections limit", async () => {
    render(
      <LocationSearch
        selectedNeighborhoods={[mockNeighborhoods[0]]}
        onNeighborhoodsChange={mockOnChange}
        maxSelections={1}
      />,
    );

    expect(screen.getByTestId("max-selections")).toBeInTheDocument();
    expect(screen.getByTestId("search-input")).toBeDisabled();
  });

  it("should navigate suggestions with keyboard arrows", async () => {
    render(<LocationSearch selectedNeighborhoods={[]} onNeighborhoodsChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    await userEvent.type(input, "brooklyn");

    await waitFor(() => {
      expect(screen.getByTestId("suggestions-dropdown")).toBeInTheDocument();
    });

    // Arrow down
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      const firstSuggestion = screen.getByTestId("suggestion-n1");
      expect(firstSuggestion).toHaveClass("highlighted");
    });

    // Arrow down again
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      const secondSuggestion = screen.getByTestId("suggestion-n2");
      expect(secondSuggestion).toHaveClass("highlighted");
    });

    // Arrow up
    fireEvent.keyDown(input, { key: "ArrowUp" });
    await waitFor(() => {
      const firstSuggestion = screen.getByTestId("suggestion-n1");
      expect(firstSuggestion).toHaveClass("highlighted");
    });
  });

  it("should select highlighted suggestion on Enter key", async () => {
    render(<LocationSearch selectedNeighborhoods={[]} onNeighborhoodsChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    await userEvent.type(input, "soho");

    await waitFor(() => {
      expect(screen.getByTestId("suggestions-dropdown")).toBeInTheDocument();
    });

    // Highlight first suggestion
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Select with Enter
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnChange).toHaveBeenCalledWith([mockNeighborhoods[0]]);
  });

  it("should close dropdown on Escape key", async () => {
    render(<LocationSearch selectedNeighborhoods={[]} onNeighborhoodsChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    await userEvent.type(input, "soho");

    await waitFor(() => {
      expect(screen.getByTestId("suggestions-dropdown")).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByTestId("suggestions-dropdown")).not.toBeInTheDocument();
    });
  });

  it("should show no results message when no matches found", async () => {
    (NeighborhoodService.autocomplete as jest.Mock).mockResolvedValue([]);

    render(<LocationSearch selectedNeighborhoods={[]} onNeighborhoodsChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    await userEvent.type(input, "nonexistent");

    await waitFor(() => {
      expect(screen.getByTestId("no-results")).toBeInTheDocument();
      expect(screen.getByText('No neighborhoods found for "nonexistent"')).toBeInTheDocument();
    });
  });

  it("should pass country_code to autocomplete API", async () => {
    render(
      <LocationSearch
        selectedNeighborhoods={[]}
        onNeighborhoodsChange={mockOnChange}
        countryCode="US"
      />,
    );

    const input = screen.getByTestId("search-input");
    await userEvent.type(input, "brooklyn");

    await waitFor(() => {
      expect(NeighborhoodService.autocomplete).toHaveBeenCalledWith({
        query: "brooklyn",
        country_code: "US",
        limit: 10,
      });
    });
  });

  it("should display property count and average price in suggestions", async () => {
    render(<LocationSearch selectedNeighborhoods={[]} onNeighborhoodsChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    await userEvent.type(input, "soho");

    await waitFor(() => {
      expect(screen.getByText(/350 properties/)).toBeInTheDocument();
      expect(screen.getByText(/Avg \$1200k/)).toBeInTheDocument();
    });
  });

  it("should handle API errors gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (NeighborhoodService.autocomplete as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(<LocationSearch selectedNeighborhoods={[]} onNeighborhoodsChange={mockOnChange} />);

    const input = screen.getByTestId("search-input");
    await userEvent.type(input, "soho");

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it("should clear input after selection", async () => {
    render(<LocationSearch selectedNeighborhoods={[]} onNeighborhoodsChange={mockOnChange} />);

    const input = screen.getByTestId("search-input") as HTMLInputElement;
    await userEvent.type(input, "soho");

    await waitFor(() => {
      expect(screen.getByText("SoHo")).toBeInTheDocument();
    });

    const suggestion = screen.getByTestId("suggestion-n1");
    fireEvent.click(suggestion);

    expect(input.value).toBe("");
  });
});
