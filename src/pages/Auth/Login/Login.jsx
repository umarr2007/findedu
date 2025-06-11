import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // har safar bosilganda xato tozalansin

    try {
      const response = await fetch(
        "https://findcourse.net.uz/api/users/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Server noto'g'ri javob berdi:", text);
        setError("Server noto'g'ri formatda javob berdi");
        return;
      }

      console.log("Login javobi:", data);

      if (response.ok && data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        navigate("/"); // reload keraksiz
      } else {
        setError(data?.message || data?.error || "Email yoki parol noto‘g‘ri");
      }
    } catch (err) {
      console.error("Login xatosi:", err);
      setError("Tarmoqqa ulanishda xatolik yuz berdi");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Tizimga kirish
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email manzil
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Email manzilingizni kiriting"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Parol
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Parolingizni kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-5 justify-center">
            <h3>Hisobingiz yo'qmi?</h3>
            <Link to="/register" className="text-blue-600 hover:underline">
              Ro'yxatdan o'tish
            </Link>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Kirish
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
