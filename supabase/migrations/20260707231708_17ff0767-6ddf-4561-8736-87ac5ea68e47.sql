
CREATE POLICY "Admins podem enviar imagens de produtos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar imagens de produtos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem remover imagens de produtos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'produtos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Qualquer pessoa vê imagens de produtos"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'produtos');
