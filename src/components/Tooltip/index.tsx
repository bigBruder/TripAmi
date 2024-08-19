import React from 'react';

import styles from './Tooltip.module.css';

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  return <div className={styles.tooltip}>{text}</div>;
};

export default Tooltip;
