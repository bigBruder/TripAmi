import { FC } from 'react';
import styles from './errorMessage.module.css';

interface Props {
    message: string;
}

export const ErrorMessage: FC<Props> = ({message}) => (
    <p className={styles.errorMessage}>{message}</p>
)