import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { propertiesService } from "../../services/properties-service";

interface PropertyFormData {
  title: string;
  description: string;
  propertyType: string;
  listingType: "sale" | "rental";
  price: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  yearBuilt: string;
  parking: string;
  amenities: string[];
  images: File[];
  videoUrl: string;
}

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    propertyType: "house",
    listingType: "sale",
    price: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    bedrooms: "",
    bathrooms: "",
    area: "",
    yearBuilt: "",
    parking: "",
    amenities: [],
    images: [],
    videoUrl: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const property = await propertiesService.getProperty(id);

        setFormData({
          title: property.title || "",
          description: property.description || "",
          propertyType: property.type || "house",
          listingType: "sale",
          price: "",
          street: property.address?.street || "",
          city: property.address?.city || "",
          state: property.address?.state || "",
          zipCode: property.address?.postalCode || "",
          country: property.address?.country || "USA",
          bedrooms: property.bedrooms?.toString() || "",
          bathrooms: property.bathrooms?.toString() || "",
          area: property.surfaceArea?.toString() || "",
          yearBuilt: property.yearBuilt?.toString() || "",
          parking: "",
          amenities: property.amenitiesList || [],
          images: [],
          videoUrl: "",
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load property";
        setError(errorMsg);
        console.error("[EditProperty] Failed to load:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const updateFormData = (updates: Partial<PropertyFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    if (!id) {
      setError("Property ID not found");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const propertyData = {
        title: formData.title,
        description: formData.description,
        type: formData.propertyType,
        bedrooms: parseInt(formData.bedrooms) || undefined,
        bathrooms: parseFloat(formData.bathrooms) || undefined,
        surfaceArea: parseFloat(formData.area) || undefined,
        yearBuilt: parseInt(formData.yearBuilt) || undefined,
        amenitiesList: formData.amenities,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.zipCode,
          country: formData.country,
        },
      };

      await propertiesService.updateProperty(id, propertyData);
      navigate("/dashboard/my-properties");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update property";
      setError(errorMsg);
      console.error("[EditProperty] Failed to submit:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const amenitiesList = [
    { id: "pool", label: "Swimming Pool" },
    { id: "gym", label: "Gym" },
    { id: "garden", label: "Garden" },
    { id: "garage", label: "Garage" },
    { id: "balcony", label: "Balcony" },
    { id: "ac", label: "Air Conditioning" },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                value={formData.propertyType}
                onChange={(e) => updateFormData({ propertyType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.listingType === "sale"}
                    onChange={() => updateFormData({ listingType: "sale" })}
                    className="mr-2"
                  />
                  For Sale
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.listingType === "rental"}
                    onChange={() => updateFormData({ listingType: "rental" })}
                    className="mr-2"
                  />
                  For Rent
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateFormData({ price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => updateFormData({ street: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateFormData({ city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => updateFormData({ state: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => updateFormData({ zipCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => updateFormData({ country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a country</option>
                  <option value="USA">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Spain">Spain</option>
                  <option value="Italy">Italy</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Australia">Australia</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Japan">Japan</option>
                  <option value="China">China</option>
                  <option value="Singapore">Singapore</option>
                  <option value="UAE">United Arab Emirates</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => updateFormData({ bedrooms: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => updateFormData({ bathrooms: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => updateFormData({ area: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                <input
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => updateFormData({ yearBuilt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parking Spaces
                </label>
                <input
                  type="number"
                  value={formData.parking}
                  onChange={(e) => updateFormData({ parking: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {amenitiesList.map((amenity) => (
                  <label key={amenity.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData({ amenities: [...formData.amenities, amenity.id] });
                        } else {
                          updateFormData({
                            amenities: formData.amenities.filter((a) => a !== amenity.id),
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    {amenity.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Media</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      updateFormData({ images: Array.from(e.target.files) });
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700"
                >
                  Browse Files
                </label>
                {formData.images.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {formData.images.length} file(s) selected
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL (optional)
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => updateFormData({ videoUrl: e.target.value })}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Review & Save</h2>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p>
                <strong>Title:</strong> {formData.title}
              </p>
              <p>
                <strong>Type:</strong> {formData.propertyType} for {formData.listingType}
              </p>
              <p>
                <strong>Price:</strong> ${formData.price}
              </p>
              <p>
                <strong>Location:</strong> {formData.street}, {formData.city}, {formData.state}
              </p>
              <p>
                <strong>Specs:</strong> {formData.bedrooms} bed, {formData.bathrooms} bath,{" "}
                {formData.area} sq ft
              </p>
              {formData.amenities.length > 0 && (
                <p>
                  <strong>Amenities:</strong> {formData.amenities.join(", ")}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading property...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Property</h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-200 font-semibold">Error</p>
          <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step
                    ? "bg-blue-600 dark:bg-blue-700 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {step}
              </div>
              {step < 5 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    currentStep > step
                      ? "bg-blue-600 dark:bg-blue-700"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
