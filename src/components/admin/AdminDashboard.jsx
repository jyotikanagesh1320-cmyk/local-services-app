import { useEffect, useState } from "react";
import {
  fetchPendingServices,
  approveService,
  fetchAllBookings,
  fetchAllUsers,
  getCommissionPercent,
  updateCommissionPercent,
} from "../../firebase/firestore";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("services");
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [commissionPercent, setCommissionPercent] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const pendingServices = await fetchPendingServices();
    const allBookings = await fetchAllBookings();
    const allUsers = await fetchAllUsers();
    const percent = await getCommissionPercent();

    setServices(pendingServices);
    setBookings(allBookings);
    setUsers(allUsers);
    setCommissionPercent(percent);
  };

  const handleApproveService = async (id) => {
    await approveService(id);
    loadData();
  };

  const handleCommissionUpdate = async () => {
    await updateCommissionPercent(commissionPercent);
    alert("Commission Updated!");
  };

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (b.amount || 0),
    0
  );

  const totalCommission = bookings.reduce(
    (sum, b) => sum + (b.commission || 0),
    0
  );

  const totalUsers = users.length;
  const totalBookings = bookings.length;
  const pendingServicesCount = services.length;

  const statusColor = (status) => {
    if (status === "Pending") return "bg-yellow-100 text-yellow-800";
    if (status === "Accepted") return "bg-blue-100 text-blue-800";
    if (status === "Completed") return "bg-green-100 text-green-800";
    if (status === "Rejected") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-8">

      {/* ===== TOP ANALYTICS CARDS ===== */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">
            ₹{totalRevenue}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500">Platform Commission</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">
            ₹{totalCommission}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500">Total Users</p>
          <h3 className="text-2xl font-bold text-purple-600 mt-2">
            {totalUsers}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <h3 className="text-2xl font-bold text-orange-500 mt-2">
            {totalBookings}
          </h3>
        </div>
      </div>

      {/* ===== MAIN PANEL ===== */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* SIDEBAR */}
        <div className="md:w-60 bg-white shadow rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-lg mb-4">Admin Panel</h3>

          {["services", "bookings", "users", "revenue", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-2 rounded-lg capitalize transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 bg-white shadow rounded-2xl p-6">

          {/* SERVICES */}
          {activeTab === "services" && (
            <>
              <h2 className="text-xl font-bold mb-4">
                Pending Services ({pendingServicesCount})
              </h2>

              {services.length === 0 && (
                <p className="text-gray-500">No pending services</p>
              )}

              <div className="space-y-4">
                {services.map((s) => (
                  <div key={s.id} className="border rounded-xl p-4 shadow-sm">
                    <p><strong>Service:</strong> {s.serviceName}</p>
                    <p><strong>Provider:</strong> {s.providerName}</p>
                    <p><strong>Mobile:</strong> {s.providerMobile}</p>
                    <p><strong>Price:</strong> ₹{s.price}</p>

                    <button
                      onClick={() => handleApproveService(s.id)}
                      className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Approve Service
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* BOOKINGS */}
          {activeTab === "bookings" && (
            <>
              <h2 className="text-xl font-bold mb-4">All Bookings</h2>

              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="border rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold">{b.bookingCode}</p>
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${statusColor(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <p><strong>Service:</strong> {b.service}</p>
                    <p><strong>Provider:</strong> {b.providerName}</p>
                    <p><strong>Customer:</strong> {b.customerName}</p>
                    <p><strong>Amount:</strong> ₹{b.amount}</p>
                    <p><strong>Commission:</strong> ₹{b.commission}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* USERS */}
          {activeTab === "users" && (
            <>
              <h2 className="text-xl font-bold mb-4">All Users</h2>

              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="border rounded-xl p-4 shadow-sm">
                    <p><strong>Email:</strong> {u.email}</p>
                    <p><strong>Role:</strong> {u.role}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* REVENUE */}
          {activeTab === "revenue" && (
            <>
              <h2 className="text-xl font-bold mb-4">Revenue Overview</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-100 p-6 rounded-xl">
                  <p>Total Revenue</p>
                  <h3 className="text-2xl font-bold">₹{totalRevenue}</h3>
                </div>

                <div className="bg-green-100 p-6 rounded-xl">
                  <p>Total Commission</p>
                  <h3 className="text-2xl font-bold">₹{totalCommission}</h3>
                </div>
              </div>
            </>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <>
              <h2 className="text-xl font-bold mb-4">
                Commission Settings
              </h2>

              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <input
                  type="number"
                  value={commissionPercent}
                  onChange={(e) =>
                    setCommissionPercent(Number(e.target.value))
                  }
                  className="border rounded-lg px-4 py-2 w-40"
                />

                <button
                  onClick={handleCommissionUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Update %
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;