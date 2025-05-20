import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BackToMainScreen from '../components/BackToMainScreen';
import PostItem from '../components/PostItem';
import CreatePostModal from '../components/CreatePostModal'; 
import { useAuth } from '../contexts/AuthContext';
import '../css/DiscussionPage.css';
import '../css/FloatingActionButton.css';


const DiscussionPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth(); 
  const navigate = useNavigate();

  const [showCreatePostWarning, setShowCreatePostWarning] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false); 


  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) { /* if response parsing fails */ }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError(err.message || 'Failed to load posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePostClick = () => {
    if (!user) { 
      setShowCreatePostWarning(true);
      setTimeout(() => setShowCreatePostWarning(false), 4000);
      return;
    }
    if (user.username === "Guest") {
      setShowCreatePostWarning(true);
      setTimeout(() => setShowCreatePostWarning(false), 4000);
      return;
    }
    setShowCreatePostModal(true);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setShowCreatePostModal(false); 
  };

  if (authLoading) {
    return (
      <div className="discussion-page-container separate-page-layout">
        <BackToMainScreen />
        <h1>Car Discussions</h1>
        <p className="loading-message">Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="discussion-page-container separate-page-layout">
      <BackToMainScreen />

      <div className="discussion-login-button-container">
        {!user ? (
          <Link to="/login" className="discussion-login-button">
            Login to Participate
          </Link>
        ) : user.username === "Guest" ? (
          <span style={{ color: '#ccc', padding: '8px 15px' }}>Viewing as Guest</span>
        ) : (
          <span style={{ color: '#fff', padding: '8px 15px' }}>Welcome, {user.username}!</span>
        )}
      </div>

      <h1>Car Discussions</h1>

      {isLoading && <p className="loading-message">Loading posts...</p>}
      {error && <p className="error-message">Error: {error}</p>}

      {!isLoading && !error && posts.length === 0 && (
        <p className="no-posts-message">No discussions started yet. Be the first to create one!</p>
      )}

      {!isLoading && !error && posts.length > 0 && (
        <div className="posts-list">
          {posts.map(post => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      )}

      <button
        className="fab-create-post"
        onClick={handleCreatePostClick}
        title="Create New Post"
      >
        +
      </button>

      {showCreatePostWarning && (
        <div className="create-post-warning">
          ❌ You need to be logged in as a registered user to create a post.
        </div>
      )}

      {showCreatePostModal && (
        <CreatePostModal
          isOpen={showCreatePostModal} 
          onClose={() => setShowCreatePostModal(false)} 
          onPostCreated={handlePostCreated} 
        />
      )}
    </div>
  );
};

export default DiscussionPage;