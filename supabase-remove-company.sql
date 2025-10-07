-- Script pour supprimer la colonne 'company' de la table users
-- Exécuter dans l'éditeur SQL de Supabase si la colonne existe

-- Supprimer la colonne company si elle existe
ALTER TABLE public.users DROP COLUMN IF EXISTS company;

-- Vérifier que la colonne a été supprimée
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
