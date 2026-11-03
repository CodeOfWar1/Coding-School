import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../state/AuthContext";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import logoImage from "../assets/logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      const role = user?.profile?.role;

      if (role === "student") {
        navigate("/dashboard/student", { replace: true });
      } else if (role === "parent") {
        navigate("/dashboard/parent", { replace: true });
      } else if (role === "admin") {
        navigate("/dashboard/admin", { replace: true });
      } else if (role === "teacher") {
        navigate("/dashboard/teacher", { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const loggedUser = data?.user;

    if (loggedUser && !loggedUser.email_confirmed_at) {
      setError("Please verify your email before logging in.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full relative">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logoImage} alt="Logo" className="h-20 w-auto" />
          </div>
          <p className="mt-2 text-gray-500">
            Welcome back! Please sign in to continue
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  placeholder="anvilcodingacardemy@gmail.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  placeholder="********"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-sm text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#faa853] text-white rounded-xl font-semibold hover:bg-[#e89235] transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : (
                <>
                  Sign In <FaArrowRight />
                </>
              )}
            </button>

            <div className="text-center">
              <Link to="/" className="text-[#faa853] font-semibold">
                Register Now
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}