import React, { useState, useEffect } from "react";

interface Agent {
  id: string;
  name: string;
  email: string;
  role: "agent" | "manager";
  activeListings: number;
  sales: number;
  joinedAt: string;
}

export default function AgencyTeamPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      // API call to fetch agents
      // const data = await agencyService.getAgents();
      // setAgents(data);
      const mockAgents: Agent[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@agency.com",
          role: "manager",
          activeListings: 12,
          sales: 5,
          joinedAt: "2023-01-15",
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@agency.com",
          role: "agent",
          activeListings: 8,
          sales: 3,
          joinedAt: "2023-03-20",
        },
      ];
      setAgents(mockAgents);
    } catch (error) {
      console.error("[AgencyTeam] Failed to load agents:", error);
    }
  };

  const handleInvite = async () => {
    try {
      // API call to invite agent
      // await agencyService.inviteAgent(inviteEmail);
      setInviteEmail("");
      setShowInviteForm(false);
    } catch (error) {
      console.error("[AgencyTeam] Failed to invite agent:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <button
          onClick={() => setShowInviteForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Invite Agent
        </button>
      </div>

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
            />
            <button
              onClick={handleInvite}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Send Invite
            </button>
            <button
              onClick={() => setShowInviteForm(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
                Active Listings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sales
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.map((agent) => (
              <tr key={agent.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900">{agent.name}</div>
                    <div className="text-sm text-gray-500">{agent.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      agent.role === "manager"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {agent.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {agent.activeListings}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.sales}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(agent.joinedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
