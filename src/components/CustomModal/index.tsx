import React from 'react';
import Modal from 'react-modal';
import './customModal.css';
import { CSSTransition } from 'react-transition-group';

interface Props {
  children: React.ReactNode;
  isOpen: boolean;
  onCloseModal: () => void;
  images?: {
    url: string;
    type: string;
  }[]
}

const CustomModal: React.FC<Props> = ({ children, isOpen, onCloseModal }) => {
  return (
    <CSSTransition
      in={isOpen}
      timeout={300}
      classNames="dialog"
    >
      <Modal
        closeTimeoutMS={500}
        isOpen={isOpen}
        style={{
          content: {
            padding: 0,
            margin: 0,
          },
        }}
        contentLabel="Example Modal"
        onRequestClose={onCloseModal}
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
      >
        {children}
      </Modal>
    </CSSTransition>
  );
};

export default CustomModal;
