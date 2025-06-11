import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Comments from "../../components/Comments/Comments";

const CenterDetail = () => {
  const { id } = useParams();
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    courses: false,
    teachers: false,
    schedule: false,
    facilities: false,
  });

  useEffect(() => {
    const fetchCenter = async () => {
      try {
        const response = await axios.get(
          `https://findcourse.net.uz/api/centers/${id}`
        );
        console.log("API Response:", response.data);

        if (response.data && response.data.data) {
          setCenter(response.data.data);
        } else {
          setError("Markaz ma'lumotlari topilmadi");
        }
      } catch (err) {
        console.error("Error fetching center:", err);
        setError("Markaz ma'lumotlarini yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCenter();
    }
  }, [id]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">Markaz ma'lumotlari topilmadi</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-64 md:h-96">
          {center.image ? (
            <img
              src={`https://findcourse.net.uz/image/${center.image}`}
              alt={center.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              Rasm mavjud emas
            </div>
          )}
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {center.name}
          </h1>

          {/* Asosiy ma'lumotlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              {/* Manzil */}
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-purple-500 mt-1 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Manzil
                  </h3>
                  <p className="text-gray-600">
                    {center.address || "Manzil mavjud emas"}
                  </p>
                </div>
              </div>

              {/* Telefon */}
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-purple-500 mt-1 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Telefon
                  </h3>
                  <p className="text-gray-600">
                    {center.phone || "Telefon raqam mavjud emas"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tavsif */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tavsif
              </h3>
              <p className="text-gray-600 whitespace-pre-line">
                {center.description || "Tavsif mavjud emas"}
              </p>
            </div>
          </div>

          {/* Batafsil ma'lumotlar */}
          <div className="space-y-6">
            {/* Kurslar */}
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("courses")}
                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900">Kurslar</h3>
                <svg
                  className={`w-6 h-6 transform transition-transform ${
                    expandedSections.courses ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {expandedSections.courses && (
                <div className="p-6 bg-white">
                  {center.courses && center.courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {center.courses.map((course, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900">
                            {course.name}
                          </h4>
                          <p className="text-gray-600 mt-2">
                            {course.description}
                          </p>
                          <p className="text-purple-600 mt-2">
                            Narxi: {course.price}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Kurslar mavjud emas</p>
                  )}
                </div>
              )}
            </div>

            {/* Dars jadvali */}
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("schedule")}
                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  Dars jadvali
                </h3>
                <svg
                  className={`w-6 h-6 transform transition-transform ${
                    expandedSections.schedule ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {expandedSections.schedule && (
                <div className="p-6 bg-white">
                  {center.schedule && center.schedule.length > 0 ? (
                    <div className="space-y-4">
                      {center.schedule.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900">
                            {item.course}
                          </h4>
                          <p className="text-gray-600 mt-2">
                            {item.day} - {item.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Dars jadvali mavjud emas</p>
                  )}
                </div>
              )}
            </div>

            {/* Imkoniyatlar */}
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("facilities")}
                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  Imkoniyatlar
                </h3>
                <svg
                  className={`w-6 h-6 transform transition-transform ${
                    expandedSections.facilities ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {expandedSections.facilities && (
                <div className="p-6 bg-white">
                  {center.facilities && center.facilities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {center.facilities.map((facility, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <svg
                            className="w-6 h-6 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-gray-600">{facility}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Imkoniyatlar mavjud emas</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Izohlar */}
          <div className="mt-8">
            <Comments centerId={id} />
          </div>

          {/* Orqaga qaytish */}
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Orqaga qaytish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterDetail;
