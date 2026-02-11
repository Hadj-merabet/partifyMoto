# partifyMoto
Partify Moto te permet de trouver en quelques secondes les pièces compatibles avec ta moto au meilleur prix. Choisis la marque, le modèle et l’année, et découvre les meilleures offres du marché, triées automatiquement. Simple, rapide et économique : la bonne pièce, au bon prix.



## Lancement boutique (checklist rapide)

1. **Configurer les emails automatiques de commande** dans `index.html > emailConfig`:
   - `enabled: true`
   - `emailjsPublicKey`
   - `emailjsServiceId`
   - `emailjsTemplateCustomerId`
   - `emailjsTemplateMerchantId`
   - `shopEmail`
2. **Tester un achat** depuis le panier (`Payer ma commande`) et vérifier:
   - sauvegarde en localStorage (`orders`)
   - email client de confirmation
   - email boutique de notification
3. **Importer les produits vers Shopify** via le bouton `Exporter CSV Shopify`.
4. **Exporter le mapping fournisseur** via `Exporter JSON fournisseurs` pour suivi SKU / délais / coûts.

> Note: ce projet est un front statique. Pour un vrai lancement production, connecter un backend (paiement, stock temps réel, webhook commande).
