import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { propertiesService } from "../services/properties-service";
import { messagesService } from "../services/messages-service";
import { useAuthStore } from "../stores/authStore";
import { PropertyDetailSkeleton } from "../components/Skeleton";

interface PropertyDetail {
  id: string;
  type: string;
  address: {
    street?: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  listings: Array<{
    type: string;
    status: string;
    paymentTerms: Array<{
      type: string;
      currency: string;
      amount?: number;
      amountPerPeriod?: number;
    }>;
  }>;
  views?: Array<{ id: string; userId: string; viewedAt: string }>;
  ownerPerson?: { email: string; phone?: string };
  user?: { id: string; email: string };
  agency?: { id: string; personId: string };
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactMessage, setContactMessage] = useState("");
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
    if (!property?.listings || property.listings.length === 0) return "N/A";

    const firstListing = property.listings[0];
    if (!firstListing?.paymentTerms || firstListing.paymentTerms.length === 0) return "N/A";

    const term = firstListing.paymentTerms[0];
    if (!term) return "N/A";

    if (term.type === "onetime" && term.amount) {
      return `€${term.amount.toLocaleString()}`;
    }
    if (term.type === "periodic" && term.amountPerPeriod) {
      return `€${term.amountPerPeriod.toLocaleString()}/mo`;
    }
    return "Price on request";
  }, [property]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!property?.ownerPerson?.email || !contactMessage.trim()) {
      setError("Please fill in your message");
      return;
    }

    try {
      setSending(true);
      await messagesService.sendMessage({
        recipientId: property.user?.id || "",
        subject_line: `Inquiry about ${property.type} in ${property.address.city}`,
        body: contactMessage,
        messageType: "inquiry",
        subjectId: property.id,
      });
      setContactMessage("");
      alert("Message sent successfully!");
    } catch (err) {
      console.error("Failed to send message:", err);
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
          <p className="text-red-600 mb-4">{error || "Property not found"}</p>
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

  const images = [
    "https://via.placeholder.com/1200x800",
    "https://via.placeholder.com/400x300",
    "https://via.placeholder.com/400x300",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white dark:bg-gray-900">
      <button
        onClick={() => navigate("/search")}
        className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        ← Back to search
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Photo Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-700 p-2">
          <div className="md:col-span-2">
            <img
              src={images[0]}
              alt={`${property.type} in ${property.address.city}`}
              className="w-full h-96 object-cover rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            {images.slice(1, 3).map((src: string, index: number) => (
              <img
                key={index}
                src={src}
                alt={`Property ${index + 2}`}
                className="w-full h-44 object-cover rounded-md"
              />
            ))}
          </div>
        </div>

        {/* Property Details */}
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                {property.propertyType?.toUpperCase() || "PROPERTY"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span>
                  {property.address.city}, {property.address.country}
                </span>
                {property.views && property.views.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    👁️ {property.views.length} {property.views.length === 1 ? "view" : "views"}
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 dark:text-gray-400">Price</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{priceLabel}</p>
              {property.listings && property.listings.length > 0 && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase">
                  {property.listings[0].type}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Type</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{property.type}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Location</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {property.address.city}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Views</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {property.views?.length ?? 0}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Listings</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {property.listings?.length ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  Property Details
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {property.address.street && `${property.address.street}, `}
                  {property.address.city}, {property.address.country}
                  {property.address.latitude && property.address.longitude && (
                    <>
                      {" "}
                      ({property.address.latitude}, {property.address.longitude})
                    </>
                  )}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Listings</h2>
                {property.listings && property.listings.length > 0 ? (
                  <div className="space-y-3">
                    {property.listings.map((listing, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize text-gray-900 dark:text-white">
                            {listing.type}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {listing.status}
                          </span>
                        </div>
                        {listing.paymentTerms && listing.paymentTerms.length > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            €
                            {listing.paymentTerms[0].amount ||
                              listing.paymentTerms[0].amountPerPeriod}{" "}
                            {listing.paymentTerms[0].currency}
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
                  {property.ownerPerson?.email || "Verified Owner"}
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
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Your message..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>

              {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
