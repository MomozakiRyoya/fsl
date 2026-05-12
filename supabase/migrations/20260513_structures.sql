CREATE TABLE IF NOT EXISTS structures (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  starting_stack int  NOT NULL DEFAULT 10000,
  max_players    int  NOT NULL DEFAULT 9,
  format         text NOT NULL DEFAULT '',
  levels         jsonb NOT NULL DEFAULT '[]',
  created_at     timestamptz DEFAULT now()
);
