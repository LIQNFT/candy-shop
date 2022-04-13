import React from 'react';
import styled from '@emotion/styled';

import Modal from 'components/Modal';

interface DeleteModalProps {
  onDelete: () => void;
  title?: string;
  onCancel: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  title = 'Are you sure to delete?',
  onCancel,
  onDelete,
}) => {
  return (
    <Modal onCancel={onCancel} width={600}>
      <Content>
        <div className="cds-delete-title">{title}</div>
        <div className="cds-delete-bottom">
          <div className="cds-delete-cancel" onClick={onCancel}>
            Cancel
          </div>
          <button className="candy-button" onClick={onDelete}>
            OK
          </button>
        </div>
      </Content>
    </Modal>
  );
};

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  .cds-delete {
    &-title {
      margin-bottom: 30px;
      font-size: 32px;
      font-weight: 700;
    }

    &-cancel {
      cursor: pointer;
      margin-right: 20px;
    }

    &-bottom {
      display: flex;
      align-items: center;

      button {
        min-width: 80px;
      }
    }
  }
`;
