// Composable pour gérer le logo de l'application
export const useLogo = () => {
  const logo = '/logo.jpeg'
  
  return {
    logo,
    // Méthodes utilitaires pour le logo
    getLogoAlt: () => 'Global Star Distribution',
    getLogoClass: (size: 'small' | 'medium' | 'large' = 'medium') => {
      const sizeClasses = {
        small: 'h-8 w-8',
        medium: 'h-16 w-16', 
        large: 'h-24 w-24'
      }
      return `${sizeClasses[size]} rounded-xl object-cover`
    }
  }
}
