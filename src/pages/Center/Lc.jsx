import React, { useEffect, useState } from "react";
import CenterDetail from "./CenterDetail";
import axios from "axios";
import { Link } from "react-router-dom";

const Lc = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    fetchCenters();
    fetchRegions();
  }, []);

  const fetchCenters = async () => {
    try {
      console.log("Fetching centers...");
      const response = await axios.get("https://findcourse.net.uz/api/centers");
      console.log("API Response:", response);
      
      if (!response.data) {
        throw new Error("API javobida ma'lumot yo'q");
      }
      
      if (response.data.data) {
        setCenters(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCenters(response.data);
      } else {
        console.error("Kutilmagan API javob formati:", response.data);
        throw new Error("Kutilmagan API javob formati");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching centers:", err);
      if (err.response) {
        if (err.response.status === 500) {
          setError("Serverda ichki xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
        } else {
          setError(`Server xatoligi (${err.response.status}): ${err.response.data?.message || 'Noma\'lum xatolik'}`);
        }
      } else if (err.request) {
        setError("Server javob bermayapti. Internet ulanishni tekshiring.");
      } else {
        setError("Markazlarni yuklashda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
      }
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      console.log("Fetching regions...");
      const response = await axios.get('https://findcourse.net.uz/api/regions/search');
      console.log("Regions Response:", response.data);
      setRegions(response.data.data);
      setError(null);
    } catch (err) {
      setError('Ma\'lumotlarni yuklashda xatolik yuz berdi');
      console.error('Error fetching regions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const getFilteredCenters = () => {
    console.log("Selected Region:", selectedRegion);
    console.log("Available Centers:", centers);
    console.log("Available Regions:", regions);

    return centers.filter(center => {
      const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          center.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Viloyat bo'yicha filtrlash
      let matchesRegion = true;
      if (selectedRegion !== 'all') {
        // Markazning viloyatini tekshirish
        const centerRegion = regions.find(region => 
          region.centers && region.centers.some(c => c.id === center.id)
        );
        console.log("Center:", center.name, "Region:", centerRegion?.name);
        matchesRegion = centerRegion && centerRegion.name === selectedRegion;
      }
      
      return matchesSearch && matchesRegion;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  const filteredCenters = getFilteredCenters();
  console.log("Filtered Centers:", filteredCenters);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">O'quv Markazlari</h1>
      
      {/* Qidiruv */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Markaz nomi yoki manzilini kiriting..."
          className="w-full p-4 pl-12 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white shadow-sm"
        />
      </div>

      {/* Viloyatlar */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedRegion('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            selectedRegion === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Barcha viloyatlar
        </button>
        {regions.map((region) => (
          <button
            key={region.id}
            onClick={() => setSelectedRegion(region.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              selectedRegion === region.name
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {region.name}
          </button>
        ))}
      </div>

      {/* Markazlar ro'yxati */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCenters.map((center) => (
          <div key={center.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              {center.image ? (
                <img
                  src={`https://findcourse.net.uz/image/${center.image}`}
                  alt={center.name || "Markaz rasmi"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  Rasm mavjud emas
                </div>
              )}
            </div>

            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {center.name}
              </h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 text-purple-500"
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
                  <span className="text-sm">
                    {typeof center?.address === "string"
                      ? center.address
                      : JSON.stringify(center.address) || "Manzil mavjud emas"}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 text-purple-500"
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
                  <span className="text-sm">
                    {typeof center?.phone === "string"
                      ? center.phone
                      : JSON.stringify(center.phone) || "Telefon raqam mavjud emas"}
                  </span>
                </div>
              </div>

              <Link
                to={`/center/${center?.id}`}
                className="block w-full text-center py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Batafsil
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lc;
