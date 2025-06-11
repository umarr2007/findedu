import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await fetch(
        "https://findcourse.net.uz/api/users/mydata",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("API response:", data);

      if (response.ok) {
        const userData = {
          firstName: data.firstName || data.data?.firstName,
          lastName: data.lastName || data.data?.lastName,
          email: data.email || data.data?.email,
          role: data.role || data.data?.role,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        console.log("Token noto'g'ri yoki muddati tugagan");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        // Foydalanuvchini login sahifasiga yo'naltirish
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    } catch (err) {
      console.error("Xatolik:", err);
      // Xatolik bo'lsa ham token va user ma'lumotlarini tozalash
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setShowDropdown(false);
    navigate("/");
  };

  const handleProfileEdit = () => {
    setShowDropdown(false);
    navigate("/profile");
  };

  return (
    <header className="mt-[20px]">
      <div className="container max-w-[1440px] mx-auto px-4">
        <div className="flex bg-[#fff]  items-center justify-between flex-wrap relative">
          <div className="text-2xl font-bold text-zinc-900">Logo</div>

          <nav className="hidden md:flex gap-8 text-zinc-700 font-medium">
            <Link to="/" className="hover:text-blue-600 transition">
              Bosh sahifa
            </Link>
           
            <Link to="/about" className="hover:text-blue-600 transition">Biz haqimizda</Link>
            <Link to="/resources" className="hover:text-blue-600 transition">Resurslar</Link>
            <Link to="/liked" className="hover:text-blue-600 transition">Sevimlilar</Link>
          </nav>

          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            <select className="border border-zinc-300 rounded px-2 py-1 text-sm">
              <option value="uz">UZ</option>
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>

            {user ? (
              <div className="relative">
                <div
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <img className="w-[30px]" src="/user.png" alt="User" />
                    <span className="text-sm text-zinc-700 font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                </div>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                    <div className="px-4 py-2 border-b text-sm text-zinc-700">
                      {user.firstName} {user.lastName}
                    </div>
                    <button
                      onClick={handleProfileEdit}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Profilni tahrirlash
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                    >
                      Tizimdan chiqish
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="px-4 py-1 text-sm border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition"
                >
                  Kirish
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
