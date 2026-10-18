CREATE TABLE public.research_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), url text, file_path text, title text NOT NULL, created_by text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.research_items TO anon, authenticated;
GRANT ALL ON public.research_items TO service_role;
ALTER TABLE public.research_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read research" ON public.research_items FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.blog_posts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, body text NOT NULL, created_by text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read blog" ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.admin_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL, action text NOT NULL, item_type text, item_title text, ip text, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.admin_logs TO service_role;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.login_attempts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL, ip text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX ON public.login_attempts (email, ip, created_at);
GRANT ALL ON public.login_attempts TO service_role;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;