import React, { useState, useContext } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '../contexts/AuthContext';
import '../css/AddCommentForm.css'; 

const AddCommentForm = ({ postId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    if (!user || user.username === "Guest") {
      setError('You must be logged in as a registered user to comment.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const csrfToken = Cookies.get('csrf_access_token');

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      onCommentAdded(data.comment); 
      setContent(''); 
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError(err.message || 'Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!user || user.username === "Guest") {
    return (
      <div className="add-comment-login-prompt">
        <p>Please <a href="/login">login</a> as a registered user to add a comment.</p>
      </div>
    );
  }


  return (
    <form onSubmit={handleSubmit} className="add-comment-form">
      <h3>Leave a Comment</h3>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment here..."
        rows="4"
        disabled={isSubmitting}
        required
      />
      {error && <p className="error-message-comment-form">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Post Comment'}
      </button>
    </form>
  );
};

export default AddCommentForm;