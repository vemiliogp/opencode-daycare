-- Revoke EXECUTE on handle_new_user from public roles
-- so it can only be called by the trigger, not via REST RPC
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
