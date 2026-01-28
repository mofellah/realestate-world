import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface PropertyFormData {
  title: string;
  description: string;
  propertyType: string;
  listingType: 'sale' | 'rent';
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
    title: '',
    description: '',
    propertyType: 'house',
    listingType: 'sale',
    price: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    bedrooms: '',
    bathrooms: '',
    area: '',
    yearBuilt: '',
    parking: '',
    amenities: [],
    images: [],
    videoUrl: '',
  });

  useEffect(() => {
    // TODO: Fetch property data from API using id
    const fetchProperty = async () => {
      try {
        // Mock data - replace with actual API call
        const mockData = {
          title: 'Modern Family Home',
          description: 'Beautiful 3-bedroom house in a quiet neighborhood',
          propertyType: 'house',
          listingType: 'sale' as const,
          price: '450000',
          street: '123 Main Street',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'USA',
          bedrooms: '3',
          bathrooms: '2',
          area: '2000',
          yearBuilt: '2010',
          parking: '2',
          amenities: ['pool', 'garden'],
          images: [],
          videoUrl: '',
        };
        setFormData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching property:', error);
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const updateFormData = (updates: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    try {
      // TODO: PUT request to update property
      console.log('Updating property:', id, formData);
      navigate('/dashboard/my-properties');
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const amenitiesList = [
    { id: 'pool', label: 'Swimming Pool' },
    { id: 'gym', label: 'Gym' },
    { id: 'garden', label: 'Garden' },
    { id: 'garage', label: 'Garage' },
    { id: 'balcony', label: 'Balcony' },
    { id: 'ac', label: 'Air Conditioning' },
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
                    checked={formData.listingType === 'sale'}
                    onChange={() => updateFormData({ listingType: 'sale' })}
                    className="mr-2"
                  />
                  For Sale
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.listingType === 'rent'}
                    onChange={() => updateFormData({ listingType: 'rent' })}
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
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => updateFormData({ country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Parking Spaces</label>
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
                          updateFormData({ amenities: formData.amenities.filter(a => a !== amenity.id) });
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Images</label>
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
                <label htmlFor="image-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                  Browse Files
                </label>
                {formData.images.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">{formData.images.length} file(s) selected</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (optional)</label>
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
              <p><strong>Title:</strong> {formData.title}</p>
              <p><strong>Type:</strong> {formData.propertyType} for {formData.listingType}</p>
              <p><strong>Price:</strong> ${formData.price}</p>
              <p><strong>Location:</strong> {formData.street}, {formData.city}, {formData.state}</p>
              <p><strong>Specs:</strong> {formData.bedrooms} bed, {formData.bathrooms} bath, {formData.area} sq ft</p>
              {formData.amenities.length > 0 && (
                <p><strong>Amenities:</strong> {formData.amenities.join(', ')}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading property...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Property</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
  );
}
