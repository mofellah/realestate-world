import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { propertiesService } from "../services/properties-service";
import { useAuthStore } from "../stores/authStore";
import { PropertyDetailSkeleton } from "../components/Skeleton";
import ContactModal from "../components/ContactModal";

interface PropertyDetail {
  id: string;
  title?: string;
  description?: string;
  type: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  surfaceArea?: number;
  images?: string[];
  address: {
    id?: string;
    street?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  listings: Array<{
    id?: string;
    type: string;
    status: string;
    paymentTerms?: Array<{
      id?: string;
      type?: string;
      termType?: string;
      currency?: string;
      amount?: number;
      amountPerPeriod?: number;
    }>;
  }>;
  views?: Array<{ id: string; userId: string; viewedAt: string }>;
  ownerPerson?: { id?: string; email: string; phone?: string };
  user?: { id: string; email: string };
  agency?: { id: string; personId?: string };
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        setError("Property ID not found");
        setLoading(false);
        return;
      }

      try {
        const data = await propertiesService.getPropertyDetail(id);
        setProperty(data);
      } catch (err) {
        console.error("Failed to load property:", err);
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  const priceLabel = useMemo(() => {
    if (!property?.listings || property.listings.length === 0) return "Price on request";

    const firstListing = property.listings[0];
    if (!firstListing?.paymentTerms || firstListing.paymentTerms.length === 0)
      return "Price on request";

    const term = firstListing.paymentTerms[0];
    if (!term) return "Price on request";

    const currency = term.currency || "EUR";
    const currencySymbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency;

    // Use the flat amount/amountPerPeriod values
    if (term.termType === "onetime" && term.amount) {
      return `${term.amount.toLocaleString("en-US")} ${currencySymbol}`;
    }
    if ((term.termType || term.type) === "periodic" && term.amountPerPeriod) {
      const period = term.periodType || "month";
      return `${term.amountPerPeriod.toLocaleString("en-US")} ${currencySymbol} / ${period}`;
    }
    // Fallback to checking type field
    if (term.amount) return `${term.amount.toLocaleString("en-US")} ${currencySymbol}`;
    if (term.amountPerPeriod) {
      const period = term.periodType || "month";
      return `${term.amountPerPeriod.toLocaleString("en-US")} ${currencySymbol} / ${period}`;
    }
    return "Price on request";
  }, [property]);

  const handleContactSubmit = async (data: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!property?.ownerPerson?.email || !data.message.trim()) {
      setError("Please fill in your message");
      return;
    }

    try {
      setSending(true);
      const contactHeader = [
        data.name?.trim() ? `Name: ${data.name.trim()}` : null,
        data.email?.trim() ? `Email: ${data.email.trim()}` : null,
        data.phone?.trim() ? `Phone: ${data.phone.trim()}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const body = contactHeader ? `${contactHeader}\n\n${data.message}` : data.message;

      await propertiesService.contactOwner(property.id, {
        subjectLine: `Inquiry about ${property.type} in ${property.address.city}`,
        body,
      });
      setShowContactModal(false);
      alert("Message sent successfully!");
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <PropertyDetailSkeleton />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{String(error || "Property not found")}</p>
          <button
            onClick={() => navigate("/search")}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white dark:bg-gray-900">
      <button
        onClick={() => navigate("/search")}
        className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        ← Back to search
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Photo Gallery - Temporarily disabled for debugging */}
        <div className="bg-gray-100 dark:bg-gray-700 p-8 text-center">
          <p className="text-gray-600">Photo Gallery</p>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                {String(
                  property.title || property.propertyType || property.type || "PROPERTY",
                ).toUpperCase()}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span>
                  {String(property.address?.city || "")}, {String(property.address?.country || "")}
                </span>
                {property.views && Array.isArray(property.views) && property.views.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    👁️ {property.views.length} {property.views.length === 1 ? "view" : "views"}
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 dark:text-gray-400">Price</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{priceLabel}</p>
              {property.listings &&
                Array.isArray(property.listings) &&
                property.listings.length > 0 && (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase">
                    {String(property.listings[0]?.type || "")}
                  </span>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Type</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {String(property.type || "")}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Bedrooms</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {property.bedrooms || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Bathrooms</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {property.bathrooms || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Surface</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {property.surfaceArea ? `${property.surfaceArea}m²` : "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {property.description && (
                <div>
                  <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    Description
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">{String(property.description)}</p>
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  Property Details
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {property.address?.street && `${String(property.address.street)}, `}
                  {String(property.address?.city || "")}, {String(property.address?.country || "")}
                  {property.address?.latitude && property.address?.longitude && (
                    <>
                      {" "}
                      (Coordinates: {property.address.latitude}, {property.address.longitude})
                    </>
                  )}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Listings</h2>
                {property.listings &&
                Array.isArray(property.listings) &&
                property.listings.length > 0 ? (
                  <div className="space-y-3">
                    {property.listings.map((listing, idx) => (
                      <div
                        key={listing.id || idx}
                        className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize text-gray-900 dark:text-white">
                            {String(listing.type || "")}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {String(listing.status || "")}
                          </span>
                        </div>
                        {listing.paymentTerms &&
                          Array.isArray(listing.paymentTerms) &&
                          listing.paymentTerms.length > 0 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              €
                              {(() => {
                                const term = listing.paymentTerms[0];
                                const amount = term?.amount || term?.amountPerPeriod;
                                return typeof amount === "number" ? amount.toLocaleString() : "N/A";
                              })()}{" "}
                              {String(listing.paymentTerms[0]?.currency || "EUR")}
                            </p>
                          )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No listings available</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Owner / Agency
                </h3>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {String(property.ownerPerson?.email || "Verified Owner")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Response time: under 24h</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
                <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                  Interested in this property?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Send a message to schedule a visit or ask a question.
                </p>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold"
                >
                  Contact Owner
                </button>
              </div>

              {error && <p className="text-red-600 dark:text-red-400 text-sm">{String(error)}</p>}
            </div>
          </div>
        </div>
      </div>

      {showContactModal && (
        <ContactModal
          open={showContactModal}
          title="Contact Property Owner"
          initialValues={{
            name: "",
            email: "",
            phone: "",
          }}
          loading={sending}
          error={error ? String(error) : null}
          onClose={() => {
            setShowContactModal(false);
            setError(null);
          }}
          onSubmit={handleContactSubmit}
        />
      )}
    </div>
  );
}
