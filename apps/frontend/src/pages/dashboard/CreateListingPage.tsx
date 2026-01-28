import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  price: number;
}

interface ListingFormData {
  propertyId: string;
  featured: boolean;
  duration: number; // days
  description: string;
  contactEmail: string;
  contactPhone: string;
  showAddress: boolean;
  allowInquiries: boolean;
}

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState<ListingFormData>({
    propertyId: '',
    featured: false,
    duration: 30,
    description: '',
    contactEmail: '',
    contactPhone: '',
    showAddress: true,
    allowInquiries: true,
  });

  useEffect(() => {
    // TODO: Fetch user's unlisted properties
    const mockProperties: Property[] = [
      { id: '1', title: 'Modern Family Home', price: 450000 },
      { id: '2', title: 'Downtown Apartment', price: 280000 },
    ];
    setProperties(mockProperties);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: POST to /api/listings
      console.log('Creating listing:', formData);
      navigate('/dashboard/my-listings');
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  const updateFormData = (updates: Partial<ListingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const selectedProperty = properties.find(p => p.id === formData.propertyId);
  const listingCost = formData.featured ? 99 : 49; // Mock pricing

  return (
    <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Listing</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Select Property */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Property</label>
            <select
              value={formData.propertyId}
              onChange={(e) => updateFormData({ propertyId: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a property...</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title} - ${property.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Listing Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
            <div className="space-y-2">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  checked={!formData.featured}
                  onChange={() => updateFormData({ featured: false })}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium">Standard Listing</div>
                  <div className="text-sm text-gray-600">Basic visibility in search results</div>
                </div>
                <div className="font-bold text-gray-900">$49/month</div>
              </label>
              <label className="flex items-center p-4 border-2 border-yellow-400 rounded-lg cursor-pointer hover:bg-yellow-50">
                <input
                  type="radio"
                  checked={formData.featured}
                  onChange={() => updateFormData({ featured: true })}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium flex items-center">
                    Featured Listing
                    <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded">RECOMMENDED</span>
                  </div>
                  <div className="text-sm text-gray-600">Top placement, highlighted in search</div>
                </div>
                <div className="font-bold text-gray-900">$99/month</div>
              </label>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Listing Duration</label>
            <select
              value={formData.duration}
              onChange={(e) => updateFormData({ duration: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              rows={4}
              placeholder="Add any additional details for this listing..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Privacy Options */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showAddress}
                onChange={(e) => updateFormData({ showAddress: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show full address publicly</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allowInquiries}
                onChange={(e) => updateFormData({ allowInquiries: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Allow inquiries via platform</span>
            </label>
          </div>

          {/* Summary */}
          {selectedProperty && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Listing Summary</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Property:</strong> {selectedProperty.title}</p>
                <p><strong>Type:</strong> {formData.featured ? 'Featured' : 'Standard'}</p>
                <p><strong>Duration:</strong> {formData.duration} days</p>
                <p><strong>Cost:</strong> ${listingCost}/month</p>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/my-listings')}
              className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Publish Listing
            </button>
          </div>
        </form>
      </div>
  );
}
