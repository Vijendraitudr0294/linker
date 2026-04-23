-- 1. reorder_links
CREATE OR REPLACE FUNCTION reorder_links(p_user_id uuid, p_order jsonb)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count int;
  v_invalid_count int;
BEGIN
  -- Validate that all IDs belong to 'p_user_id'
  SELECT count(*) INTO v_invalid_count
  FROM jsonb_to_recordset(p_order) AS x(id uuid)
  LEFT JOIN links l ON l.id = x.id AND l.user_id = p_user_id
  WHERE l.id IS NULL;

  IF v_invalid_count > 0 THEN
    RAISE EXCEPTION 'One or more link IDs do not belong to the user.';
  END IF;

  WITH updated AS (
    UPDATE links
    SET sort_order = v.order_index
    FROM (SELECT * FROM jsonb_to_recordset(p_order) AS x(id uuid, order_index int)) AS v
    WHERE links.id = v.id AND links.user_id = p_user_id
    RETURNING links.id
  )
  SELECT count(*) INTO v_count FROM updated;

  RETURN v_count;
END;
$$;
GRANT EXECUTE ON FUNCTION reorder_links(uuid, jsonb) TO authenticated;

-- 2. upsert_links
CREATE OR REPLACE FUNCTION upsert_links(p_user_id uuid, p_links jsonb)
RETURNS SETOF links
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO links (id, user_id, title, url, platform, sort_order, enabled)
  SELECT 
    COALESCE(x.id, gen_random_uuid()), 
    p_user_id, 
    x.title, 
    x.url, 
    x.platform, 
    x.sort_order, 
    COALESCE(x.is_active, true)
  FROM jsonb_to_recordset(p_links) AS x(id uuid, title text, url text, platform text, sort_order int, is_active boolean)
  ON CONFLICT (id) DO UPDATE
  SET 
    title = EXCLUDED.title,
    url = EXCLUDED.url,
    platform = EXCLUDED.platform,
    sort_order = EXCLUDED.sort_order,
    enabled = EXCLUDED.enabled
  WHERE links.user_id = p_user_id;
END;
$$;
GRANT EXECUTE ON FUNCTION upsert_links(uuid, jsonb) TO authenticated;

-- 3. delete_links (cascading to link_clicks assumed setup on FK)
CREATE OR REPLACE FUNCTION delete_links(p_user_id uuid, p_ids uuid[])
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count int;
BEGIN
  WITH deleted AS (
    DELETE FROM links
    WHERE user_id = p_user_id AND id = ANY(p_ids)
    RETURNING id
  )
  SELECT count(*) INTO v_count FROM deleted;
  
  RETURN v_count;
END;
$$;
GRANT EXECUTE ON FUNCTION delete_links(uuid, uuid[]) TO authenticated;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_links_user_order ON links(user_id, sort_order);

