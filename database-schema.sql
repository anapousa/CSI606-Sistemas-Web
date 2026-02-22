CREATE TABLE IF NOT EXISTS mcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  total_battles INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT mcs_wins_check CHECK (wins >= 0),
  CONSTRAINT mcs_losses_check CHECK (losses >= 0),
  CONSTRAINT mcs_draws_check CHECK (draws >= 0),
  CONSTRAINT mcs_total_battles_check CHECK (total_battles >= 0)
);


CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  location TEXT,
  type TEXT DEFAULT 'beat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS battle_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  mc_id UUID NOT NULL REFERENCES mcs(id) ON DELETE CASCADE,
  opponent TEXT NOT NULL,
  result TEXT, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_battle_participant UNIQUE (battle_id, mc_id)
);

ALTER TABLE mcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own MCs"
  ON mcs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MCs"
  ON mcs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MCs"
  ON mcs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MCs"
  ON mcs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own battles"
  ON battles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own battles"
  ON battles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own battles"
  ON battles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own battles"
  ON battles FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view participants of their own battles"
  ON battle_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM battles
      WHERE battles.id = battle_participants.battle_id
      AND battles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert participants to their own battles"
  ON battle_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM battles
      WHERE battles.id = battle_participants.battle_id
      AND battles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update participants of their own battles"
  ON battle_participants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM battles
      WHERE battles.id = battle_participants.battle_id
      AND battles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete participants from their own battles"
  ON battle_participants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM battles
      WHERE battles.id = battle_participants.battle_id
      AND battles.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mcs_updated_at
  BEFORE UPDATE ON mcs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_battles_updated_at
  BEFORE UPDATE ON battles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE VIEW mc_rankings AS
SELECT 
  id,
  user_id,
  name,
  wins,
  losses,
  draws,
  total_battles,
  CASE 
    WHEN total_battles > 0 
    THEN ROUND((wins::DECIMAL / total_battles) * 100, 2)
    ELSE 0 
  END as win_rate
FROM mcs
ORDER BY wins DESC, win_rate DESC;

CREATE OR REPLACE VIEW upcoming_battles AS
SELECT 
  b.id,
  b.user_id,
  b.date,
  b.location,
  b.type,
  COUNT(bp.id) as participant_count
FROM battles b
LEFT JOIN battle_participants bp ON b.id = bp.battle_id
GROUP BY b.id, b.user_id, b.date, b.location, b.type
ORDER BY b.date ASC;

COMMENT ON TABLE mcs IS 'Armazena os MCs cadastrados no sistema';
COMMENT ON TABLE battles IS 'Armazena as batalhas de rima';
COMMENT ON TABLE battle_participants IS 'Relaciona MCs com batalhas e seus oponentes';

COMMENT ON COLUMN mcs.wins IS 'Total de vitórias do MC';
COMMENT ON COLUMN mcs.losses IS 'Total de derrotas do MC';
COMMENT ON COLUMN mcs.draws IS 'Total de empates do MC';
COMMENT ON COLUMN mcs.total_battles IS 'Total de batalhas que o MC participou';

COMMENT ON COLUMN battles.type IS 'Tipo da batalha: beat, acapella, etc';
COMMENT ON COLUMN battle_participants.result IS 'Resultado da batalha para este MC: win, loss, draw';
