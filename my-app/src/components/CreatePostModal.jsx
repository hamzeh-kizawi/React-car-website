import React, { useState, useContext, useEffect } from 'react';
import { CarContext } from '../contexts/CarContext';
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';
import '../css/CreatePostModal.css'; 

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { cars } = useContext(CarContext);
  const { user } = useAuth();

  const [selectedCarId, setSelectedCarId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedCarId(cars.length > 0 ? cars[0]?.id || '' : '');
      setTitle('');
      setContent('');
      setError('');
    }
  }, [isOpen, cars]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!selectedCarId) {
      setError('Please select a car.');
      setIsSubmitting(false);
      return;
    }
    if (!content.trim()) {
      setError('Content cannot be empty.');
      setIsSubmitting(false);
      return;
    }

    const csrfToken = Cookies.get('csrf_access_token');

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({
          car_id: selectedCarId,
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      onPostCreated(data.post);
      onClose();

    } catch (err) {
      console.error('Failed to create post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay-create-post">
      <div className="modal-content-create-post">
        <h2>Create New Discussion Post</h2>
        <button className="modal-close-btn" onClick={onClose} disabled={isSubmitting}>
          &times;
        </button>

        {cars.length === 0 && !isSubmitting && (
          <p className="error-message">Cannot create post: No cars available in the inventory.</p>
        )}

        {cars.length > 0 && (
          <form onSubmit={handleSubmit}>
            <div className="form-group-create-post">
              <label htmlFor="carSelect">Select Car:*</label>
              <select
                id="carSelect"
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="" disabled={selectedCarId !== ""}>-- Select a Car --</option>
                {cars.map((car) => {
                  const displayName = car.name && car.brand && car.name.toLowerCase().startsWith(car.brand.toLowerCase())
                    ? car.name
                    : `${car.brand || ''} ${car.name || ''}`.trim();
                  return (
                    <option key={car.id} value={car.id}>
                      {displayName} ({car.model_year})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group-create-post">
              <label htmlFor="postTitle">Title (Optional):</label>
              <input
                type="text"
                id="postTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your discussion"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group-create-post">
              <label htmlFor="postContent">Your Message:*</label>
              <textarea
                id="postContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to discuss or ask about this car?"
                rows="6"
                required
                disabled={isSubmitting}
              ></textarea>
            </div>

            {error && <p className="error-message-form">{error}</p>}

            <button type="submit" className="submit-post-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Create Post'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreatePostModal;