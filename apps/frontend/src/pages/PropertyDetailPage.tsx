import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePropertyStore } from '../stores/propertyStore';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listings } = usePropertyStore();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Find the listing from the store
      const found = listings.find(l => l.id === id);
      setListing(found);
      setLoading(false);
    }
  }, [id, listings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading property details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Property not found</p>
          <button
            onClick={() => navigate('/search')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/search')}
          className="mb-6 text-blue-600 hover:text-blue-800"
        >
          ← Back to search
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Property Image Placeholder */}
          <div className="w-full h-96 bg-gray-300 flex items-center justify-center">
            <p className="text-gray-500">Property Image</p>
          </div>

          {/* Property Details */}
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600">Price</p>
                <p className="text-2xl font-bold">
                  €{listing.price?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Type</p>
                <p className="text-lg font-semibold capitalize">{listing.type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Bedrooms</p>
                <p className="text-lg">{listing.bedrooms || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Bathrooms</p>
                <p className="text-lg">{listing.bathrooms || 'N/A'}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3">Description</h2>
              <p className="text-gray-700">{listing.description || 'No description available'}</p>
            </div>

            {/* Contact Agent */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold mb-4">Interested in this property?</h3>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Contact Agent
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
