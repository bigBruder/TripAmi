import { Dispatch, FC, SetStateAction } from 'react';

import cn from 'classnames';

import Star1 from '@assets/icons/Star1.svg';
import Star2 from '@assets/icons/star_editor.svg';

import styles from './ratingStar.module.css';

interface Props {
  selected?: boolean;
  onSelect?: Dispatch<SetStateAction<number>>;
  disabled?: boolean;
  selectedStar?: number;
  i: number;
  isCard?: boolean;
}

const Star: FC<Props> = ({
  selected = false,
  onSelect = () => { },
  disabled = false,
  selectedStar,
  i,
  isCard,
}) => {
  return (
    <div
      className={cn([styles.container], { [styles.pointer]: isCard })}
      onClick={() => {
        if (selectedStar === i) {
          onSelect(-1);
          return;
        }
        onSelect(i);
      }}
      style={{ cursor: disabled ? 'default' : isCard ? 'pointer' : 'default' }}
    >
      {selected ? (
        <img className={styles.star} src={Star2} />
      ) : (
        <img className={styles.star} src={Star1} />
      )}
    </div>
  );
};

export default Star;
