import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const UserSelectModal = ({
  availableUsers,
  selectedUsers,
  setSelectedUsers,
  showModal,
  handleClose,
  handleSubmit,
  errorMessage
}) => {

  // Funkcja pomocnicza do zarządzania zaznaczeniem użytkowników
  const handleUserCheck = (userId) => {
    setSelectedUsers((prevSelectedUsers) => {
      if (prevSelectedUsers.includes(userId)) {
        return prevSelectedUsers.filter((id) => id !== userId);
      } else {
        return [...prevSelectedUsers, userId];
      }
    });
  };

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select Users</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul className="list-group">
          {availableUsers.map(user => (
            <li key={user.id} className="list-group-item">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => handleUserCheck(user.id)}
              />{' '}
              {user.username}
            </li>
          ))}
        </ul>
        {errorMessage && <p className="text-danger mt-2">{errorMessage}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserSelectModal;
