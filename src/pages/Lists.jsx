import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLists } from '../hooks/useLists';
import { useArticles } from '../hooks/useArticles';
import ArticleCard from '../components/ArticleCard';
import MoveToListModal from '../components/MoveToListModal';
import Toast from '../components/Toast';
import './Lists.css';

export default function Lists() {
  const { id: activeListId } = useParams();
  const navigate = useNavigate();
  const { lists, createList, deleteList, renameList } = useLists();
  const { articles, archivedArticles, moveToList } = useArticles();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [editingListId, setEditingListId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [moveModal, setMoveModal] = useState(null); // article being moved
  const [toast, setToast] = useState(null);
  const [deletingListId, setDeletingListId] = useState(null);

  // All articles (active + archived) for the active list view
  const listArticles = [...articles, ...archivedArticles].filter(
    (a) => a.listId === activeListId
  );

  const activeList = lists.find((l) => l.id === activeListId);

  // Get counts per list
  const allArticlesForCounts = [...articles, ...archivedArticles];
  const getCount = (listId) => allArticlesForCounts.filter((a) => a.listId === listId).length;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createList(name);
      setNewListName('');
      setShowCreateForm(false);
      showToast(`List "${name}" created.`);
    } catch (err) {
      setCreateError('Failed to create list. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (listId, listName) => {
    if (!window.confirm(`Delete "${listName}"? Articles won't be deleted.`)) return;
    setDeletingListId(listId);
    try {
      await deleteList(listId);
      if (activeListId === listId) navigate('/app/lists');
      showToast(`List "${listName}" deleted.`);
    } catch {
      showToast('Failed to delete list.');
    } finally {
      setDeletingListId(null);
    }
  };

  const handleStartRename = (list) => {
    setEditingListId(list.id);
    setEditingName(list.name);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    const name = editingName.trim();
    if (!name || !editingListId) return;
    try {
      await renameList(editingListId, name);
      setEditingListId(null);
      showToast(`Renamed to "${name}".`);
    } catch {
      showToast('Failed to rename list.');
    }
  };

  const handleMoveArticle = async (articleId, listId, listName) => {
    try {
      await moveToList(articleId, listId, listName);
      showToast(listName ? `Moved to "${listName}".` : 'Removed from list.');
    } catch {
      showToast('Failed to move article.');
    }
  };

  // No list selected — show all lists
  if (!activeListId) {
    return (
      <div className="lists-page">
        <div className="lists-header">
          <div>
            <h1 className="lists-title">Lists</h1>
            <p className="lists-subtitle">
              {lists.length === 0
                ? 'Organize your haul into lists.'
                : `${lists.length} list${lists.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateForm(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New list
          </button>
        </div>

        {showCreateForm && (
          <form className="list-create-form" onSubmit={handleCreateList}>
            <input
              type="text"
              className="input list-create-input"
              placeholder="List name (e.g. Deep Dives, Research, Recipes)…"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              maxLength={40}
              autoFocus
            />
            {createError && (
              <p className="list-create-error">{createError}</p>
            )}
            <div className="list-create-actions">
              <button type="submit" className="btn btn-primary btn-sm" disabled={!newListName.trim() || creating}>
                {creating ? 'Creating…' : 'Create list'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowCreateForm(false); setCreateError(null); }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {lists.length === 0 && !showCreateForm && (
          <div className="lists-empty">
            <div className="lists-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h3>No lists yet.</h3>
            <p>Create lists to organize your articles — &ldquo;Deep Dives&rdquo;, &ldquo;Research&rdquo;, &ldquo;Recipes&rdquo;, anything you want.</p>
            <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
              Create your first list
            </button>
          </div>
        )}

        {lists.length > 0 && (
          <div className="lists-grid animate-in">
            {lists.map((list) => {
              const count = getCount(list.id);
              return (
                <div
                  key={list.id}
                  className="list-card"
                  onClick={() => navigate(`/app/lists/${list.id}`)}
                >
                  <div className="list-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  </div>
                  <div className="list-card-body">
                    <span className="list-card-name">{list.name}</span>
                    <span className="list-card-count">
                      {count} {count === 1 ? 'article' : 'articles'}
                    </span>
                  </div>
                  <div className="list-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-ghost btn-sm list-card-action"
                      onClick={() => handleStartRename(list)}
                      title="Rename"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      className="btn btn-ghost btn-sm list-card-action danger"
                      onClick={() => handleDeleteList(list.id, list.name)}
                      disabled={deletingListId === list.id}
                      title="Delete"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {toast && <Toast message={toast} />}
      </div>
    );
  }

  // List detail view
  return (
    <div className="lists-page">
      <div className="lists-header">
        <div>
          <button className="lists-back" onClick={() => navigate('/app/lists')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            All lists
          </button>
          <h1 className="lists-title">{activeList?.name || 'List'}</h1>
          <p className="lists-subtitle">
            {listArticles.length === 0
              ? 'No articles in this list.'
              : `${listArticles.length} article${listArticles.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {listArticles.length === 0 && (
        <div className="lists-empty">
          <div className="lists-empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3>This list is empty.</h3>
          <p>Move articles here from your Haul to organize them into &ldquo;{activeList?.name}&rdquo;.</p>
        </div>
      )}

      {listArticles.length > 0 && (
        <div className="lists-articles animate-in">
          {listArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onRead={() => navigate(`/read/${article.id}`, { state: { article } })}
              onMoveToList={() => setMoveModal(article)}
            />
          ))}
        </div>
      )}

      {moveModal && (
        <MoveToListModal
          isOpen={!!moveModal}
          onClose={() => setMoveModal(null)}
          article={moveModal}
          onMoved={(listId, listName) => handleMoveArticle(moveModal.id, listId, listName)}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
