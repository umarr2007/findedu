import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    media: '',
    image: '',
    categoryId: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchResources();
    fetchCategories();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://findcourse.net.uz/api/resources');
      if (response.data && response.data.data) {
        const newResourcesIds = JSON.parse(localStorage.getItem('newResourcesIds') || '[]');
        
        const resourcesWithNewFlag = response.data.data.map(resource => ({
          ...resource,
          isNew: newResourcesIds.includes(resource.id)
        }));
        
        setResources(resourcesWithNewFlag);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Resurslarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://findcourse.net.uz/api/categories');
      if (response.data && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const openModal = () => {
    setFormData({
      name: '',
      description: '',
      media: '',
      image: '',
      categoryId: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      description: '',
      media: '',
      image: '',
      categoryId: ''
    });
  };

  const openDeleteModal = (resource) => {
    setSelectedResource(resource);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedResource(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Resurs qo\'shish uchun avval tizimga kiring');
      return;
    }

    if (!formData.name.trim() || !formData.categoryId) {
      setError('Resurs nomi va kategoriyasi to\'ldirilishi shart');
      return;
    }

    try {
      setError(null);
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        media: formData.media.trim() || '',
        image: formData.image.trim() || '',
        categoryId: Number(formData.categoryId)
      };

      const response = await axios.post(
        'https://findcourse.net.uz/api/resources',
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data && response.data.data) {
        const newResource = { ...response.data.data, isNew: true };
        
        const newResourcesIds = JSON.parse(localStorage.getItem('newResourcesIds') || '[]');
        newResourcesIds.push(newResource.id);
        localStorage.setItem('newResourcesIds', JSON.stringify(newResourcesIds));
        
        setResources(prevResources => [...prevResources, newResource]);
        closeModal();
        setTimeout(fetchResources, 1000);
      }
    } catch (err) {
      console.error('Error adding resource:', err);
      
      if (err.response?.status === 401) {
        if (err.response?.data?.message === 'Unauthenticated.') {
          alert('Sessiya muddati tugagan. Iltimos, qaytadan kiring');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          setError('Avtorizatsiya xatosi. Iltimos, qaytadan kiring');
        }
      } else if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        if (validationErrors) {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`);
          setError(errorMessages.join('\n'));
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Ma\'lumotlar noto\'g\'ri formatda');
        }
      } else {
        setError('Resurs qo\'shishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring');
      }
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Resursni o\'chirish uchun avval tizimga kiring');
      return;
    }

    try {
      setError(null);
      await axios.delete(
        `https://findcourse.net.uz/api/resources/${selectedResource.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const newResourcesIds = JSON.parse(localStorage.getItem('newResourcesIds') || '[]');
      const updatedNewResourcesIds = newResourcesIds.filter(id => id !== selectedResource.id);
      localStorage.setItem('newResourcesIds', JSON.stringify(updatedNewResourcesIds));

      setResources(prevResources => 
        prevResources.filter(resource => resource.id !== selectedResource.id)
      );
      closeDeleteModal();
      setTimeout(fetchResources, 1000);
    } catch (err) {
      console.error('Error deleting resource:', err);
      
      if (err.response?.status === 401) {
        if (err.response?.data?.message === 'Unauthenticated.') {
          alert('Sessiya muddati tugagan. Iltimos, qaytadan kiring');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          setError('Avtorizatsiya xatosi. Iltimos, qaytadan kiring');
        }
      } else {
        setError('Resursni o\'chirishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring');
      }
    }
  };

  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(resource => resource.categoryId === Number(selectedCategory));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Yopish</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Resurslar</h1>
        <button
          onClick={openModal}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          + Yangi resurs
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kategoriya bo'yicha filtrlash
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">Barcha kategoriyalar</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{resource.name}</h3>
                  {resource.category && (
                    <span className="inline-block mt-1 px-2 py-1 text-sm bg-purple-100 text-purple-800 rounded">
                      {resource.category.name}
                    </span>
                  )}
                </div>
                {resource.isNew && (
                  <button
                    onClick={() => openDeleteModal(resource)}
                    className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                    title="O'chirish"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              {resource.description && (
                <p className="text-gray-600 mb-4">{resource.description}</p>
              )}
              {resource.image && (
                <img 
                  src={resource.image} 
                  alt={resource.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              {resource.media && (
                <a 
                  href={resource.media}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800"
                >
                  Resursni ko'rish
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {isDeleteModalOpen && selectedResource && (
        <div className="fixed inset-0 bg-[#fff] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Resursni o'chirish
                </h2>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Siz ushbu resursni o'chirishni istaysizmi? Bu amalni bekor qilib bo'lmaydi.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#a9a5a5] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Yangi resurs qo'shish
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resurs nomi
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Kategoriyani tanlang</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tavsif
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Media URL
                  </label>
                  <input
                    type="text"
                    value={formData.media}
                    onChange={(e) => setFormData({ ...formData, media: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Media URL sini kiriting"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rasm URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Rasm URL sini kiriting"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Qo'shish
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources; 