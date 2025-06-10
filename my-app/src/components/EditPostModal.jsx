import React, { useState, useContext, useEffect } from 'react';
import { CarContext } from '../contexts/CarContext';
import Cookies from 'js-cookie';
import '../css/CreatePostModal.css'; 

const EditPostModal = ({ isOpen, onClose, postToEdit, onPostUpdated }) => {
  const { cars } = useContext(CarContext);

  const [selectedCarId, setSelectedCarId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && postToEdit) {
      setSelectedCarId(postToEdit.car_id || (cars.length > 0 ? cars[0]?.id || '' : ''));
      setTitle(postToEdit.title || '');
      setContent(postToEdit.content || '');
      setError('');
    }
  }, [isOpen, postToEdit, cars]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!selectedCarId) {
      setError('Please select a car');
      setIsSubmitting(false);
      return;
    }
    if (!content.trim()) {
      setError('Content cannot be empty');
      setIsSubmitting(false);
      return;
    }

    const csrfToken = Cookies.get('csrf_access_token');
    if (!csrfToken) {
        setError('CSRF token not found. Please re-login');
        setIsSubmitting(false);
        return;
    }

    const updatedPostData = {
        car_id: selectedCarId,
        title: title.trim(),
        content: content.trim(),
    };

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postToEdit.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(updatedPostData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      onPostUpdated(data.post); 
      onClose(); 

    } catch (err) {
      console.error('Failed to update post:', err);
      setError(err.message || 'Failed to update post. Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !postToEdit) { 
    return null;
  }

  return (
    <div className="modal-overlay-create-post">
      <div className="modal-content-create-post">
        <h2>Edit Discussion Post</h2>
        <button className="modal-close-btn" onClick={onClose} disabled={isSubmitting}>
          &times;
        </button>

        {cars.length === 0 && (
            <p className="error-message">Cannot edit post: No cars available in the inventory for selection.</p>
        )}

        {cars.length > 0 && (
            <form onSubmit={handleSubmit}>
            <div className="form-group-create-post">
                <label htmlFor="editCarSelect">Select Car:*</label>
                <select
                id="editCarSelect"
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(e.target.value)}
                required
                disabled={isSubmitting}
                >
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
                <label htmlFor="editPostTitle">Title (Optional):</label>
                <input
                type="text"
                id="editPostTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your discussion"
                disabled={isSubmitting}
                />
            </div>

            <div className="form-group-create-post">
                <label htmlFor="editPostContent">Your Message:*</label>
                <textarea
                id="editPostContent"
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
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default EditPostModal;