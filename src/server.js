const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function authenticate(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: 'No authorization header' });
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user?.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return user;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username: username || email.split('@')[0] },
      email_confirm: true 
    });

    if (error) {
      console.error('Error creating user:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ user: data.user });
  } catch (error) {
    console.error('Server error during signup:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});


app.get('/mcs', async (req, res) => {
  try {
    const user = await authenticate(req, res);
    if (!user) return;

    const { data: mcs, error } = await supabase
      .from('mcs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching MCs:', error.message);
      return res.status(500).json({ error: 'Failed to fetch MCs from database' });
    }

    res.json({ mcs: mcs || [] });
  } catch (error) {
    console.error('Error fetching MCs:', error);
    res.status(500).json({ error: 'Failed to fetch MCs' });
  }
});

app.post('/mcs', async (req, res) => {
  try {
    const user = await authenticate(req, res);
    if (!user) return;

    const { mcs } = req.body;

    if (!Array.isArray(mcs)) {
      return res.status(400).json({ error: 'MCs must be an array' });
    }

    const { error: deleteError } = await supabase
      .from('mcs')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting old MCs:', deleteError.message);
      return res.status(500).json({ error: 'Failed to delete old MCs' });
    }

    if (mcs.length > 0) {
      const mcsToInsert = mcs.map(mc => ({
        id: mc.id,
        user_id: user.id,
        name: mc.name,
        wins: mc.wins || 0,
        losses: mc.losses || 0,
        draws: mc.draws || 0,
        total_battles: mc.totalBattles || 0,
      }));

      const { error: insertError } = await supabase
        .from('mcs')
        .insert(mcsToInsert);

      if (insertError) {
        console.error('Error inserting MCs:', insertError.message);
        return res.status(500).json({ error: 'Failed to insert MCs' });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving MCs:', error);
    res.status(500).json({ error: 'Failed to save MCs' });
  }
});

app.delete('/mcs/:id', async (req, res) => {
  try {
    const user = await authenticate(req, res);
    if (!user) return;

    const { id } = req.params;

    const { error } = await supabase
      .from('mcs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting MC:', error.message);
      return res.status(500).json({ error: 'Failed to delete MC' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting MC:', error);
    res.status(500).json({ error: 'Failed to delete MC' });
  }
});

app.get('/battles', async (req, res) => {
  try {
    const user = await authenticate(req, res);
    if (!user) return;

    const { data: battles, error: battlesError } = await supabase
      .from('battles')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (battlesError) {
      console.error('Database error fetching battles:', battlesError.message);
      return res.status(500).json({ error: 'Failed to fetch battles from database' });
    }

    const battlesWithParticipants = await Promise.all(
      (battles || []).map(async (battle) => {
        const { data: participants, error: participantsError } = await supabase
          .from('battle_participants')
          .select('*')
          .eq('battle_id', battle.id);

        if (participantsError) {
          console.error(`Error fetching participants for battle ${battle.id}:`, participantsError.message);
          return {
            ...battle,
            participants: []
          };
        }

        return {
          id: battle.id,
          date: battle.date,
          location: battle.location,
          type: battle.type,
          participants: participants.map(p => ({
            mcId: p.mc_id,
            opponent: p.opponent,
            result: p.result
          }))
        };
      })
    );

    res.json({ battles: battlesWithParticipants });
  } catch (error) {
    console.error('Error fetching battles:', error);
    res.status(500).json({ error: 'Failed to fetch battles' });
  }
});

app.post('/battles', async (req, res) => {
  try {
    const user = await authenticate(req, res);
    if (!user) return;

    const { battles } = req.body;

    if (!Array.isArray(battles)) {
      return res.status(400).json({ error: 'Battles must be an array' });
    }

    const { error: deleteError } = await supabase
      .from('battles')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting old battles:', deleteError.message);
      return res.status(500).json({ error: 'Failed to delete old battles' });
    }

    if (battles.length > 0) {
      for (const battle of battles) {
        const { data: insertedBattle, error: battleError } = await supabase
          .from('battles')
          .insert({
            id: battle.id,
            user_id: user.id,
            date: battle.date,
            location: battle.location || null,
            type: battle.type || 'beat',
          })
          .select()
          .single();

        if (battleError) {
          console.error('Error inserting battle:', battleError.message);
          continue;
        }

        // Insere os participantes
        if (battle.participants && battle.participants.length > 0) {
          const participantsToInsert = battle.participants.map(p => ({
            battle_id: insertedBattle.id,
            mc_id: p.mcId,
            opponent: p.opponent,
            result: p.result || null,
          }));

          const { error: participantsError } = await supabase
            .from('battle_participants')
            .insert(participantsToInsert);

          if (participantsError) {
            console.error(`Error inserting participants for battle ${insertedBattle.id}:`, participantsError.message);
          }
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving battles:', error);
    res.status(500).json({ error: 'Failed to save battles' });
  }
});

app.delete('/battles/:id', async (req, res) => {
  try {
    const user = await authenticate(req, res);
    if (!user) return;

    const { id } = req.params;

    const { error } = await supabase
      .from('battles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting battle:', error.message);
      return res.status(500).json({ error: 'Failed to delete battle' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting battle:', error);
    res.status(500).json({ error: 'Failed to delete battle' });
  }
});


app.get('/stats', async (req, res) => {
  try {
    const user = await authenticate(req, res);
    if (!user) return;

    // Top MCs
    const { data: topMcs, error: mcsError } = await supabase
      .from('mcs')
      .select('*')
      .eq('user_id', user.id)
      .order('wins', { ascending: false })
      .limit(10);

    if (mcsError) {
      console.error('Error fetching top MCs:', mcsError.message);
    }

    const today = new Date().toISOString().split('T')[0];
    const { data: upcomingBattles, error: battlesError } = await supabase
      .from('battles')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(5);

    if (battlesError) {
      console.error('Error fetching upcoming battles:', battlesError.message);
    }

    res.json({
      topMcs: topMcs || [],
      upcomingBattles: upcomingBattles || [],
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});


app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🎤 Arena Cypher Management Server`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📝 Available routes:`);
  console.log(`   POST   /signup`);
  console.log(`   GET    /mcs`);
  console.log(`   POST   /mcs`);
  console.log(`   DELETE /mcs/:id`);
  console.log(`   GET    /battles`);
  console.log(`   POST   /battles`);
  console.log(`   DELETE /battles/:id`);
  console.log(`   GET    /stats`);
  console.log(`\n✅ Ready to accept requests!`);
});


