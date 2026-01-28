// Home Page - Landing page with hero and featured properties
import { Link } from 'react-router-dom';
import { usePropertyStore } from '../stores/propertyStore';
import { useEffect } from 'react';

export default function HomePage() {
  const { filteredListings, isLoading } = usePropertyStore();
  const featuredListings = filteredListings.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find Your Perfect Home in Europe
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Search thousands of properties across Belgium, Netherlands, and Switzerland.
            Connect directly with owners and agencies.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/search"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Searching
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose RealEstate World?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-2">Interactive Map Search</h3>
              <p className="text-gray-600">
                Explore properties visually on an interactive map with proximity filters for schools,
                hospitals, and transport.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Transparent Pricing</h3>
              <p className="text-gray-600">
                No hidden fees. List your property for €20-50 or use flexible subscription plans.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🏘️</div>
              <h3 className="text-xl font-semibold mb-2">Multi-Country Coverage</h3>
              <p className="text-gray-600">
                Access properties in Belgium, Netherlands, and Switzerland from one platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Properties</h2>
          {isLoading ? (
            <div className="text-center py-12">Loading properties...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map(listing => (
                <Link
                  key={listing.id}
                  to={`/property/${listing.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <img
                    src={listing.property.images?.[0] || 'https://via.placeholder.com/400x300'}
                    alt={listing.property.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 truncate">
                      {listing.property.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {listing.property.address.city}, {listing.property.address.country_code}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">
                        €{listing.paymentTerms.termType === 'onetime' 
                          ? (listing.paymentTerms as any).amount.toLocaleString()
                          : (listing.paymentTerms as any).amountPerPeriod.toLocaleString()
                        }
                        {listing.paymentTerms.termType !== 'onetime' && '/mo'}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {listing.type}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {listing.property.bedrooms && `${listing.property.bedrooms} bed`}
                      {listing.property.bedrooms && listing.property.bathrooms && ' • '}
                      {listing.property.bathrooms && `${listing.property.bathrooms} bath`}
                      {listing.property.surfaceArea && ` • ${listing.property.surfaceArea}m²`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              to="/search"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Properties →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to List Your Property?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of property owners reaching buyers and renters directly.
          </p>
          <Link
            to="/dashboard/properties/create"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}
