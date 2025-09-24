-- Script d'initialisation des données par défaut pour Supabase
-- Exécuter après avoir créé les tables et configuré RLS

-- 1. Créer l'utilisateur admin par défaut
-- Note: L'utilisateur sera créé via l'interface d'authentification Supabase
-- Ce script configure les données une fois l'utilisateur créé

-- 2. Insérer des articles de démonstration (optionnel)
INSERT INTO public.articles (
  nom, categorie, stock, seuil_critique, unite, prix, fournisseur, 
  type_production, capacite_production, unite_production, cout_production, 
  temps_production, qualite, actif
) VALUES 
  ('Brique rouge standard', 'Briques', 1000, 100, 'pièces', 0.50, 'Fournisseur A', 'Brique', 500, 'pièces/jour', 0.30, 2, 'Standard', true),
  ('Ciment Portland', 'Ciments', 500, 50, 'sacs', 8.00, 'Cimenterie B', 'Ciment', 200, 'sacs/jour', 5.00, 1, 'Premium', true),
  ('Sable fin', 'Granulats', 2000, 200, 'm³', 25.00, 'Carrière C', 'Granulat', 100, 'm³/jour', 15.00, 0.5, 'Standard', true),
  ('Gravier 5/15', 'Granulats', 1500, 150, 'm³', 30.00, 'Carrière C', 'Granulat', 80, 'm³/jour', 18.00, 0.5, 'Standard', true),
  ('Eau', 'Liquides', 10000, 1000, 'L', 0.01, 'Réseau public', 'Liquide', 1000, 'L/jour', 0.005, 0.1, 'Standard', true)
ON CONFLICT DO NOTHING;

-- 3. Créer des productions de démonstration (optionnel)
INSERT INTO public.productions (date, statut, lot_id, heure_debut, heure_fin, temps_effectif) VALUES
  (CURRENT_DATE, 'termine', 'LOT-2024-001', '08:00:00', '16:00:00', 480),
  (CURRENT_DATE - INTERVAL '1 day', 'termine', 'LOT-2024-002', '08:30:00', '17:00:00', 510),
  (CURRENT_DATE - INTERVAL '2 days', 'en_cours', 'LOT-2024-003', '09:00:00', NULL, NULL)
ON CONFLICT DO NOTHING;

-- 4. Lier les articles aux productions
INSERT INTO public.articles_produits (production_id, article_id, quantite_produite, quantite_planifiee, unite) VALUES
  (1, 1, 500, 500, 'pièces'),
  (1, 2, 50, 50, 'sacs'),
  (2, 1, 600, 600, 'pièces'),
  (2, 3, 10, 10, 'm³'),
  (3, 1, 300, 400, 'pièces')
ON CONFLICT DO NOTHING;

-- 5. Créer des commandes de démonstration
INSERT INTO public.commandes (
  numero_commande, date, client, telephone, email, adresse, 
  statut, date_livraison_souhaitee, priorite
) VALUES
  ('CMD-2024-001', CURRENT_DATE, 'Client ABC', '0123456789', 'client@abc.com', '123 Rue Example', 'en_preparation', CURRENT_DATE + INTERVAL '2 days', 'normale'),
  ('CMD-2024-002', CURRENT_DATE - INTERVAL '1 day', 'Client XYZ', '0987654321', 'client@xyz.com', '456 Avenue Test', 'livree', CURRENT_DATE, 'haute'),
  ('CMD-2024-003', CURRENT_DATE, 'Client DEF', '0555666777', 'client@def.com', '789 Boulevard Demo', 'en_attente', CURRENT_DATE + INTERVAL '3 days', 'normale')
ON CONFLICT DO NOTHING;

-- 6. Lier les produits aux commandes
INSERT INTO public.produits_commandes (commande_id, nom, quantite, unite) VALUES
  (1, 'Brique rouge standard', 200, 'pièces'),
  (1, 'Ciment Portland', 10, 'sacs'),
  (2, 'Brique rouge standard', 300, 'pièces'),
  (2, 'Sable fin', 5, 'm³'),
  (3, 'Gravier 5/15', 8, 'm³'),
  (3, 'Ciment Portland', 15, 'sacs')
ON CONFLICT DO NOTHING;

-- 7. Créer des livraisons de démonstration
INSERT INTO public.livraisons (
  numero_bl, date, client, telephone, chauffeur, statut, adresse, 
  code_suivi, total_commande, total_livraison, difference_totale, reste_a_payer_total
) VALUES
  ('BL-2024-001', CURRENT_DATE, 'Client ABC', '0123456789', 'Chauffeur 1', 'livre', '123 Rue Example', 'SUIVI-001', 120.00, 120.00, 0.00, 0.00),
  ('BL-2024-002', CURRENT_DATE - INTERVAL '1 day', 'Client XYZ', '0987654321', 'Chauffeur 2', 'livre', '456 Avenue Test', 'SUIVI-002', 180.00, 175.00, -5.00, 5.00),
  ('BL-2024-003', CURRENT_DATE, 'Client DEF', '0555666777', 'Chauffeur 1', 'en_cours', '789 Boulevard Demo', 'SUIVI-003', 250.00, 0.00, -250.00, 250.00)
ON CONFLICT DO NOTHING;

