import React from 'react';
import { Link } from 'react-router-dom';
import '../css/PostItem.css'; 

const PostItem = ({ post }) => {
  const displayCarName = post.car_name && post.brand && post.car_name.toLowerCase().startsWith(post.brand.toLowerCase())
    ? post.car_name
    : `${post.brand || ''} ${post.car_name || ''}`.trim();

  return (
    <div className="post-item-card-modern">
      <div className="post-item-main-content">
        {post.car_image && (
          <img src={post.car_image} alt={displayCarName} className="post-item-car-image-modern" />
        )}
        <div className="post-item-text-content">
          <div className="post-item-header-modern">
            <h2 className="post-item-title-modern">{post.title || `Discussion: ${displayCarName}`}</h2>
            <div className="post-item-meta-top-right">
              <span>Posted: {new Date(post.created_at).toLocaleDateString()}</span>
              <span>About: <span className="post-item-carname-modern">{displayCarName} ({post.model_year || 'N/A'})</span></span>
            </div>
          </div>
          <p className="post-item-author-modern">
            By: <span className="post-item-username-modern">{post.username}</span>
          </p>
          {post.content && (
            <p className="post-item-snippet-modern">
              {post.content.length > 150 ? `${post.content.substring(0, 147)}...` : post.content}
            </p>
          )}
        </div>
      </div>
      <div className="post-item-footer-modern">
        <span>Comments: {post.comments_count}</span>
        <Link to={`/discussions/${post.id}`} className="post-item-view-details-modern">
          View Discussion
        </Link>
      </div>
    </div>
  );
};

export default PostItem;