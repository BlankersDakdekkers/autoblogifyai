-- Give current user admin rights
INSERT INTO public.user_roles (user_id, role) 
VALUES ('23d16b01-f7f3-41dd-8b77-f44f21059931', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Log the role change in audit
INSERT INTO public.role_audit (user_id, new_role, changed_by)
VALUES ('23d16b01-f7f3-41dd-8b77-f44f21059931', 'admin', '23d16b01-f7f3-41dd-8b77-f44f21059931');