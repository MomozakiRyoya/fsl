-- 選手テーブルに画像URL列を追加（注目選手の画像を選手に紐づけて再利用できるようにする）
ALTER TABLE players ADD COLUMN IF NOT EXISTS image_url text;
