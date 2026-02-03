/**
 * LocationSearch Component
 * Autocomplete search bar for neighborhoods with chips
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { NeighborhoodService, NeighborhoodSummary } from "../../services/neighborhoodService";
import { debounce } from "../../utils/debounce";

interface LocationSearchProps {
  selectedNeighborhoods: NeighborhoodSummary[];
  onNeighborhoodsChange: (neighborhoods: NeighborhoodSummary[]) => void;
  countryCode?: string;
  placeholder?: string;
  maxSelections?: number;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  selectedNeighborhoods,
  onNeighborhoodsChange,
  countryCode,
  placeholder = "Search neighborhoods...",
  maxSelections = 5,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NeighborhoodSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete search
  const searchNeighborhoods = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await NeighborhoodService.autocomplete({
          query: searchQuery,
          country_code: countryCode,
          limit: 10,
        });
        // Filter out already-selected neighborhoods
        const filteredResults = results.filter(
          (n) => !selectedNeighborhoods.some((selected) => selected.id === n.id),
        );
        setSuggestions(filteredResults);
      } catch (error) {
        console.error("Failed to fetch neighborhood suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [countryCode, selectedNeighborhoods],
  );

  useEffect(() => {
    searchNeighborhoods(query);
  }, [query, searchNeighborhoods]);

  const handleSelect = (neighborhood: NeighborhoodSummary) => {
    // Check if already selected
    if (selectedNeighborhoods.some((n) => n.id === neighborhood.id)) {
      return;
    }

    // Check max selections
    if (selectedNeighborhoods.length >= maxSelections) {
      return;
    }

    onNeighborhoodsChange([...selectedNeighborhoods, neighborhood]);
    setQuery("");
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  const handleRemove = (neighborhoodId: string) => {
    onNeighborhoodsChange(selectedNeighborhoods.filter((n) => n.id !== neighborhoodId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setIsFocused(false);
    }
  };

  return (
    <div className="location-search" data-testid="location-search">
      {/* Selected Neighborhoods (Chips) */}
      {selectedNeighborhoods.length > 0 && (
        <div className="selected-neighborhoods" data-testid="selected-neighborhoods">
          {selectedNeighborhoods.map((neighborhood) => (
            <div
              key={neighborhood.id}
              className="neighborhood-chip"
              data-testid={`chip-${neighborhood.id}`}
            >
              <span className="chip-name">{neighborhood.name}</span>
              <span className="chip-location">
                {neighborhood.cityName}
                {neighborhood.regionName && `, ${neighborhood.regionName}`}
              </span>
              <button
                type="button"
                className="chip-remove"
                onClick={() => handleRemove(neighborhood.id)}
                aria-label={`Remove ${neighborhood.name}`}
                data-testid={`remove-${neighborhood.id}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="search-input-wrapper" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          data-testid="search-input"
          disabled={selectedNeighborhoods.length >= maxSelections}
        />
        {isLoading && (
          <div className="search-spinner" data-testid="loading-spinner">
            Loading...
          </div>
        )}

        {/* Autocomplete Dropdown */}
        {isFocused && suggestions.length > 0 && (
          <div className="suggestions-dropdown" data-testid="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className={`suggestion-item ${index === highlightedIndex ? "highlighted" : ""}`}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                data-testid={`suggestion-${suggestion.id}`}
              >
                <div className="suggestion-name">{suggestion.name}</div>
                <div className="suggestion-location">
                  {suggestion.cityName}
                  {suggestion.regionName && `, ${suggestion.regionName}`} •{" "}
                  {suggestion.country_code}
                </div>
                <div className="suggestion-stats">
                  {suggestion.propertyCount} properties
                  {suggestion.avgPrice && (
                    <span className="avg-price">
                      {" "}
                      • Avg ${(suggestion.avgPrice / 1000).toFixed(0)}k
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {isFocused && query.length >= 2 && !isLoading && suggestions.length === 0 && (
          <div className="no-results" data-testid="no-results">
            No neighborhoods found for "{query}"
          </div>
        )}
      </div>

      {/* Max selections message */}
      {selectedNeighborhoods.length >= maxSelections && (
        <div className="max-selections-message" data-testid="max-selections">
          Maximum {maxSelections} neighborhoods selected
        </div>
      )}
    </div>
  );
};
