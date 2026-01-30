import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { agenciesService, AgencyInfo, PropertyListing } from '../../services/agencies-service';

export default function AgencyDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const [agency, setAgency] = useState<AgencyInfo | null>(null);
  const [portfolio, setPortfolio] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgency = async () => {
      if (!id) {
        setError('Agency ID not provided');
        setLoading(false);
        return;
      }

      try {
        const agencyData = await agenciesService.getAgency(id);
        setAgency(agencyData);

        const portfolioData = await agenciesService.getPortfolio(id);
        setPortfolio(portfolioData.listings || []);
      } catch (err) {
        console.error('Failed to load agency:', err);
        setError('Failed to load agency details');
      } finally {
        setLoading(false);
      }
    };

    loadAgency();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-gray-500">Loading agency details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !agency) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-red-600">{error || 'Agency not found'}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{agency.person?.businessName || 'Agency'}</h1>
              <p className="text-gray-600">
                Tier: <span className="font-semibold capitalize">{agency.tier}</span>
              </p>
              {agency.description && <p className="text-gray-700 mt-2">{agency.description}</p>}
            </div>
            {agency.profileImageUrl && (
              <img
                src={agency.profileImageUrl}
                alt={agency.person?.businessName}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total Listings</p>
            <p className="text-3xl font-bold mt-2">{portfolio.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Active Listings</p>
            <p className="text-3xl font-bold mt-2">
              {portfolio.filter((p) => p.status === 'published').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Team Size</p>
            <p className="text-3xl font-bold mt-2">{agency.employees?.length || 0}</p>
          </div>
        </div>

        {/* Team */}
        {agency.employees && agency.employees.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Team Members</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {agency.employees.map((emp) => (
                    <tr key={emp.userId} className="border-t">
                      <td className="px-6 py-3 text-sm">{emp.user?.email || emp.userId}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
                          {emp.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Portfolio */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
          {portfolio.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
              No listings yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((listing) => (
                <div key={listing.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                  <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    Property Image
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold capitalize">{listing.type}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">{listing.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {listing.property?.address?.city || 'Location TBD'}
                    </p>
                    {listing.paymentTerms && listing.paymentTerms.length > 0 && (
                      <p className="text-lg font-bold text-blue-600">
                        €{listing.paymentTerms[0].amount} {listing.paymentTerms[0].currency}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
