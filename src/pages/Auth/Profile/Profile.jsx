import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    // if (!token) {
    //   navigate("/login");
    //   return;
    // }

    const fetchUserData = async () => {
      try {
        const response = await fetch(
          "https://findcourse.net.uz/api/users/mydata",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(
            data.message ||
              "Foydalanuvchi ma'lumotlarini olishda xatolik yuz berdi"
          );
          throw new Error("Xatolik");
        }

        const userData = {
          id: data.id || data.data?.id || "",
          firstName: data.firstName || data.data?.firstName || "",
          lastName: data.lastName || data.data?.lastName || "",
          email: data.email || data.data?.email || "",
          phone: data.phone || data.data?.phone || "",
          role: data.role || data.data?.role || "",
        };

        setUser(userData);
        setEditUser({
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
        });
      } catch (err) {
        console.error("Xatolik:", err);
        // navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Token mavjud emas, iltimos qayta kiring");
      // navigate("/login");
      return;
    }

    if (!user?.id) {
      toast.error("Foydalanuvchi ID topilmadi");
      return;
    }

    if (!editUser.firstName || !editUser.lastName || !editUser.phone) {
      toast.error("Barcha maydonlar to'ldirilishi shart");
      return;
    }

    

    try {
      const response = await fetch(
        `https://findcourse.net.uz/api/users/${user?.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editUser),
        }
      );

      const data = await response.json();
      

      if (response.ok) {
        const updatedUser = {
          ...user,
          firstName: editUser.firstName,
          lastName: editUser.lastName,
          phone: editUser.phone,
        };
        setUser(updatedUser);
        setEditUser(updatedUser);

        toast.success(" Ma'lumotlar muvaffaqiyatli saqlandi");

        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        toast.error(data.message || " Saqlashda xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Xatolik:", err);
      toast.error(" Serverda xatolik yuz berdi");
    }
  };

  if (!user) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Profil ma'lumotlari</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ism
              </label>
              <input
                type="text"
                value={editUser.firstName}
                onChange={(e) =>
                  setEditUser({ ...editUser, firstName: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Familiya
              </label>
              <input
                type="text"
                value={editUser.lastName}
                onChange={(e) =>
                  setEditUser({ ...editUser, lastName: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (o‘zgartirib bo‘lmaydi)
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="text"
                value={editUser.phone}
                onChange={(e) =>
                  setEditUser({ ...editUser, phone: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <input
                type="text"
                value={user.role}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
