import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CommentItem from '../components/CommentItem';
import AddCommentForm from '../components/AddCommentForm';
import EditPostModal from '../components/EditPostModal'; 
import Cookies from 'js-cookie';
import '../css/PostDetailPage.css'; 

const PostDetailPage = () => {
  const { postId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');
  
  const [showEditPostModal, setShowEditPostModal] = useState(false); 

  const fetchPostDetails = async () => {
    setIsLoading(true);
    setActionError(''); 
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`);
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        if (response.status === 404) {
          errorMsg = "Post not found.";
        } else {
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch (e) { /* ignore */ }
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setPost(data);
    } catch (err) {
      console.error(`Failed to fetch post ${postId}:`, err);
      setError(err.message || 'Failed to load post details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
    }
  }, [postId]);

  const handleBackToDiscussions = () => {
    navigate('/discussions');
  };

  const getDisplayCarName = (postData) => {
    if (!postData) return '';
    return postData.car_name && postData.brand && postData.car_name.toLowerCase().startsWith(postData.brand.toLowerCase())
      ? postData.car_name
      : `${postData.brand || ''} ${postData.car_name || ''}`.trim();
  };

  const handleCommentAdded = (newComment) => {
    setPost(prevPost => ({
      ...prevPost,
      comments: [...(prevPost.comments || []), newComment],
    }));
  };

  const handleEditPostClick = () => { 
    setActionError('');
    if (post && user && user.id === post.user_id) { 
        setShowEditPostModal(true);
    } else {
        alert("You cannot edit this post or post data is not loaded.");
    }
  };
  
  const handlePostUpdated = (updatedPostData) => {
    setPost(updatedPostData); 
    setShowEditPostModal(false);
    alert("Post updated successfully!"); 
  };

  const handleDeletePost = async () => {
    setActionError(''); 
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }
    const csrfToken = Cookies.get('csrf_access_token');
    if (!csrfToken) {
        setActionError("CSRF token not found. Please try logging in again.");
        alert("Action cannot be performed. Missing CSRF token. Please re-login.");
        return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRF-TOKEN': csrfToken, },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      alert("Post deleted successfully!");
      navigate('/discussions');
    } catch (err) {
      console.error('Failed to delete post:', err);
      setActionError(err.message || 'Failed to delete post. Please try again.');
      alert(`Error deleting post: ${err.message || 'Please try again.'}`);
    }
  };

  if (authLoading || (isLoading && !post) ) {
    return (
      <div className="post-detail-page-container loading-container">
        <button onClick={handleBackToDiscussions} className="back-to-discussions-btn">
          &larr; Back to Discussions
        </button>
        <p className="loading-message-detail">Loading post details...</p>
      </div>
    );
  }

  if (error) { 
    return (
      <div className="post-detail-page-container error-container">
        <button onClick={handleBackToDiscussions} className="back-to-discussions-btn">
          &larr; Back to Discussions
        </button>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!post) { 
    return (
      <div className="post-detail-page-container error-container">
        <button onClick={handleBackToDiscussions} className="back-to-discussions-btn">
          &larr; Back to Discussions
        </button>
        <p className="no-post-found-message">Post not found.</p>
      </div>
    );
  }

  const displayCarName = getDisplayCarName(post);
  const isAuthor = user && post && user.id === post.user_id;

  return (
    <div className="post-detail-page-container">
      <div className="post-detail-navigation">
        <button onClick={handleBackToDiscussions} className="back-to-discussions-btn">
          &larr; Back to Discussions
        </button>
        {isAuthor && (
          <div className="post-actions">
            <button onClick={handleEditPostClick} className="edit-post-btn">Edit Post</button>
            <button onClick={handleDeletePost} className="delete-post-btn">Delete Post</button>
          </div>
        )}
      </div>

      {actionError && <p className="error-message action-error-message">{actionError}</p>}

      <div className="post-content-area-flex">
        {post.car_image && (
          <div className="post-detail-car-image-container">
            <img src={post.car_image} alt={displayCarName} className="post-detail-car-image-left" />
          </div>
        )}
        <div className="post-detail-text-container">
          <div className="post-header-section">
            <h1 className="post-title-main">{post.title || `Discussion: ${displayCarName}`}</h1>
            <div className="post-meta-top-right">
              <span>Posted: {new Date(post.created_at).toLocaleString()}</span>
            </div>
          </div>
          <div className="post-meta-subheader">
            <span>By: <span className="post-author-username">{post.username}</span></span>
            <span>About: <span className="post-detail-carname">{displayCarName} ({post.model_year || 'N/A'})</span></span>
          </div>
          <div className="post-full-content-body">
            {post.content && post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="comments-section">
        <h2>Comments ({post.comments ? post.comments.length : 0})</h2>
        {post.comments && post.comments.length > 0 ? (
          post.comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          !isLoading && <p>No comments yet. Be the first to comment!</p>
        )}
        <AddCommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
      </div>

      {showEditPostModal && post && ( 
        <EditPostModal
          isOpen={showEditPostModal}
          onClose={() => setShowEditPostModal(false)}
          postToEdit={post} 
          onPostUpdated={handlePostUpdated} 
        />
      )}
    </div>
  );
};

export default PostDetailPage;