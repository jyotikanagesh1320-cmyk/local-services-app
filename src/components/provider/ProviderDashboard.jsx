import { useEffect, useState } from "react";
import {
  subscribeToProviderBookings,
  updateBookingStatus,
  addProviderService,
} from "../../firebase/firestore";

function ProviderDashboard({ user }) {
  const [bookings, setBookings] = useState([]);

  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [providerName, setProviderName] = useState("");
  const [providerMobile, setProviderMobile] = useState("");

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToProviderBookings(user.uid, setBookings);
    return () => unsubscribe();
  }, [user.uid]);

  const statusColor = (status) => {
    if (status === "Pending") return "bg-yellow-100 text-yellow-800";
    if (status === "Accepted") return "bg-blue-100 text-blue-800";
    if (status === "Completed") return "bg-green-100 text-green-800";
    if (status === "Rejected") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // ================= SUMMARY CALCULATIONS =================

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (b) => b.status === "Pending"
  ).length;

  const completedBookings = bookings.filter(
    (b) => b.status === "Completed"
  ).length;

  const totalEarnings = bookings
    .filter((b) => b.status === "Completed")
    .reduce((sum, b) => sum + (b.providerAmount || 0), 0);

  const getLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        alert("Location Captured ✅");
      },
      () => alert("Location permission denied")
    );
  };

  const handleAddService = async () => {
    if (!serviceName || !price || !providerName || !providerMobile)
      return alert("Fill all fields");

    await addProviderService({
      serviceName,
      price: Number(price),
      providerId: user.uid,
      providerName,
      providerMobile,
      latitude,
      longitude,
    });

    alert("Service Added (Waiting for Admin Approval)");
    setServiceName("");
    setPrice("");
    setProviderName("");
    setProviderMobile("");
  };

  const handleAccept = async (id) => {
    await updateBookingStatus(id, "Accepted", "Pending");
  };

  const handleReject = async (id) => {
    await updateBookingStatus(id, "Rejected", "Refunded");
  };

  const handleComplete = async (id) => {
    alert("Processing Payment...");
    setTimeout(async () => {
      await updateBookingStatus(id, "Completed", "Paid");
      alert("💰 Payment Credited!");
    }, 2000);
  };

  return (
    <div className="space-y-10">

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500">Total Earnings</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">
            ₹{totalEarnings}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">
            {totalBookings}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500">Pending Bookings</p>
          <h3 className="text-2xl font-bold text-yellow-600 mt-2">
            {pendingBookings}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500">Completed Services</p>
          <h3 className="text-2xl font-bold text-purple-600 mt-2">
            {completedBookings}
          </h3>
        </div>

      </div>

      {/* ================= SERVICE REGISTRATION ================= */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Register New Service
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Service Name"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
          />

          <input
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Your Name"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
          />

          <input
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Mobile Number"
            value={providerMobile}
            onChange={(e) => setProviderMobile(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <button
            onClick={getLocation}
            className="bg-purple-600 text-white px-5 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Capture Location
          </button>

          <button
            onClick={handleAddService}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Add Service
          </button>
        </div>
      </div>

      {/* ================= BOOKINGS ================= */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          My Bookings
        </h2>

        {bookings.length === 0 && (
          <p className="text-gray-500">No bookings yet</p>
        )}

        <div className="space-y-6">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="border rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-gray-800">
                  {b.bookingCode}
                </p>

                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${statusColor(
                    b.status
                  )}`}
                >
                  {b.status}
                </span>
              </div>

              <p><strong>Service:</strong> {b.service}</p>
              <p><strong>Amount:</strong> ₹{b.amount}</p>
              <p><strong>Payment:</strong> {b.paymentStatus}</p>

              {b.status === "Pending" && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleAccept(b.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => handleReject(b.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              )}

              {b.status === "Accepted" && (
                <button
                  onClick={() => handleComplete(b.id)}
                  className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Complete Service
                </button>
              )}

              {b.status === "Completed" && (
                <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-green-700 font-semibold mb-1">
                    ✔ Service Completed
                  </p>
                  <p><strong>Commission:</strong> ₹{b.commission}</p>
                  <p><strong>Your Earning:</strong> ₹{b.providerAmount}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default ProviderDashboard;