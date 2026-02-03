/**
 * BoundarySearchDemo
 * Demo page showcasing multi-select boundary search with user-friendly display
 */

import React, { useState } from "react";
import { BoundarySearch } from "../components/search/BoundarySearch";
import { BoundarySummary, BoundaryService } from "../services/boundaryService";

export default function BoundarySearchDemo() {
  const [selectedBoundaries, setSelectedBoundaries] = useState<BoundarySummary[]>([]);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Multi-Select Boundary Search Demo
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        Search and select multiple cities, municipalities, and regions. Display format: "Brussels,
        Municipality" or "Flanders, State"
      </p>

      <BoundarySearch
        selectedBoundaries={selectedBoundaries}
        onBoundariesChange={setSelectedBoundaries}
        countryCode="BE"
        placeholder="Search Belgian cities, municipalities, regions..."
        maxSelections={10}
      />

      {selectedBoundaries.length > 0 && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            backgroundColor: "#f3f4f6",
            borderRadius: "0.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
            Selected Locations ({selectedBoundaries.length}):
          </h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {selectedBoundaries.map((boundary) => (
              <li
                key={boundary.id}
                style={{
                  padding: "0.75rem",
                  marginBottom: "0.5rem",
                  backgroundColor: "white",
                  borderRadius: "0.375rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}
                >
                  <div>
                    <div
                      style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.25rem" }}
                    >
                      {BoundaryService.formatBoundaryDisplay(boundary)}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {boundary.country_code}
                      {boundary.population &&
                        ` • ${boundary.population.toLocaleString()} residents`}
                      {boundary.area_sqkm && ` • ${boundary.area_sqkm.toFixed(1)} km²`}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                    }}
                  >
                    Level {boundary.boundaryType.level}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#fef3c7",
              borderRadius: "0.375rem",
            }}
          >
            <h3 style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem" }}>
              💡 Boundary IDs (for API calls):
            </h3>
            <code style={{ fontSize: "0.75rem", display: "block", overflowX: "auto" }}>
              {JSON.stringify(
                selectedBoundaries.map((b) => b.id),
                null,
                2,
              )}
            </code>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          backgroundColor: "#eff6ff",
          borderRadius: "0.5rem",
        }}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.75rem" }}>
          Try searching for:
        </h3>
        <ul style={{ listStyle: "disc", paddingLeft: "1.5rem", color: "#1e40af" }}>
          <li>
            <strong>Cities:</strong> Brussels, Antwerp, Ghent, Bruges
          </li>
          <li>
            <strong>Municipalities:</strong> Schaerbeek, Anderlecht, Ixelles
          </li>
          <li>
            <strong>Regions:</strong> Flanders, Wallonia, Brussels Capital
          </li>
          <li>
            <strong>Districts:</strong> Halle-Vilvoorde, Leuven
          </li>
        </ul>
      </div>
    </div>
  );
}
