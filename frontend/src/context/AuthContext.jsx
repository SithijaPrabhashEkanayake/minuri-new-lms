import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const expectedPortalRef = useRef(null);
  const loginResolveRef = useRef(null);

  // Sync Supabase session with LMS profile
  useEffect(() => {
    let mounted = true;
    let signingOut = false; // Prevents duplicate signOut race conditions
    let initialSessionHandled = false; // Prevents double-fetch from getSession + onAuthStateChange
    
    const fetchProfile = async (session) => {
      if (!session) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // If we're already signing out a stale session, skip
      if (signingOut) return;
      
      try {
        const res = await fetch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const profile = await res.json();

          // ---- PORTAL ROLE CHECK ----
          const expPortal = expectedPortalRef.current;
          if (expPortal) {
            const isStudentPortal = expPortal === 'student';
            const isStaffPortal = expPortal === 'staff';
            
            if (isStudentPortal && profile.role !== 'Student') {
              signingOut = true;
              await supabase.auth.signOut();
              if (loginResolveRef.current) {
                loginResolveRef.current({ success: false, message: 'Please use the Staff login portal for Admin/Teacher accounts.' });
                loginResolveRef.current = null;
              }
              expectedPortalRef.current = null;
              if (mounted) { setUser(null); setLoading(false); }
              return;
            }
            if (isStaffPortal && !['Admin', 'Teacher'].includes(profile.role)) {
              signingOut = true;
              await supabase.auth.signOut();
              if (loginResolveRef.current) {
                loginResolveRef.current({ success: false, message: 'Please use the Student login portal for Student accounts.' });
                loginResolveRef.current = null;
              }
              expectedPortalRef.current = null;
              if (mounted) { setUser(null); setLoading(false); }
              return;
            }
          }
          // ---------------------------

          if (mounted) {
            setUser({ ...profile, token: session.access_token });
            if (loginResolveRef.current) {
              loginResolveRef.current({ success: true });
              loginResolveRef.current = null;
            }
            expectedPortalRef.current = null;
          }
        } else {
          // User has a Supabase session but no matching LMS profile.
          // Clear the stale session. The flag prevents duplicate signOut calls.
          signingOut = true;
          await supabase.auth.signOut();
          if (mounted) setUser(null);
          if (loginResolveRef.current) {
             loginResolveRef.current({ success: false, message: 'LMS profile not found.' });
             loginResolveRef.current = null;
          }
          expectedPortalRef.current = null;
        }
      } catch (err) {
        console.error('Error fetching LMS profile:', err);
        if (mounted) setUser(null);
        if (loginResolveRef.current) {
           loginResolveRef.current({ success: false, message: 'Server error fetching profile.' });
           loginResolveRef.current = null;
        }
        expectedPortalRef.current = null;
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      initialSessionHandled = true;
      fetchProfile(session);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip the INITIAL_SESSION event — getSession() already handles it
      if (event === 'INITIAL_SESSION' && !initialSessionHandled) return;
      if (event === 'INITIAL_SESSION' && initialSessionHandled) return;
      
      fetchProfile(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = (email, password, expectedPortal = null) => {
    return new Promise(async (resolve) => {
      expectedPortalRef.current = expectedPortal;
      loginResolveRef.current = resolve;

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        expectedPortalRef.current = null;
        loginResolveRef.current = null;
        resolve({ success: false, message: error.message });
      }
      // If success, we DO NOT resolve here.
      // onAuthStateChange will fire, triggering fetchProfile,
      // which will check the portal constraint and call the resolve function!
    });
  };

  const register = async (userData) => {
    try {
      // 1. Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { name: userData.name }
        }
      });

      if (error) return { success: false, message: error.message };
      
      if (!data.user) return { success: false, message: 'Registration failed.' };

      // 2. Complete LMS Profile in Backend
      const res = await fetch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.user.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          grade: userData.grade,
          consentGiven: userData.consentGiven,
          classType: userData.classType,
          medium: userData.medium,
          institution: userData.institution
        }),
      });

      const profileData = await res.json();
      if (!res.ok) {
        // Rollback Supabase session since backend rejected it
        await supabase.auth.signOut();
        return { success: false, message: profileData.message || 'Failed to complete profile' };
      }

      return { success: true, message: 'Registration successful!' };
    } catch (err) {
      return { success: false, message: 'Server error' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Password reset email sent. Please check your inbox.' };
    } catch (err) {
      return { success: false, message: 'Server error' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, forgotPassword, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
