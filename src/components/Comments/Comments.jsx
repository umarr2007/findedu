import React, { useState, useEffect } from "react";
import axios from "axios";

const Comments = ({ centerId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(5);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); 

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token) {
        setIsAuthenticated(true);
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            if (parsedUser && parsedUser.id) {
              setUser(parsedUser);
            } else {
              console.error("User data incomplete or invalid in localStorage");
              setUser(null); 
            }
          } catch (err) {
            console.error("User data parse error:", err);
            setUser(null); 
          }
        } else {
          // Token bor, lekin user data yo'q
          console.warn("Token found, but user data missing in localStorage");
          setUser(null); 
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null); 
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `https://findcourse.net.uz/api/comments`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      if (res.data?.data) {
        const filtered = res.data.data.filter(
          (c) => parseInt(c.centerId) === parseInt(centerId)
        );

        setComments(filtered);
      } else {
        console.warn(
          "API returned unexpected data format for comments:",
          res.data
        );
        setComments([]); 
      }
    } catch (err) {
      console.error("Commentlarni yuklashda xato:", err);
      if (err.response?.status === 401) {
        setError("Avtorizatsiya muddati tugagan. Iltimos, qaytadan kiring.");
        setIsAuthenticated(false);
        setUser(null);
       
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } else if (err.message === "Network Error") {
        setError(
          "Server bilan bog'lanishda xatolik. Internet ulanishingizni tekshiring."
        );
      } else {
        setError("Izohlarni yuklashda xatolik yuz berdi.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (centerId) {
      fetchComments();
    }
  }, [centerId]); 
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError("Izoh matni bo'sh bo'lmasligi kerak.");
      return;
    }
    if (!isAuthenticated) {
      setError("Izoh qo'shish uchun tizimga kiring.");
      return;
    }
    if (!user || !user.id) {
      setError(
        "Foydalanuvchi ma'lumotlari topilmadi. Iltimos, qaytadan kiring."
      );
      // Token bo'lishi mumkin, lekin user state'i bo'sh bo'lsa shu xabar chiqadi
      return;
    }

    try {
      setError(null); 
      const token = localStorage.getItem("token");

      
      if (!token) {
        setError("Avtorizatsiya talab qilinadi. Iltimos, tizimga kiring.");
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return;
      }

      const data = {
        text: newComment,
        star: rating,
        centerId: parseInt(centerId),
      };

      const res = await axios.post(
        `https://findcourse.net.uz/api/comments`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );


      if (res.data?.data) {
  
        const newCommentWithUser = {
          ...res.data.data,
 
          user: res.data.data.user
            ? res.data.data.user
            : {
                firstName: user.firstName,
                lastName: user.lastName,
                id: user.id,
              },
        };

        setComments((prevComments) => [...prevComments, newCommentWithUser]);
        setNewComment(""); 
        setRating(5); 
        setError(null); 
      } else {
        console.warn(
          "API returned unexpected data format after adding comment:",
          res.data
        );
        setError(
          "Izoh qo'shildi, lekin ma'lumotlarni yangilashda xatolik yuz berdi."
        );
        fetchComments();
      }
    } catch (err) {
      console.error("Comment qo'shishda xato:", err);
      if (err.response?.status === 401) {
        setError("Avtorizatsiya muddati tugagan. Iltimos, qaytadan kiring.");
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } else if (err.response?.data?.message) {
        setError(`Xato: ${err.response.data.message}`);
      } else if (err.message === "Network Error") {
        setError(
          "Server bilan bog'lanishda xatolik. Internet ulanishingizni tekshiring."
        );
      } else {
        setError(
          "Izoh qo'shishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
        );
      }
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) {
      setError("Izoh matni bo'sh bo'lmasligi kerak");
      return;
    }
    if (!isAuthenticated) {
      setError("Izohni tahrirlash uchun tizimga kiring.");
      return;
    }
    if (!user || !user.id) {
      setError(
        "Foydalanuvchi ma'lumotlari topilmadi. Iltimos, qaytadan kiring."
      );
      return;
    }

    try {
      setError(null); // Yangi operatsiya oldidan xatolikni tozalash
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Avtorizatsiya talab qilinadi. Iltimos, tizimga kiring.");
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return;
      }

      const res = await axios.put(
        `https://findcourse.net.uz/api/comments/${commentId}`,
        { text: editText, star: rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.data) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
   
            comment.id === commentId
              ? { ...res.data.data, user: comment.user ? comment.user : user }
              : comment
          )
        );
        setEditingComment(null); 
        setEditText(""); 
        setError(null); 
      } else {
        console.warn(
          "API returned unexpected data format after editing comment:",
          res.data
        );
        setError(
          "Izoh tahrirlandi, lekin ma'lumotlarni yangilashda xatolik yuz berdi."
        );
        fetchComments();
      }
    } catch (err) {
      console.error("Commentni tahrirlashda xato:", err);
      if (err.response?.status === 401) {
        setError("Avtorizatsiya muddati tugagan. Iltimos, qaytadan kiring.");
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } else if (err.response?.data?.message) {
        setError(`Xato: ${err.response.data.message}`);
      } else if (err.message === "Network Error") {
        setError(
          "Server bilan bog'lanishda xatolik. Internet ulanishingizni tekshiring."
        );
      } else {
        setError("Izohni tahrirlashda xatolik yuz berdi");
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated) {
      setError("Izohni o'chirish uchun tizimga kiring.");
      return;
    }
    if (!user || !user.id) {
      setError(
        "Foydalanuvchi ma'lumotlari topilmadi. Iltimos, qaytadan kiring."
      );
      return;
    }

    try {
      setError(null); // Yangi operatsiya oldidan xatolikni tozalash
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Avtorizatsiya talab qilinadi. Iltimos, tizimga kiring.");
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return;
      }

    
      const commentToDelete = comments.find((c) => c.id === commentId);
      if (!commentToDelete) {
        console.warn(
          "O'chirmoqchi bo'lgan izoh ro'yxatda topilmadi:",
          commentId
        );
        setError("O'chirmoqchi bo'lgan izoh topilmadi.");
        return;
      }
      if (commentToDelete.user?.id !== user.id) {
        setError("Siz ushbu izohni o'chirish huquqiga ega emassiz.");
        return;
      }

      await axios.delete(
        `https://findcourse.net.uz/api/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Kommentni ro'yxatdan olib tashlash
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
      setError(null); // Muvaffaqiyatli bo'lsa xatolikni tozalash
    } catch (err) {
      console.error("Commentni o'chirishda xato:", err);
      if (err.response?.status === 401) {
        setError("Avtorizatsiya muddati tugagan. Iltimos, qaytadan kiring.");
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } else if (err.response?.data?.message) {
        setError(`Xato: ${err.response.data.message}`);
      } else if (err.message === "Network Error") {
        setError(
          "Server bilan bog'lanishda xatolik. Internet ulanishingizni tekshiring."
        );
      } else {
        setError("Izohni o'chirishda xatolik yuz berdi");
      }
    }
  };

  // Yulduzchalarni ko'rsatish
  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "span"}
            onClick={interactive ? () => onStarClick(star) : undefined}
            className={`focus:outline-none transition-colors duration-200 ${
              interactive ? "hover:scale-110" : ""
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Izohlar</h3>

      {isAuthenticated ? (
        <form onSubmit={handleAddComment} className="space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-700">Baholash:</span>
            {renderStars(rating, true, setRating)}
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Izohingizni yozing..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows="3"
            required 
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Izoh qo'shish
          </button>
        </form>
      ) : (
        // Tizimga kirish taklifi (agar authenticated bo'lmasa)
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">
            Izoh qoldirish uchun iltimos,{" "}
            <a
              href="/login"
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              tizimga kiring
            </a>
          </p>
        </div>
      )}

      {/* Kommentlar ro'yxati */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border rounded-lg p-4 shadow-sm" // Style qo'shildi
            >
              {/* Tahrirlash formasi (agar tahrirlash rejimida bo'lsa) */}
              {editingComment === comment.id ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-gray-700">Baholash:</span>
                    {renderStars(rating, true, setRating)}
                  </div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                    required // Matn maydoni bo'sh bo'lmasligi uchun required qo'shildi
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" // Style qo'shildi
                    >
                      Saqlash
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditText("");
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2" // Style qo'shildi
                    >
                      Bekor qilish
                    </button>
                  </div>
                </div>
              ) : (
                // Kommentni ko'rsatish
                <>
                  <div className="flex justify-between items-start">
                    {" "}
                    {/* items-start qo'shildi */}
                    <div>
                      {/* Foydalanuvchi ismi va familiyasini ko'rsatish */}
                      <p className="font-semibold text-gray-900">
                        {" "}
                        {/* Style qo'shildi */}
                        {comment.user?.firstName} {comment.user?.lastName}
                      </p>
                      {/* Comment vaqtini ko'rsatish */}
                      <p className="text-sm text-gray-500">
                        {" "}
                        {/* Style qo'shildi */}
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                      {/* Yulduzchalarni ko'rsatish */}
                      <div className="mt-1">
                        {renderStars(comment.star)}
                      </div>{" "}
                      {/* my-1 qo'shildi */}
                    </div>
                    {/* Edit va Delete tugmalari (agar foydalanuvchi o'z kommenti bo'lsa va authenticated bo'lsa) */}
                    {isAuthenticated &&
                      user &&
                      comment.user &&
                      user.id === comment.user.id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingComment(comment.id);
                              setEditText(comment.text);
                              setRating(comment.star);
                            }}
                            className="text-blue-600 hover:underline hover:text-blue-700" // Style qo'shildi
                          >
                            Tahrirlash
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:underline hover:text-red-700" // Style qo'shildi
                          >
                            O'chirish
                          </button>
                        </div>
                      )}
                  </div>
                  {/* Komment matni */}
                  <p className="mt-2 text-gray-600">{comment.text}</p>{" "}
                  {/* Style qo'shildi */}
                </>
              )}
            </div>
          ))
        ) : (
          // Izohlar mavjud bo'lmasa
          <div className="text-center py-4 text-gray-500">
            {" "}
            {/* Style qo'shildi */}
            Hozircha izohlar mavjud emas
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
