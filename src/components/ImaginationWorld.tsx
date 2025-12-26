import React from 'react';
import './ImaginationWorld.css';

const ImaginationWorld: React.FC = () => {
  return (
    <div className="spline-container">
      <iframe
        title="Spline 3D Robot"
        src="https://my.spline.design/genkubgreetingrobot-mfSSxGxbk4nbTPLBdWqgs1nY/"
        className="spline-iframe"
      ></iframe>
    </div>
  );
};

export default ImaginationWorld;