CREATE TABLE IF NOT EXISTS player_results (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id    text NOT NULL,
  player_id   text NOT NULL,
  player_name text NOT NULL DEFAULT '',
  team_id     text NOT NULL DEFAULT '',
  team_name   text NOT NULL DEFAULT '',
  rank        int,
  points      int NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);
