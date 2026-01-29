import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { usePropertyStore } from '../stores/propertyStore';
import { PaymentTermType } from '../types';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listings, properties } = usePropertyStore();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = listings.find(l => l.id === id) || listings.find(l => l.propertyId === id);
      if (found) {
        setListing(found);
        setLoading(false);
        return;
      }

      const property = properties.find(p => p.id === id);
      if (property) {
        setListing({
          id: `listing-${property.id}`,
          type: 'sale',
          propertyId: property.id,
          property,
          paymentTerms: {
            id: `payment-${property.id}`,
            termType: PaymentTermType.ONETIME,
            amount: 0,
            currency: 'EUR',
            createdAt: property.createdAt,
            updatedAt: property.updatedAt,
          },
          viewCount: 0,
          inquiryCount: 0,
        });
        setLoading(false);
        return;
      }

      setListing(null);
      setLoading(false);
    }
  }, [id, listings, properties]);

  const priceLabel = useMemo(() => {
    if (!listing?.paymentTerms) return 'N/A';
    if (listing.paymentTerms.termType === PaymentTermType.ONETIME) {
      return `€${listing.paymentTerms.amount.toLocaleString()}`;
    }
    if (listing.paymentTerms.termType === PaymentTermType.PERIODIC) {
      return `€${listing.paymentTerms.amountPerPeriod.toLocaleString()}/mo`;
    }
    return 'Price on request';
  }, [listing]);

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

  const images = listing?.property?.images?.length
    ? listing.property.images
    : ['https://via.placeholder.com/1200x800'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/search')}
        className="mb-6 text-blue-600 hover:text-blue-800"
      >
        ← Back to search
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Photo Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-gray-100 p-2">
          <div className="md:col-span-2">
            <img
              src={images[0]}
              alt={listing.property.title}
              className="w-full h-96 object-cover rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            {images.slice(1, 3).map((src: string, index: number) => (
              <img
                key={src}
                src={src}
                alt={`${listing.property.title} ${index + 2}`}
                className="w-full h-44 object-cover rounded-md"
              />
            ))}
          </div>
        </div>

        {/* Property Details */}
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{listing.property.title}</h1>
              <p className="text-gray-600">
                {listing.property.address.city}, {listing.property.address.country_code}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Price</p>
              <p className="text-3xl font-bold text-blue-600">{priceLabel}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase">
                {listing.type.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-gray-500 text-sm">Bedrooms</p>
              <p className="text-lg font-semibold">{listing.property.bedrooms ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Bathrooms</p>
              <p className="text-lg font-semibold">{listing.property.bathrooms ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Surface</p>
              <p className="text-lg font-semibold">
                {listing.property.surfaceArea ? `${listing.property.surfaceArea} m²` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Views</p>
              <p className="text-lg font-semibold">{listing.viewCount ?? 0}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-3">Description</h2>
                <p className="text-gray-700">
                  {listing.property.description || 'No description available'}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-3">Location</h2>
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center text-gray-500">
                  Map preview coming soon
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Owner / Agency</h3>
                <p className="text-gray-700 font-medium">
                  {listing.property.ownerPerson?.displayName || 'Verified Owner'}
                </p>
                <p className="text-sm text-gray-500">Response time: under 24h</p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-bold mb-2">Interested in this property?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Send a message to schedule a visit or ask a question.
                </p>
                <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Contact
                </button>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Stats</h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Preview views</span>
                  <span>{listing.viewCount ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Inquiries</span>
                  <span>{listing.inquiryCount ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
