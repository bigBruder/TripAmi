import React, { useState } from 'react';

export const Favourite = ({ isActive, onAction }: { isActive: boolean; onAction: () => {} }) => {
  const [isHovers, setIsHover] = useState(false);
  return (
    <svg
      onClick={onAction}
      fill={isActive || isHovers ? '#ff4d00' : 'grey'}
      width='20px'
      height='20px'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      id='favourite'
      className='icon glyph'
      style={{ cursor: 'pointer', transition: 'fill 0.3s' }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <path d='M20.28,4.74a5.82,5.82,0,0,0-8.28,0,5.82,5.82,0,0,0-8.28,0,5.94,5.94,0,0,0,0,8.34l7.57,7.62a1,1,0,0,0,1.42,0l7.57-7.62a5.91,5.91,0,0,0,0-8.34Z'></path>
    </svg>
  );
};
