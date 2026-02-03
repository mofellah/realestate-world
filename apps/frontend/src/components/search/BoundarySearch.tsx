/**
 * BoundarySearch Component
 * Multi-select autocomplete search for administrative boundaries
 * Displays boundaries as "Name, Type" (e.g., "Brussels, Municipality", "Flanders, State")
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { BoundaryService, BoundarySummary } from "../../services/boundaryService";
import { debounce } from "../../utils/debounce";
import "./BoundarySearch.scss";

interface BoundarySearchProps {
  selectedBoundaries: BoundarySummary[];
  onBoundariesChange: (boundaries: BoundarySummary[]) => void;
  countryCode?: string;
  placeholder?: string;
  maxSelections?: number;
  typeCode?: string; // Optional filter by boundary type (e.g., 'municipality', 'state')
}

export const BoundarySearch: React.FC<BoundarySearchProps> = ({
  selectedBoundaries,
  onBoundariesChange,
  countryCode,
  placeholder = "Search locations...",
  maxSelections = 10,
  typeCode,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<BoundarySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete search
  const searchBoundaries = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await BoundaryService.autocomplete({
          query: searchQuery,
          country_code: countryCode,
          typeCode,
          limit: 10,
        });
        // Filter out already-selected boundaries
        const filteredResults = results.filter(
          (b) => !selectedBoundaries.some((selected) => selected.id === b.id),
        );
        setSuggestions(filteredResults);
      } catch (error) {
        console.error("Failed to fetch boundary suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [countryCode, typeCode, selectedBoundaries],
  );

  useEffect(() => {
    searchBoundaries(query);
  }, [query, searchBoundaries]);

  const handleSelect = (boundary: BoundarySummary) => {
    // Check if already selected
    if (selectedBoundaries.some((b) => b.id === boundary.id)) {
      return;
    }

    // Check max selections
    if (selectedBoundaries.length >= maxSelections) {
      return;
    }

    onBoundariesChange([...selectedBoundaries, boundary]);
    setQuery("");
    setSuggestions([]);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleRemove = (boundaryId: string) => {
    onBoundariesChange(selectedBoundaries.filter((b) => b.id !== boundaryId));
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
      e.preventDefault();
      setSuggestions([]);
      setIsFocused(false);
    } else if (e.key === "Backspace" && query === "" && selectedBoundaries.length > 0) {
      // Remove last boundary on backspace when input is empty
      e.preventDefault();
      const lastBoundary = selectedBoundaries[selectedBoundaries.length - 1];
      handleRemove(lastBoundary.id);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = isFocused && (suggestions.length > 0 || isLoading);

  return (
    <div className="boundary-search">
      {/* Selected Boundaries as Tags */}
      {selectedBoundaries.length > 0 && (
        <div className="boundary-tags">
          {selectedBoundaries.map((boundary) => (
            <div key={boundary.id} className="boundary-tag">
              <span className="boundary-tag__text">
                {BoundaryService.formatBoundaryDisplay(boundary)}
              </span>
              <button
                type="button"
                className="boundary-tag__remove"
                onClick={() => handleRemove(boundary.id)}
                aria-label={`Remove ${boundary.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="boundary-search__input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="boundary-search__input"
          placeholder={
            selectedBoundaries.length >= maxSelections
              ? `Max ${maxSelections} locations selected`
              : placeholder
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          disabled={selectedBoundaries.length >= maxSelections}
        />
        {isLoading && <div className="boundary-search__spinner" />}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div ref={dropdownRef} className="boundary-search__dropdown">
          {isLoading ? (
            <div className="boundary-search__loading">Loading...</div>
          ) : suggestions.length === 0 ? (
            <div className="boundary-search__no-results">No results found</div>
          ) : (
            <ul className="boundary-search__list">
              {suggestions.map((boundary, index) => (
                <li
                  key={boundary.id}
                  className={`boundary-search__item ${
                    index === highlightedIndex ? "boundary-search__item--highlighted" : ""
                  }`}
                  onClick={() => handleSelect(boundary)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="boundary-search__item-main">
                    <span className="boundary-search__item-name">
                      {BoundaryService.formatBoundaryDisplay(boundary)}
                    </span>
                  </div>
                  {boundary.population && (
                    <span className="boundary-search__item-meta">
                      {boundary.population.toLocaleString()} pop
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selection Counter */}
      {maxSelections > 1 && (
        <div className="boundary-search__counter">
          {selectedBoundaries.length} / {maxSelections} selected
        </div>
      )}
    </div>
  );
};
