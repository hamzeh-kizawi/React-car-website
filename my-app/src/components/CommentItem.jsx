import React from 'react';
import '../css/CommentItem.css'; 

const CommentItem = ({ comment }) => {
  if (!comment) {
    return null; 
  }

  return (
    <div className="comment-item-container">
      <div className="comment-header">
        <span className="comment-author-username">{comment.username || 'Anonymous'}</span>
        <span className="comment-timestamp">
          {new Date(comment.created_at).toLocaleString()}
        </span>
      </div>
      <p className="comment-content">{comment.content}</p>
      {/* Placeholder for future actions like reply, edit, delete for comments */}
      {/* <div className="comment-actions">
        <button>Reply</button>
      </div> */}
    </div>
  );
};

export default CommentItem;