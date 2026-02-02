import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { agenciesService } from "@/services/agencies-service";

interface Agent {
  userId: string;
  email?: string;
  role: "owner" | "manager" | "agent" | "sales_manager" | "support_agent";
  user?: {
    id: string;
    email: string;
  };
}

export default function AgencyTeamPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, [user]);

  const fetchAgents = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await agenciesService.getTeam(user.id);
      setAgents(data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load agents";
      setError(msg);
      console.error("[AgencyTeam] Failed to load agents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!user?.id || !inviteEmail.trim()) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await agenciesService.inviteAgent(user.id, inviteEmail);
      setInviteEmail("");
      setShowInviteForm(false);
      await fetchAgents();
      alert("Invitation sent successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to invite agent";
      setError(msg);
      console.error("[AgencyTeam] Failed to invite agent:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <button
          onClick={() => setShowInviteForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          Invite Agent
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {showInviteForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Invite New Agent</h2>
          <div className="flex space-x-4">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="agent@example.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
            <button
              onClick={handleInvite}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Invite"}
            </button>
            <button
              onClick={() => setShowInviteForm(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && !agents.length ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Loading agents...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.length > 0 ? (
                agents.map((agent) => (
                  <tr key={agent.userId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {agent.user?.email || "Unknown"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          agent.role === "owner"
                            ? "bg-purple-100 text-purple-800"
                            : agent.role === "manager"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {agent.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {agent.role !== "owner" && (
                        <>
                          <button className="text-blue-600 hover:text-blue-900">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Remove</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    No agents found. Invite your first agent!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
