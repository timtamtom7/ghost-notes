import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './useAuth';

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
};

export function useTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTeams([]);
      setLoading(false);
      return;
    }

    // Find teams where user is a member
    const q = query(
      collection(db, 'teams'),
      where('members', 'array-contains', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsub;
  }, [user]);

  const createTeam = async (name) => {
    if (!user) throw new Error('Not authenticated');
    const ref = await addDoc(collection(db, 'teams'), {
      name,
      ownerId: user.uid,
      members: [user.uid],
      memberRoles: { [user.uid]: ROLES.OWNER },
      createdAt: serverTimestamp(),
    });
    return ref.id;
  };

  const inviteMember = async (teamId, email, role = ROLES.MEMBER) => {
    if (!user) throw new Error('Not authenticated');
    const team = teams.find((t) => t.id === teamId);
    if (!team) throw new Error('Team not found');

    const userRole = team.memberRoles?.[user.uid];
    if (userRole !== ROLES.OWNER && userRole !== ROLES.ADMIN) {
      throw new Error('Only owners and admins can invite members');
    }

    // Create invite document
    const inviteRef = await addDoc(collection(db, 'teams', teamId, 'invites'), {
      email,
      role,
      invitedBy: user.uid,
      invitedByEmail: user.email,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    return inviteRef.id;
  };

  const acceptInvite = async (teamId, inviteId) => {
    if (!user) throw new Error('Not authenticated');

    const inviteRef = doc(db, 'teams', teamId, 'invites', inviteId);
    const teamRef = doc(db, 'teams', teamId);

    // Add user to members
    await updateDoc(teamRef, {
      members: [...(teams.find((t) => t.id === teamId)?.members || []), user.uid],
      [`memberRoles.${user.uid}`]: ROLES.MEMBER,
    });

    // Mark invite as accepted
    await updateDoc(inviteRef, { status: 'accepted' });
  };

  const removeMember = async (teamId, memberUid) => {
    if (!user) throw new Error('Not authenticated');
    const team = teams.find((t) => t.id === teamId);
    if (!team) throw new Error('Team not found');

    const userRole = team.memberRoles?.[user.uid];
    if (userRole !== ROLES.OWNER && userRole !== ROLES.ADMIN) {
      throw new Error('Only owners and admins can remove members');
    }

    if (memberUid === team.ownerId) {
      throw new Error('Cannot remove the team owner');
    }

    const teamRef = doc(db, 'teams', teamId);
    const newMembers = (team.members || []).filter((m) => m !== memberUid);
    const newRoles = { ...team.memberRoles };
    delete newRoles[memberUid];

    await updateDoc(teamRef, { members: newMembers, memberRoles: newRoles });
  };

  const deleteTeam = async (teamId) => {
    if (!user) throw new Error('Not authenticated');
    const team = teams.find((t) => t.id === teamId);
    if (!team) throw new Error('Team not found');
    if (team.ownerId !== user.uid) {
      throw new Error('Only the owner can delete the team');
    }
    await deleteDoc(doc(db, 'teams', teamId));
  };

  const leaveTeam = async (teamId) => {
    if (!user) throw new Error('Not authenticated');
    const team = teams.find((t) => t.id === teamId);
    if (!team) throw new Error('Team not found');
    if (team.ownerId === user.uid) {
      throw new Error('Owner cannot leave. Transfer ownership or delete the team.');
    }
    await removeMember(teamId, user.uid);
  };

  return {
    teams,
    loading,
    createTeam,
    inviteMember,
    acceptInvite,
    removeMember,
    deleteTeam,
    leaveTeam,
  };
}

/**
 * Hook to manage shared lists for a team.
 */
export function useTeamLists(teamId) {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) {
      setLists([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'teams', teamId, 'lists'),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setLists(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsub;
  }, [teamId]);

  const createTeamList = async (name) => {
    if (!user) throw new Error('Not authenticated');
    const ref = await addDoc(collection(db, 'teams', teamId, 'lists'), {
      name,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  };

  const deleteTeamList = async (listId) => {
    if (!user) throw new Error('Not authenticated');
    await deleteDoc(doc(db, 'teams', teamId, 'lists', listId));
  };

  return { lists, loading, createTeamList, deleteTeamList };
}
