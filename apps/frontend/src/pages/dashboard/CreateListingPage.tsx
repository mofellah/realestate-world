import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { propertiesService } from "../../services/properties-service";
import { listingsService } from "../../services/listings-service";
import { useAuth } from "../../contexts/AuthContext";

interface Property {
  id: string;
  type: string;
  address: {
    street?: string;
    city: string;
    country: string;
  };
}

interface ListingFormData {
  propertyId: string;
  type: "sale" | "rent" | "airbnb" | "lease";
  status: "draft" | "published";
}

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<ListingFormData>({
    propertyId: "",
    type: "sale",
    status: "draft",
  });

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await propertiesService.getAllProperties(0, 100);
        setProperties(data.properties || []);
      } catch (err) {
        console.error("[CreateListing] Failed to load properties:", err);
        setError("Failed to load your properties");
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handleSubmit = async (e?: React.FormEvent, statusOverride?: "draft" | "published") => {
    e?.preventDefault();

    if (!user) {
      setError("You must be logged in to create a listing");
      return;
    }

    if (!formData.propertyId) {
      setError("Please select a property");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const submissionData = statusOverride ? { ...formData, status: statusOverride } : formData;
      await listingsService.createListing(submissionData);

      setSuccess("Listing created successfully!");
      setTimeout(() => {
        navigate("/dashboard/my-listings");
      }, 1500);
    } catch (err) {
      console.error("[CreateListing] Error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to create listing";
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<ListingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading properties...</p>
      </div>
    );
  }

  return (
    <div data-testid="create-listing-form" className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Listing</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {success && (
          <div
            data-testid="success-toast"
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <p className="text-green-700 font-semibold">Success</p>
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div data-testid="error-toast" className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-semibold">Error</p>
            <p data-testid="error-message" className="text-red-600 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Select Property */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Property *</label>
          <select
            value={formData.propertyId}
            onChange={(e) => updateFormData({ propertyId: e.target.value })}
            required
            disabled={properties.length === 0}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="">Choose a property...</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.type} in {property.address.city}, {property.address.country}
              </option>
            ))}
          </select>
          {properties.length === 0 && (
            <p className="text-sm text-gray-600 mt-2">
              No properties found.{" "}
              <a href="/dashboard/create-property" className="text-blue-600 hover:underline">
                Create a property first
              </a>
            </p>
          )}
        </div>

        {/* Listing Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type *</label>
          <select
            data-testid="listing-type-select"
            value={formData.type}
            onChange={(e) => updateFormData({ type: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
            <option value="airbnb">Airbnb</option>
            <option value="lease">Lease</option>
          </select>
        </div>

        {/* Price Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
          <input
            data-testid="listing-price-input"
            type="number"
            placeholder="Enter price"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Publish Status *</label>
          <div className="flex gap-4">
            <button
              type="button"
              data-testid="save-draft-button"
              onClick={() => handleSubmit(undefined, "draft")}
              disabled={submitting}
              className={`flex-1 p-4 border-2 rounded-lg transition-colors disabled:opacity-50 ${
                formData.status === "draft"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="font-medium">Save as Draft</div>
              <div className="text-sm text-gray-600">Not visible to searchers</div>
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(undefined, "published")}
              disabled={submitting}
              className={`flex-1 p-4 border-2 rounded-lg transition-colors disabled:opacity-50 ${
                formData.status === "published"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="font-medium">Publish Now</div>
              <div className="text-sm text-gray-600">Make visible immediately</div>
            </button>
          </div>
        </div>

        {/* Summary */}
        {selectedProperty && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Listing Summary</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Property:</span> {selectedProperty.type} in{" "}
                {selectedProperty.address.city}
              </p>
              <p>
                <span className="font-medium">Type:</span> {formData.type}
              </p>
              <p>
                <span className="font-medium">Status:</span> {formData.status}
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/my-listings")}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !formData.propertyId}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
