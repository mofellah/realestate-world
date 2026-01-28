// Footer component
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">RE</span>
              </div>
              <span className="text-xl font-bold text-white">RealEstate World</span>
            </div>
            <p className="text-sm text-gray-400">
              Find your perfect property in Belgium, Netherlands, and Switzerland.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/search" className="hover:text-white">Search Properties</Link></li>
              <li><Link to="/dashboard/properties/create" className="hover:text-white">List Property</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-white">How It Works</Link></li>
              <li><Link to="/#pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Markets */}
          <div>
            <h3 className="text-white font-semibold mb-4">Markets</h3>
            <ul className="space-y-2">
              <li><Link to="/search?country=BE" className="hover:text-white">🇧🇪 Belgium</Link></li>
              <li><Link to="/search?country=NL" className="hover:text-white">🇳🇱 Netherlands</Link></li>
              <li><Link to="/search?country=CH" className="hover:text-white">🇨🇭 Switzerland</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} RealEstate World. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
