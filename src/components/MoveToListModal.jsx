import { useState } from 'react';
import { useLists } from '../hooks/useLists';
import './MoveToListModal.css';

export default function MoveToListModal({ isOpen, onClose, article, onMoved }) {
  const { lists, createList } = useLists();
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSelectList = async (list) => {
    await onMoved(list.id, list.name);
    onClose();
  };

  const handleRemoveFromList = async () => {
    await onMoved(null, null);
    onClose();
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      const id = await createList(name);
      await onMoved(id, name);
      onClose();
    } catch (err) {
      setError('Failed to create list. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="list-modal-overlay" onClick={onClose}>
      <div className="list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="list-modal-header">
          <h3 className="list-modal-title">Move to list</h3>
          <button className="list-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="list-modal-error">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {article?.listId && (
          <button className="list-modal-item remove" onClick={handleRemoveFromList}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            </svg>
            Remove from list
          </button>
        )}

        {lists.length > 0 && (
          <div className="list-modal-section-label">Existing lists</div>
        )}
        <div className="list-modal-items">
          {lists.map((list) => (
            <button
              key={list.id}
              className={`list-modal-item${article?.listId === list.id ? ' current' : ''}`}
              onClick={() => handleSelectList(list)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span className="list-modal-item-name">{list.name}</span>
              {article?.listId === list.id && (
                <svg className="list-modal-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
            </button>
          ))}
        </div>

        <div className="list-modal-divider" />

        <form className="list-modal-create" onSubmit={handleCreateList}>
          <div className="list-modal-section-label">Create new list</div>
          <div className="list-modal-create-row">
            <input
              type="text"
              className="list-modal-create-input"
              placeholder="List name…"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              maxLength={40}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!newListName.trim() || creating}
            >
              {creating ? '…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
