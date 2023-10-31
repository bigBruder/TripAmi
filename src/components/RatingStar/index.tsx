import Star1 from '@assets/icons/Star1.svg';
import Star2 from '@assets/icons/Star2.svg';

const Star = ({ selected = false, onSelect = () => {} }) => (
  <div onClick={onSelect} style={{ cursor: 'pointer' }}>
    {selected ? <img src={Star2}/> : <img src={Star1} />}
  </div>
);

export default Star;
