import Star1 from '@assets/icons/Star1.svg';
import Star2 from '@assets/icons/Star2.svg';
import { FC } from 'react';

interface Props {
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

const Star: FC<Props> = ({ selected = false, onSelect = () => {}, disabled = false }) => (
  <div onClick={onSelect} style={{ cursor: disabled ? 'default' : 'pointer' }}>
    {selected ? <img src={Star2}/> : <img src={Star1} />}
  </div>
);

export default Star;
