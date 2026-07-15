
-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'cliente');
CREATE TYPE public.categoria_produto AS ENUM ('vapes', 'estamparia', 'perfumes');
CREATE TYPE public.status_pedido AS ENUM ('pendente', 'pago', 'enviado', 'entregue', 'cancelado');
CREATE TYPE public.metodo_pagamento AS ENUM ('pix', 'cartao', 'boleto');
CREATE TYPE public.status_upload AS ENUM ('pendente', 'aprovado', 'rejeitado');

-- =========================
-- updated_at helper
-- =========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT,
  telefone TEXT,
  endereco JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- USER ROLES (separate table — security critical)
-- =========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================
-- Auto-create profile + assign cliente role on signup
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', '')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles policies
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- =========================
-- PRODUTOS
-- =========================
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE,
  descricao TEXT,
  categoria public.categoria_produto NOT NULL,
  preco NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  preco_promocional NUMERIC(10,2) CHECK (preco_promocional IS NULL OR preco_promocional >= 0),
  imagem_url TEXT,
  imagens TEXT[] DEFAULT '{}'::text[],
  estoque INTEGER NOT NULL DEFAULT 0,
  sabores TEXT[] DEFAULT '{}'::text[],
  tamanhos TEXT[] DEFAULT '{}'::text[],
  cores TEXT[] DEFAULT '{}'::text[],
  destaque BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_produtos_categoria ON public.produtos(categoria) WHERE ativo = true;
CREATE INDEX idx_produtos_destaque ON public.produtos(destaque) WHERE ativo = true;

GRANT SELECT ON public.produtos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.produtos TO authenticated;
GRANT ALL ON public.produtos TO service_role;

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.produtos FOR SELECT TO anon, authenticated
  USING (ativo = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage products"
  ON public.produtos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- PEDIDOS
-- =========================
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  produtos JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  frete NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (frete >= 0),
  desconto NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (desconto >= 0),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  status public.status_pedido NOT NULL DEFAULT 'pendente',
  pagamento_id TEXT,
  preference_id TEXT,
  metodo_pagamento public.metodo_pagamento,
  endereco_entrega JSONB NOT NULL,
  observacoes TEXT,
  codigo_rastreio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pedidos_cliente ON public.pedidos(cliente_id);
CREATE INDEX idx_pedidos_status ON public.pedidos(status);
CREATE INDEX idx_pedidos_preference ON public.pedidos(preference_id) WHERE preference_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders"
  ON public.pedidos FOR SELECT TO authenticated
  USING (auth.uid() = cliente_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own orders"
  ON public.pedidos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Admins update orders"
  ON public.pedidos FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- UPLOADS DE ESTAMPA
-- =========================
CREATE TABLE public.uploads_estampa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  arquivo_url TEXT NOT NULL,
  arquivo_path TEXT NOT NULL,
  arquivo_tipo TEXT,
  tamanho_mb NUMERIC(5,2),
  status public.status_upload NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_uploads_cliente ON public.uploads_estampa(cliente_id);

GRANT SELECT, INSERT ON public.uploads_estampa TO authenticated;
GRANT ALL ON public.uploads_estampa TO service_role;

ALTER TABLE public.uploads_estampa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own uploads"
  ON public.uploads_estampa FOR SELECT TO authenticated
  USING (auth.uid() = cliente_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own uploads"
  ON public.uploads_estampa FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Admins update uploads"
  ON public.uploads_estampa FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- AVALIACOES
-- =========================
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (produto_id, cliente_id)
);

CREATE INDEX idx_avaliacoes_produto ON public.avaliacoes(produto_id);

GRANT SELECT ON public.avaliacoes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.avaliacoes TO authenticated;
GRANT ALL ON public.avaliacoes TO service_role;

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON public.avaliacoes FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Users create own reviews"
  ON public.avaliacoes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Users update own reviews"
  ON public.avaliacoes FOR UPDATE TO authenticated
  USING (auth.uid() = cliente_id) WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Users delete own reviews"
  ON public.avaliacoes FOR DELETE TO authenticated
  USING (auth.uid() = cliente_id OR public.has_role(auth.uid(), 'admin'));
