-- The items trigger runs as the editing admin and calls compute_points(), which 20261123000600_hardening
-- revoked from authenticated — so admins could not add or edit lessons. Run the trigger as its owner instead.
alter function public.items_set_points() security definer;
