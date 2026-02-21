// 🔹 FULL FILE REPLACE करा

import { useEffect, useState } from "react";
import {
  fetchApprovedServices,
  createBooking,
  subscribeToCustomerBookings,
  addReview,
  updateBookingStatus, // 🔹 added
} from "../../firebase/firestore";

function CustomerDashboard({ user }) {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    loadServices();
    getCustomerLocation();
    const unsubscribe = subscribeToCustomerBookings(user.uid, setBookings);
    return () => unsubscribe();
  }, [user.uid]);

  const loadServices = async () => {
    const data = await fetchApprovedServices();
    setServices(data);
  };

  const getCustomerLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    });
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (!latitude || !longitude) return;
    const nearby = services.filter((s) => {
      if (!s.latitude || !s.longitude) return false;
      const distance = getDistance(latitude, longitude, s.latitude, s.longitude);
      return distance <= 50;
    });
    setFilteredServices(nearby);
  }, [latitude, longitude, services]);

  const statusColor = (status) => {
    if (status === "Pending") return "bg-yellow-100 text-yellow-800";
    if (status === "Accepted") return "bg-blue-100 text-blue-800";
    if (status === "Completed") return "bg-green-100 text-green-800";
    if (status === "Rejected") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const handleBooking = async () => {
    if (!selectedService) return alert("Select a service");
    if (!customerName || !customerMobile)
      return alert("Enter name and mobile");

    await createBooking({
      service: selectedService.serviceName,
      providerId: selectedService.providerId,
      providerName: selectedService.providerName,
      providerMobile: selectedService.providerMobile,
      amount: selectedService.price,
      customerId: user.uid,
      customerName,
      customerMobile,
    });

    alert("Booking Created!");
    setSelectedService(null);
    setCustomerName("");
    setCustomerMobile("");
  };

  // 🔹 UPDATED: Real Payment (Logic safe)
  const handleCompleteAndPay = async (booking) => {
    if (
      !window.confirm(
        "Are you sure the service is completed? Payment will be released to provider."
      )
    ) {
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: booking.amount }),
      });

      const order = await res.json();

      const options = {
        key: "rzp_test_SIgBPJfzhw9JLP", // 🔥 Replace with real key
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Local Services",
        description: "Service Payment",

        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false,
        },

        handler: async function (response) {
          const verifyRes = await fetch(
            "http://localhost:5000/verify-payment",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(response),
            }
          );

          const verifyData = await verifyRes.json();

          if (verifyData.status === "verified") {
            await updateBookingStatus(
              booking.id,
              "Completed",
              "Paid"
            );

            alert("Payment Successful & Released!");
          } else {
            alert("Payment verification failed.");
          }
        },

        theme: {
          color: "#16a34a",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment failed. Try again.");
    }
  };

  const handleReviewSubmit = async (bookingId) => {
    if (rating === 0) return alert("Select rating");
    await addReview(bookingId, rating, review);
    alert("Review Submitted!");
    setRating(0);
    setReview("");
  };

  return (
    <div className="space-y-10">

      {/* 🔹 SERVICES */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Nearby Services (50KM)
        </h2>

        {filteredServices.length === 0 && (
          <p className="text-gray-500">No nearby services available</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedService(s)}
              className={`cursor-pointer rounded-xl p-5 border transition-all duration-200 ${
                selectedService?.id === s.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "hover:shadow-lg"
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {s.serviceName}
              </h3>
              <p className="text-blue-600 font-bold mt-1">₹{s.price}</p>
              <p className="text-sm text-gray-500 mt-2">
                Provider: {s.providerName}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 CUSTOMER FORM */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Customer Details
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Full Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Mobile Number"
            value={customerMobile}
            onChange={(e) => setCustomerMobile(e.target.value)}
          />
        </div>

        <button
          onClick={handleBooking}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Book Selected Service
        </button>
      </div>

      {/* 🔹 BOOKINGS */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          My Bookings
        </h2>

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
              <p><strong>Payment:</strong> {b.paymentStatus}</p>

              {b.status === "Accepted" && (
                <button
                  onClick={() => handleCompleteAndPay(b)}
                  className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Complete & Release Payment
                </button>
              )}

              {b.status === "Completed" && b.rating === 0 && (
                <div className="mt-4 space-y-3">
                  <select
                    className="border rounded-lg px-3 py-2"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  >
                    <option value="0">Select Rating</option>
                    <option value="1">⭐</option>
                    <option value="2">⭐⭐</option>
                    <option value="3">⭐⭐⭐</option>
                    <option value="4">⭐⭐⭐⭐</option>
                    <option value="5">⭐⭐⭐⭐⭐</option>
                  </select>

                  <input
                    className="border rounded-lg px-3 py-2 w-full"
                    placeholder="Write review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />

                  <button
                    onClick={() => handleReviewSubmit(b.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Submit Review
                  </button>
                </div>
              )}

              {b.rating > 0 && (
                <div className="mt-4 bg-green-50 p-3 rounded-lg">
                  <p>⭐ Rating: {b.rating}</p>
                  <p>📝 {b.review}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default CustomerDashboard;