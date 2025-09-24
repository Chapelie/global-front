<template>
  <div class="transfert-bordereau">
    <!-- En-tête du bordereau -->
    <div class="bl-header">
      <div class="company-info">
        <div class="company-logo">
          <img :src="logo" :alt="getLogoAlt()" class="logo-image" />
        </div>
        <div class="company-details">
          <h1 class="company-name">GLOBAL STAR DISTRIBUTION</h1>
          <div class="company-address">
            <p><strong>Numéro d'entreprise :</strong> 6201798/51747100</p>
            <p><strong>Adresse :</strong> Yimdi route de Bobo, 300 m avant le péage</p>
            <p><strong>Email :</strong> gelil.Savadogo@yahoo.com</p>
          </div>
        </div>
      </div>
      
      <!-- Informations du bordereau -->
      <div class="bordereau-info">
        <h2 class="bordereau-title">BORDEREAU DE TRANSFERT</h2>
        <div class="bordereau-details">
          <p><strong>Date :</strong> {{ formatDate(livraison.date) }}</p>
          <p><strong>N° Bordereau :</strong> {{ livraison.numeroBL }}</p>
          <p v-if="livraison.codeSuivi"><strong>Code de suivi :</strong> {{ livraison.codeSuivi }}</p>
        </div>
      </div>
    </div>

    <!-- Informations client -->
    <div class="client-info">
      <h3>INFORMATIONS CLIENT</h3>
      <div class="client-details">
        <p><strong>Nom :</strong> {{ livraison.client }}</p>
        <p v-if="livraison.telephone"><strong>Téléphone :</strong> {{ livraison.telephone }}</p>
        <p v-if="livraison.adresse"><strong>Adresse :</strong> {{ livraison.adresse }}</p>
      </div>
    </div>

    <!-- Tableau des produits -->
    <div class="products-section">
      <h3>DÉTAIL DU TRANSFERT</h3>
      <table class="products-table">
        <thead>
          <tr>
            <th>Désignation</th>
            <th>Quantité</th>
            <th>Observation</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(produit, index) in livraison.produits" :key="index">
            <td>{{ produit.nom }}</td>
            <td class="text-center">{{ produit.quantite }} {{ produit.unite }}</td>
            <td>{{ produit.observation || '-' }}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Total -->
      <div class="total-section">
        <p class="total-text"><strong>TOTAL : {{ getTotalQuantite() }} articles</strong></p>
      </div>
    </div>

    <!-- Signatures -->
    <div class="signatures-section">
      <div class="signature-box">
        <h4>CHAUFFEUR</h4>
        <div class="signature-line">
          <p>Nom : _________________________</p>
          <p>Signature : _________________________</p>
          <p>Date : _________________________</p>
        </div>
      </div>
      
      <div class="signature-box">
        <h4>CLIENT</h4>
        <div class="signature-line">
          <p>Nom : _________________________</p>
          <p>Signature : _________________________</p>
          <p>Date : _________________________</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLogo } from '../composables/useLogo'
import type { Livraison } from '../services/storage'

interface Props {
  livraison: Livraison
}

const props = defineProps<Props>()
const { logo, getLogoAlt } = useLogo()

// Fonctions utilitaires
const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getTotalQuantite = () => {
  return props.livraison.produits.reduce((total, produit) => total + produit.quantite, 0)
}
</script>

<style scoped>
.transfert-bordereau {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  line-height: 1.4;
}

/* En-tête */
.bl-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 3px solid #f97316;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.company-info {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.company-logo {
  flex-shrink: 0;
}

.logo-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border: 2px solid #f97316;
  border-radius: 8px;
}

.company-details {
  flex: 1;
}

.company-name {
  font-size: 24px;
  font-weight: bold;
  color: #f97316;
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.company-address {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

.company-address p {
  margin: 5px 0;
}

.bordereau-info {
  text-align: right;
  min-width: 250px;
}

.bordereau-title {
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.bordereau-details {
  font-size: 14px;
  color: #374151;
}

.bordereau-details p {
  margin: 8px 0;
  font-weight: 500;
}

/* Informations client */
.client-info {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border-left: 4px solid #f97316;
}

.client-info h3 {
  font-size: 16px;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 15px 0;
  text-transform: uppercase;
}

.client-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
}

.client-details p {
  margin: 5px 0;
  font-size: 14px;
  color: #374151;
}

/* Section produits */
.products-section {
  margin-bottom: 30px;
}

.products-section h3 {
  font-size: 16px;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 15px 0;
  text-transform: uppercase;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  border: 1px solid #d1d5db;
}

.products-table th {
  background: #f97316;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: bold;
  font-size: 14px;
  text-transform: uppercase;
}

.products-table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #374151;
}

.products-table tr:nth-child(even) {
  background: #f9fafb;
}

.products-table tr:hover {
  background: #f3f4f6;
}

.text-center {
  text-align: center;
}

.total-section {
  text-align: right;
  margin-top: 20px;
  padding: 15px;
  background: #fef3c7;
  border-radius: 8px;
  border: 2px solid #f59e0b;
}

.total-text {
  font-size: 16px;
  color: #92400e;
  margin: 0;
}

/* Signatures */
.signatures-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin: 40px 0;
  padding: 20px 0;
  border-top: 2px solid #e5e7eb;
}

.signature-box {
  text-align: center;
}

.signature-box h4 {
  font-size: 14px;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 20px 0;
  text-transform: uppercase;
}

.signature-line {
  border: 1px solid #d1d5db;
  padding: 20px;
  min-height: 100px;
  background: #f9fafb;
}

.signature-line p {
  margin: 10px 0;
  font-size: 14px;
  color: #374151;
  text-align: left;
}

/* Responsive */
@media (max-width: 768px) {
  .bl-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .company-info {
    flex-direction: column;
    text-align: center;
  }
  
  .bordereau-info {
    text-align: center;
  }
  
  .client-details {
    grid-template-columns: 1fr;
  }
  
  .signatures-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* Styles d'impression */
@media print {
  .transfert-bordereau {
    padding: 0;
    max-width: none;
  }
  
  .bl-header {
    border-bottom: 2px solid #f97316;
  }
  
  .company-name {
    color: #000;
  }
  
  .bordereau-title {
    color: #000;
  }
}
</style>