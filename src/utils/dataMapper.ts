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


