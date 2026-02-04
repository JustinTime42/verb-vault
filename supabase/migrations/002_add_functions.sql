-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(theme_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE themes
  SET download_count = download_count + 1
  WHERE id = theme_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users and anon
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO anon;
