import { useEffect, useState } from "react";
import {
  listenToAuthChanges,
  getUserRole,
  logoutUser,
} from "./firebase/auth";

import Login from "./components/auth/Login";
import CustomerDashboard from "./components/customer/CustomerDashboard";
import ProviderDashboard from "./components/provider/ProviderDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToAuthChanges(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userData = await getUserRole(currentUser.uid);

        if (userData && userData.role) {
          setRole(userData.role.toLowerCase());
        } else {
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Application...</p>
        </div>
      </div>
    );
  }

  /* ================= NOT LOGGED IN ================= */

  if (!user) {
    return <Login />;
  }

  /* ================= ROLE COLOR ================= */

  const roleColor =
    role === "admin"
      ? "bg-red-500"
      : role === "provider"
      ? "bg-purple-500"
      : "bg-blue-500";

  /* ================= MAIN LAYOUT ================= */

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ======= NAVBAR ======= */}
      <div className="bg-white shadow-md px-4 md:px-10 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Local Services Marketplace
          </h1>
          <p className="text-sm text-gray-500">
            Logged in as <span className="font-semibold">{user.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {role && (
            <span
              className={`text-white text-xs px-3 py-1 rounded-full ${roleColor}`}
            >
              {role.toUpperCase()}
            </span>
          )}

          <button
            onClick={logoutUser}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition duration-200 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ======= DASHBOARD CONTENT ======= */}
      <div className="p-4 md:p-8">

        {role === "customer" && (
          <CustomerDashboard user={user} />
        )}

        {role === "provider" && (
          <ProviderDashboard user={user} />
        )}

        {role === "admin" && (
          <AdminDashboard user={user} />
        )}

        {!role && (
          <div className="bg-white shadow rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-red-500">
              No role assigned
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;