// Register.jsx umar
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!formData.firstName.trim())
        return setError("Ism maydoni to'ldirilmagan");
      if (!formData.lastName.trim())
        return setError("Familiya maydoni to'ldirilmagan");
      if (!formData.email.trim())
        return setError("Email maydoni to'ldirilmagan");
      if (!formData.phone.trim())
        return setError("Telefon raqam maydoni to'ldirilmagan");
      if (!formData.password) return setError("Parol maydoni to'ldirilmagan");
      if (!formData.role) return setError("Rol tanlanmagan");

      const response = await fetch(
        "https://findcourse.net.uz/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            image: "https://openclipart.org/image/2000px/247319",
          }),
        }
      );

      const data = await response.json();
      console.log("Register response data:", data);
      if (!response.ok)
        throw new Error(
          data.message || "Ro'yxatdan o'tishda xatolik yuz berdi"
        );

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", formData.email.trim());

      const otpRes = await fetch(
        "https://findcourse.net.uz/api/users/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({ email: formData.email.trim() }),
        }
      );

      const otpData = await otpRes.json();
      if (!otpRes.ok)
        throw new Error(otpData.message || "OTP yuborishda xatolik yuz berdi");

      navigate("/verifyotp");
    } catch (err) {
      console.error("Xatolik:", err);
      setError(err.message || "Noma'lum xatolik yuz berdi");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded shadow">
        <h2 className="text-center text-2xl font-bold text-gray-800">
          Ro'yxatdan o'tish
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Ismingiz"
            required
          />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Familiyangiz"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Email manzil"
            required
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Telefon raqam"
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="USER">USER</option>
            <option value="ADMIN">CEO</option>
          </select>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Parol"
            required
          />

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Ro'yxatdan o'tish
          </button>

          <div className="text-center mt-4">
            <span>Akkauntingiz bormi? </span>
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
