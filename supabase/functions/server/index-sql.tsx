import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-f2b5fafa/health", (c) => {
  return c.json({ status: "ok" });
});


app.post("/make-server-f2b5fafa/signup", async (c) => {
  try {
    const { username, email, password } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user }, 201);
  } catch (error) {
    console.log(`Server error during signup: ${error}`);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});


app.get("/make-server-f2b5fafa/mcs", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: mcs, error: dbError } = await supabase
      .from('mcs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.log(`Database error fetching MCs: ${dbError.message}`);
      return c.json({ error: 'Failed to fetch MCs from database' }, 500);
    }

    return c.json({ mcs: mcs || [] });
  } catch (error) {
    console.log(`Error fetching MCs: ${error}`);
    return c.json({ error: 'Failed to fetch MCs' }, 500);
  }
});


app.post("/make-server-f2b5fafa/mcs", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { mcs } = await c.req.json();

    const { error: deleteError } = await supabase
      .from('mcs')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.log(`Error deleting old MCs: ${deleteError.message}`);
      return c.json({ error: 'Failed to delete old MCs' }, 500);
    }

    if (mcs && mcs.length > 0) {
      const mcsToInsert = mcs.map((mc: any) => ({
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
        console.log(`Error inserting MCs: ${insertError.message}`);
        return c.json({ error: 'Failed to insert MCs' }, 500);
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving MCs: ${error}`);
    return c.json({ error: 'Failed to save MCs' }, 500);
  }
});


app.get("/make-server-f2b5fafa/battles", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: battles, error: battlesError } = await supabase
      .from('battles')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (battlesError) {
      console.log(`Database error fetching battles: ${battlesError.message}`);
      return c.json({ error: 'Failed to fetch battles from database' }, 500);
    }

    const battlesWithParticipants = await Promise.all(
      (battles || []).map(async (battle) => {
        const { data: participants, error: participantsError } = await supabase
          .from('battle_participants')
          .select('*')
          .eq('battle_id', battle.id);

        if (participantsError) {
          console.log(`Error fetching participants for battle ${battle.id}: ${participantsError.message}`);
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

    return c.json({ battles: battlesWithParticipants });
  } catch (error) {
    console.log(`Error fetching battles: ${error}`);
    return c.json({ error: 'Failed to fetch battles' }, 500);
  }
});

app.post("/make-server-f2b5fafa/battles", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { battles } = await c.req.json();

    const { error: deleteError } = await supabase
      .from('battles')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.log(`Error deleting old battles: ${deleteError.message}`);
      return c.json({ error: 'Failed to delete old battles' }, 500);
    }

    if (battles && battles.length > 0) {
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
          console.log(`Error inserting battle: ${battleError.message}`);
          continue;
        }

        // Insert participants
        if (battle.participants && battle.participants.length > 0) {
          const participantsToInsert = battle.participants.map((p: any) => ({
            battle_id: insertedBattle.id,
            mc_id: p.mcId,
            opponent: p.opponent,
            result: p.result || null,
          }));

          const { error: participantsError } = await supabase
            .from('battle_participants')
            .insert(participantsToInsert);

          if (participantsError) {
            console.log(`Error inserting participants for battle ${insertedBattle.id}: ${participantsError.message}`);
          }
        }
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving battles: ${error}`);
    return c.json({ error: 'Failed to save battles' }, 500);
  }
});


app.delete("/make-server-f2b5fafa/mcs/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const mcId = c.req.param('id');

    const { error: deleteError } = await supabase
      .from('mcs')
      .delete()
      .eq('id', mcId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.log(`Error deleting MC: ${deleteError.message}`);
      return c.json({ error: 'Failed to delete MC' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting MC: ${error}`);
    return c.json({ error: 'Failed to delete MC' }, 500);
  }
});


app.delete("/make-server-f2b5fafa/battles/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const battleId = c.req.param('id');

    const { error: deleteError } = await supabase
      .from('battles')
      .delete()
      .eq('id', battleId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.log(`Error deleting battle: ${deleteError.message}`);
      return c.json({ error: 'Failed to delete battle' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting battle: ${error}`);
    return c.json({ error: 'Failed to delete battle' }, 500);
  }
});

app.get("/make-server-f2b5fafa/stats", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: topMcs, error: mcsError } = await supabase
      .from('mcs')
      .select('*')
      .eq('user_id', user.id)
      .order('wins', { ascending: false })
      .limit(10);

    if (mcsError) {
      console.log(`Error fetching top MCs: ${mcsError.message}`);
    }

    const { data: upcomingBattles, error: battlesError } = await supabase
      .from('battles')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(5);

    if (battlesError) {
      console.log(`Error fetching upcoming battles: ${battlesError.message}`);
    }

    return c.json({
      topMcs: topMcs || [],
      upcomingBattles: upcomingBattles || [],
    });
  } catch (error) {
    console.log(`Error fetching stats: ${error}`);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

Deno.serve(app.fetch);
