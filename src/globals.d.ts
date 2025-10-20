// Déclarations globales pour les fonctions manquantes

declare global {
  // Fonctions de transformation
  function CompleteArticle(article: any): any
  function CompleteProduction(production: any): any
  function CompleteLivraison(livraison: any): any
  function CompleteCommande(commande: any): any

  // Fonctions de service
  function updateAnalyse(id: number, data: any): Promise<any>
  function addAnalyse(data: any): Promise<any>
  function deleteAnalyseService(id: number): Promise<boolean>
  function updateUser(id: number, data: any): Promise<any>
  function createUser(data: any): Promise<any>
  function deleteUser(id: number): Promise<boolean>

  // Fonctions utilitaires
  function getMode(): string
  function getAnalyses(): Promise<any[]>
  function getProductions(): Promise<any[]>
}

export {}
