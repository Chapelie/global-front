// Utilitaires pour mapper les données de l'API Laravel
// Convertit les propriétés snake_case en camelCase pour la compatibilité frontend

export function mapCommandeData(commande: any): any {
  return {
    ...commande,
    numeroCommande: commande.numero_commande || commande.numeroCommande,
    dateLivraisonSouhaitee: commande.date_livraison_souhaitee || commande.dateLivraisonSouhaitee,
    statutGlobalLivraison: commande.statut_global_livraison || commande.statutGlobalLivraison,
    totalLivraisons: commande.total_livraisons || commande.totalLivraisons,
    totalRestant: commande.total_restant || commande.totalRestant,
    userId: commande.user_id || commande.userId,
    createdAt: commande.created_at || commande.createdAt,
    updatedAt: commande.updated_at || commande.updatedAt
  }
}

export function mapLivraisonData(livraison: any): any {
  return {
    ...livraison,
    numeroBl: livraison.numero_bl || livraison.numeroBl,
    codeSuivi: livraison.code_suivi || livraison.codeSuivi,
    preuveDepot: livraison.preuve_depot || livraison.preuveDepot,
    preuveReception: livraison.preuve_reception || livraison.preuveReception,
    signatureClient: livraison.signature_client || livraison.signatureClient,
    signatureChauffeur: livraison.signature_chauffeur || livraison.signatureChauffeur,
    heureLivraison: livraison.heure_livraison || livraison.heureLivraison,
    dateLivraison: livraison.date_livraison || livraison.dateLivraison,
    totalCommande: livraison.total_commande || livraison.totalCommande,
    totalLivraison: livraison.total_livraison || livraison.totalLivraison,
    differenceTotale: livraison.difference_totale || livraison.differenceTotale,
    resteAPayerTotal: livraison.reste_a_payer_total || livraison.resteAPayerTotal,
    userId: livraison.user_id || livraison.userId,
    createdAt: livraison.created_at || livraison.createdAt,
    updatedAt: livraison.updated_at || livraison.updatedAt,
    // Mapper les produits
    produits: livraison.produits?.map((produit: any) => ({
      ...produit,
      quantiteCommandee: produit.quantite_commandee || produit.quantiteCommandee,
      quantiteLivree: produit.quantite_livree || produit.quantiteLivree,
      resteAPayer: produit.reste_a_payer || produit.resteAPayer
    })) || []
  }
}

export function mapProductionData(production: any): any {
  return {
    ...production,
    lotId: production.lot_id || production.lotId,
    heureDebut: production.heure_debut || production.heureDebut,
    heureFin: production.heure_fin || production.heureFin,
    userId: production.user_id || production.userId,
    createdAt: production.created_at || production.createdAt,
    updatedAt: production.updated_at || production.updatedAt,
    articlesProduits: production.articles_produits || production.articlesProduits || [],
    tempsEffectif: production.temps_effectif || production.tempsEffectif,
    rendement: production.rendement || production.rendement,
    coutProduction: production.cout_production || production.coutProduction,
    notes: production.notes || production.notes
  }
}

/**
 * Mapper pour ProductionBatch (lots de production)
 * Différent de Production (sessions de production)
 */
export function mapProductionBatchData(batch: any): any {
  // Extraire l'article produit
  const article = batch.product || batch.article || null
  
  // Construire les articles produits
  const articlesProduits = article ? [{
    nom: article.nom || article.name || '',
    quantiteProduite: batch.quantity || 0,
    unite: article.unite || article.unit || 'pièces'
  }] : []
  
  // Formater la date de production
  const productionDate = batch.production_date || batch.productionDate || batch.production_date_formatted
  let formattedDate = null
  if (productionDate) {
    if (typeof productionDate === 'string') {
      formattedDate = productionDate.split('T')[0]
    } else if (productionDate instanceof Date) {
      formattedDate = productionDate.toISOString().split('T')[0]
    } else {
      formattedDate = productionDate
    }
  }
  
  return {
    ...batch,
    // Champs de base
    articleId: batch.article_id || batch.articleId,
    batchNumber: batch.batch_number || batch.batchNumber,
    productionDate: productionDate,
    dryingStartDate: batch.drying_start_date || batch.dryingStartDate,
    readyDate: batch.ready_date || batch.readyDate,
    dryingDaysRemaining: batch.drying_days_remaining ?? batch.dryingDaysRemaining ?? 0,
    createdBy: batch.created_by || batch.createdBy,
    createdAt: batch.created_at || batch.createdAt,
    updatedAt: batch.updated_at || batch.updatedAt,
    
    // Relations
    product: article,
    article: article,
    creator: batch.creator || null,
    
    // Champs calculés (pour compatibilité avec le frontend)
    lotId: batch.batch_number || batch.lotId, // Utiliser batch_number comme lotId
    userId: batch.created_by || batch.userId,
    date: formattedDate, // Pour le frontend
    statut: batch.status || 'en_attente', // Mapper status vers statut
    articlesProduits: articlesProduits, // Articles produits avec quantités
    quantite_ciment: batch.quantite_ciment || 0, // Pourrait être dans les relations
    quantite_adjuvant: batch.quantite_adjuvant || 0, // Pourrait être dans les relations
    
    // Garder les champs originaux pour compatibilité
    article_id: batch.article_id,
    batch_number: batch.batch_number,
    production_date: productionDate,
    drying_start_date: batch.drying_start_date,
    ready_date: batch.ready_date,
    drying_days_remaining: batch.drying_days_remaining,
    created_by: batch.created_by,
    created_at: batch.created_at,
    updated_at: batch.updated_at,
    status: batch.status
  }
}

export function mapArticleData(article: any): any {
  return {
    ...article,
    seuilCritique: article.seuil_critique || article.seuilCritique,
    derniereMiseAJour: article.derniere_mise_a_jour || article.derniereMiseAJour,
    typeProduction: article.type_production || article.typeProduction,
    capaciteProduction: article.capacite_production || article.capaciteProduction,
    uniteProduction: article.unite_production || article.uniteProduction,
    coutProduction: article.cout_production || article.coutProduction,
    tempsProduction: article.temps_production || article.tempsProduction,
    userId: article.user_id || article.userId,
    createdAt: article.created_at || article.createdAt,
    updatedAt: article.updated_at || article.updatedAt
  }
}

// Fonction générique pour mapper un tableau de données
export function mapArrayData<T>(data: any[], mapper: (item: any) => T): T[] {
  return data.map(mapper)
}








