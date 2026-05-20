-- ポイントテンプレートテーブル
CREATE TABLE IF NOT EXISTS point_templates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  description   text NOT NULL DEFAULT '',
  points        jsonb NOT NULL DEFAULT '[]',  -- [{rank: 1, pts: 15}, ...]
  is_published  boolean NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- ストラクチャーにポイントテンプレートを紐づける列を追加
ALTER TABLE structures
  ADD COLUMN IF NOT EXISTS point_template_id uuid REFERENCES point_templates(id) ON DELETE SET NULL;
