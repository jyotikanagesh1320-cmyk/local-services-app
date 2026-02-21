import { useState } from "react";
import { loginWithGoogle } from "../../firebase/auth";

function Login() {
  const [role, setRole] = useState("customer");

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(role);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-white to-purple-100">

      {/* Floating background blur circles */}
      <div className="absolute w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse bottom-10 right-10"></div>

      {/* Glass Card */}
      <div className="relative backdrop-blur-lg bg-white/60 p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/40 transition-all duration-500 hover:shadow-2xl">

        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Welcome Back 👋
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          Login to access your dashboard
        </p>

        {/* Role Select */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Role
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          >
            <option value="customer">Customer</option>
            <option value="provider">Provider</option>
          </select>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition duration-200 font-semibold"
        >
          {/* Google SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-5 h-5"
          >
            <path fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.8-8.9 19.8-20 0-1.3-.1-2.7-.2-3.5z"
            />
            <path fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.6 16.1 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"
            />
            <path fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.1C29.2 35.6 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.7 39.5 16.3 44 24 44z"
            />
            <path fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3 5.3-5.7 6.9l6.2 5.1C39.5 36.3 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z"
            />
          </svg>

          <span className="text-gray-700">
            Continue with Google
          </span>
        </button>

      </div>
    </div>
  );
}

export default Login;