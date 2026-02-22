import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { Dashboard } from './components/Dashboard';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { supabase } from './utils/supabase/client';

export interface MC {
  id: string;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  totalBattles: number;
}

export interface Battle {
  id: string;
  name: string;
  date: string;
  location: string;
  matchups: Array<{
    mc1: string;
    mc2: string;
    winner?: string;
  }>;
  status: 'scheduled' | 'completed';
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mcs, setMcs] = useState<MC[]>([]);

  const [battles, setBattles] = useState<Battle[]>([]);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
        setIsLoggedIn(true);
        await loadUserData(session.access_token);
      }
    } catch (error) {
      console.log('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (token: string) => {
    try {
      console.log('📥 Loading user data...');
      
      let loadedMcsData: MC[] = [];
      
      const mcsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f2b5fafa/mcs`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (mcsResponse.ok) {
        const { mcs: loadedMcs } = await mcsResponse.json();
        console.log('📦 MCs from backend:', loadedMcs);
        
        if (loadedMcs && loadedMcs.length > 0) {
          const convertedMcs = loadedMcs.map((mc: any) => ({
            id: mc.id,
            name: mc.name,
            wins: mc.wins || 0,
            losses: mc.losses || 0,
            draws: mc.draws || 0,
            totalBattles: mc.total_battles || 0,
          }));
          console.log('✅ MCs converted:', convertedMcs);
          loadedMcsData = convertedMcs;
          setMcs(convertedMcs);
        } else {
          console.log('ℹ️ No MCs found');
        }
      } else {
        console.error('❌ Failed to load MCs:', await mcsResponse.text());
      }

      const battlesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f2b5fafa/battles`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (battlesResponse.ok) {
        const { battles: loadedBattles } = await battlesResponse.json();
        console.log('📦 Battles from backend:', loadedBattles);
        
        if (loadedBattles && loadedBattles.length > 0) {
          const convertedBattles = loadedBattles.map((battle: any) => {
            const matchups: Array<{ mc1: string; mc2: string; winner?: string }> = [];
            const processedPairs = new Set<string>();
            
            battle.participants.forEach((p: any) => {
              const mc1Name = loadedMcsData.find(mc => mc.id === p.mcId)?.name || 'MC Desconhecido';
              const mc2Name = p.opponent;
              const pairKey = [mc1Name, mc2Name].sort().join('|');
            
              if (!processedPairs.has(pairKey)) {
                processedPairs.add(pairKey);
                
              
                const opponentParticipant = battle.participants.find(
                  (op: any) => {
                    const opMcName = loadedMcsData.find(mc => mc.id === op.mcId)?.name;
                    return opMcName === mc2Name && op.opponent === mc1Name;
                  }
                );
                
                let winner: string | undefined;
                if (p.result === 'win') {
                  winner = mc1Name;
                } else if (p.result === 'loss') {
                  winner = mc2Name;
                } else if (opponentParticipant?.result === 'win') {
                  winner = mc2Name;
                }
                
                matchups.push({
                  mc1: mc1Name,
                  mc2: mc2Name,
                  winner
                });
              }
            });
            
            return {
              id: battle.id,
              name: `Batalha - ${battle.location}`, 
              date: battle.date,
              location: battle.location,
              matchups: matchups.length > 0 ? matchups : [{ mc1: '', mc2: '' }],
              status: matchups.some(m => m.winner) ? 'completed' : 'scheduled'
            } as Battle;
          });
          
          console.log('✅ Battles converted:', convertedBattles);
          setBattles(convertedBattles);
        } else {
          console.log('ℹ️ No battles found');
        }
      } else {
        console.error('❌ Failed to load battles:', await battlesResponse.text());
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const saveMcs = async (mcsToSave: MC[], token?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = token || session?.access_token || accessToken;
      
      console.log('🔐 DEBUGGING TOKEN:');
      console.log('  - Token provided?', !!token);
      console.log('  - Session exists?', !!session);
      console.log('  - Session token?', !!session?.access_token);
      console.log('  - Stored token?', !!accessToken);
      console.log('  - Using token (first 30 chars):', authToken?.substring(0, 30) + '...');
      console.log('  - Session user ID:', session?.user?.id);
      console.log('  - Session expires:', session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A');
      console.log('  - Full session object:', session);
      console.log('  - Full token length:', authToken?.length);
      
      console.log('🧪 Testing token with getUser...');
      const { data: userData, error: userError } = await supabase.auth.getUser(authToken);
      console.log('  - User data:', userData);
      console.log('  - User error:', userError);
      
      if (!authToken) {
        console.error('❌ No auth token available');
        return;
      }

      console.log('💾 Saving MCs:', mcsToSave);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f2b5fafa/mcs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mcs: mcsToSave }),
        }
      );

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('📡 Raw response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { error: responseText };
      }
      
      if (!response.ok) {
        console.error('❌ Error saving MCs:', result);
        console.error('Response status:', response.status);
        throw new Error(result.error || 'Failed to save MCs');
      }

      console.log('✅ MCs saved successfully:', result);
    } catch (error) {
      console.error('❌ Error saving MCs:', error);
    }
  };

  const saveBattles = async (battlesToSave: Battle[], token?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = token || session?.access_token || accessToken;
      
      if (!authToken) return;

      const battlesForBackend = battlesToSave.map(battle => {
        const participants = battle.matchups.flatMap(matchup => {
          const mc1Id = mcs.find(mc => mc.name === matchup.mc1)?.id;
          const mc2Id = mcs.find(mc => mc.name === matchup.mc2)?.id;
          
          const parts = [];
          if (mc1Id) {
            parts.push({
              mcId: mc1Id,
              opponent: matchup.mc2,
              result: matchup.winner === matchup.mc1 ? 'win' : matchup.winner === matchup.mc2 ? 'loss' : null
            });
          }
          if (mc2Id) {
            parts.push({
              mcId: mc2Id,
              opponent: matchup.mc1,
              result: matchup.winner === matchup.mc2 ? 'win' : matchup.winner === matchup.mc1 ? 'loss' : null
            });
          }
          return parts;
        });

        return {
          id: battle.id,
          date: battle.date,
          location: battle.location,
          type: 'beat', 
          participants
        };
      });

      console.log('💾 Saving battles:', battlesForBackend);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f2b5fafa/battles`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ battles: battlesForBackend }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Error saving battles:', error);
        throw new Error('Failed to save battles');
      }

      console.log('✅ Battles saved successfully');
    } catch (error) {
      console.log('Error saving battles:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Login error:', error.message);
        throw new Error(error.message);
      }

      if (data.session?.access_token) {
        setAccessToken(data.session.access_token);
        setIsLoggedIn(true);
        await loadUserData(data.session.access_token);
      }
    } catch (error) {
      console.log('Error during login:', error);
      throw error;
    }
  };

  const handleSignUp = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f2b5fafa/signup`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      await handleLogin(email, password);
      setShowSignUp(false);
    } catch (error) {
      console.log('Error during signup:', error);
      throw error;
    }
  };

  const handleShowSignUp = () => {
    setShowSignUp(true);
  };

  const handleBackToLogin = () => {
    setShowSignUp(false);
  };

  const handleAddBattle = (battle: Battle) => {
    const newBattles = [...battles, battle];
    setBattles(newBattles);
    saveBattles(newBattles);
  };

  const handleUpdateBattle = (updatedBattle: Battle) => {
    const newBattles = battles.map(b => b.id === updatedBattle.id ? updatedBattle : b);
    setBattles(newBattles);
    saveBattles(newBattles);
  };

  const handleAddMC = (mc: MC) => {
    const newMcs = [...mcs, mc];
    setMcs(newMcs);
    saveMcs(newMcs);
  };

  const handleUpdateMC = (updatedMC: MC) => {
    const newMcs = mcs.map(m => m.id === updatedMC.id ? updatedMC : m);
    setMcs(newMcs);
    saveMcs(newMcs);
  };

  const handleDeleteMC = async (mcId: string) => {
    if (!accessToken) return;
    
    try {
      console.log(`🗑️ Deleting MC: ${mcId}`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f2b5fafa/mcs/${mcId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.ok) {
        console.log('✅ MC deleted successfully');
        const newMcs = mcs.filter(m => m.id !== mcId);
        setMcs(newMcs);
      } else {
        console.error('❌ Failed to delete MC:', await response.text());
        alert('Erro ao excluir MC. Tente novamente.');
      }
    } catch (error) {
      console.error('Error deleting MC:', error);
      alert('Erro ao excluir MC. Tente novamente.');
    }
  };

  const handleDeleteBattle = async (battleId: string) => {
    if (!accessToken) return;
    
    try {
      console.log(`🗑️ Deleting Battle: ${battleId}`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f2b5fafa/battles/${battleId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.ok) {
        console.log('✅ Battle deleted successfully');
        const newBattles = battles.filter(b => b.id !== battleId);
        setBattles(newBattles);
      } else {
        console.error('❌ Failed to delete battle:', await response.text());
        alert('Erro ao excluir batalha. Tente novamente.');
      }
    } catch (error) {
      console.error('Error deleting battle:', error);
      alert('Erro ao excluir batalha. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setAccessToken(null);
      setMcs([]);
      setBattles([]);
    } catch (error) {
      console.log('Error during logout:', error);
    }
  };

  if (!isLoggedIn) {
    if (showSignUp) {
      return <SignUpScreen onSignUp={handleSignUp} onBackToLogin={handleBackToLogin} />;
    }
    return <LoginScreen onLogin={handleLogin} onShowSignUp={handleShowSignUp} />;
  }

  return (
    <Dashboard
      battles={battles}
      mcs={mcs}
      onAddBattle={handleAddBattle}
      onUpdateBattle={handleUpdateBattle}
      onAddMC={handleAddMC}
      onUpdateMC={handleUpdateMC}
      onDeleteMC={handleDeleteMC}
      onDeleteBattle={handleDeleteBattle}
      onLogout={handleLogout}
    />
  );
}