-- 8. Lier les produits aux livraisons
INSERT INTO public.produits_livres (
  livraison_id, nom, quantite, unite, quantite_commandee, quantite_livree, 
  difference, reste_a_payer
) VALUES
  (1, 'Brique rouge standard', 200, 'pièces', 200, 200, 0, 0.00),
  (1, 'Ciment Portland', 10, 'sacs', 10, 10, 0, 0.00),
  (2, 'Brique rouge standard', 300, 'pièces', 300, 295, -5, 2.50),
  (2, 'Sable fin', 5, 'm³', 5, 5, 0, 0.00),
  (3, 'Gravier 5/15', 8, 'm³', 8, 0, -8, 240.00),
  (3, 'Ciment Portland', 15, 'sacs', 15, 0, -15, 120.00)
ON CONFLICT DO NOTHING;

-- 9. Créer des employés de démonstration
INSERT INTO public.employes (
  nom, prenom, poste, telephone, email, date_embauche, salaire, statut
) VALUES
  ('Dupont', 'Jean', 'Ouvrier', '0111111111', 'jean.dupont@globalstar.com', '2023-01-15', 1500.00, 'actif'),
  ('Martin', 'Marie', 'Secrétaire', '0222222222', 'marie.martin@globalstar.com', '2023-03-01', 1800.00, 'actif'),
  ('Durand', 'Pierre', 'Chauffeur', '0333333333', 'pierre.durand@globalstar.com', '2023-02-10', 1600.00, 'actif'),
  ('Leroy', 'Sophie', 'Comptable', '0444444444', 'sophie.leroy@globalstar.com', '2023-04-01', 2000.00, 'actif')
ON CONFLICT DO NOTHING;

-- 10. Créer des rapports quotidiens de démonstration
INSERT INTO public.rapports_quotidiens (
  date, production_totale, livraisons_effectuees, commandes_recues, observations
) VALUES
  (CURRENT_DATE, 500, 2, 1, 'Journée productive, tout s\'est bien passé'),
  (CURRENT_DATE - INTERVAL '1 day', 600, 3, 2, 'Excellente journée, objectifs dépassés'),
  (CURRENT_DATE - INTERVAL '2 days', 400, 1, 0, 'Journée plus calme, maintenance effectuée')
ON CONFLICT DO NOTHING;

-- 11. Créer des transferts de démonstration
INSERT INTO public.transferts (
  numero_bordereau, date, client, telephone, email, adresse, 
  chauffeur_nom, chauffeur_telephone, statut, notes
) VALUES
  ('TRF-2024-001', CURRENT_DATE, 'Client ABC', '0123456789', 'client@abc.com', '123 Rue Example', 'Chauffeur 1', '0111111111', 'termine', 'Transfert effectué avec succès'),
  ('TRF-2024-002', CURRENT_DATE - INTERVAL '1 day', 'Client XYZ', '0987654321', 'client@xyz.com', '456 Avenue Test', 'Chauffeur 2', '0222222222', 'en_cours', 'En cours de livraison'),
  ('TRF-2024-003', CURRENT_DATE, 'Client DEF', '0555666777', 'client@def.com', '789 Boulevard Demo', 'Chauffeur 1', '0111111111', 'en_preparation', 'Préparation en cours')
ON CONFLICT DO NOTHING;

-- 12. Lier les produits aux transferts
INSERT INTO public.produits_transferes (
  transfert_id, designation, quantite, unite, observation
) VALUES
  (1, 'Brique rouge standard', 200, 'pièces', 'Briques de qualité standard'),
  (1, 'Ciment Portland', 10, 'sacs', 'Ciment de qualité premium'),
  (2, 'Brique rouge standard', 300, 'pièces', 'Briques pour construction'),
  (2, 'Sable fin', 5, 'm³', 'Sable tamisé fin'),
  (3, 'Gravier 5/15', 8, 'm³', 'Gravier calibré'),
  (3, 'Ciment Portland', 15, 'sacs', 'Ciment pour fondations')
ON CONFLICT DO NOTHING;

-- 13. Créer des documents de démonstration
INSERT INTO public.documents (
  nom, type, taille, url, description
) VALUES
  ('Manuel_Production.pdf', 'PDF', 1024000, '/documents/manuel_production.pdf', 'Manuel de production des briques'),
  ('Procedure_Qualite.docx', 'DOCX', 512000, '/documents/procedure_qualite.docx', 'Procédures de contrôle qualité'),
  ('Plan_Usine.dwg', 'DWG', 2048000, '/documents/plan_usine.dwg', 'Plan de l\'usine de production')
ON CONFLICT DO NOTHING;

-- 14. Créer des consommables utilisés (liés aux productions)
INSERT INTO public.consommables_utilises (production_id, article_id, quantite_utilisee) VALUES
  (1, 3, 2), -- Sable fin pour production 1
  (1, 4, 1), -- Gravier pour production 1
  (1, 5, 100), -- Eau pour production 1
  (2, 3, 3), -- Sable fin pour production 2
  (2, 4, 2), -- Gravier pour production 2
  (2, 5, 150) -- Eau pour production 2
ON CONFLICT DO NOTHING;

-- Message de confirmation
SELECT 'Données de démonstration insérées avec succès!' as message;
