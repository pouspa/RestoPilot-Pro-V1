RESTOPILOT PRO — VERSION 1 DE DÉMARRAGE

FONCTIONS PRÉSENTES
- Tableau de bord financier simple
- Catalogue de plats modifiable depuis l’interface
- Coût estimé par portion = coût du lot / portions vendables
- Marge brute estimée par portion et indicateur d’objectif de marge
- Enregistrement des ventes avec prix et coût historique du plat
- Annulation tracée des ventes
- Saisie des dépenses
- Enregistrement des ventes avec une date sélectionnable (par défaut : aujourd’hui)
- Filtre de l’historique pour afficher une journée précise ou toutes les dates
- Résumé journalier : ventes validées, coût estimé, dépenses du jour et résultat estimé
- Rapports par période avec tableau jour par jour ; les totaux quotidiens sont cumulés dans le rapport global
- Impression/export via la boîte de dialogue du navigateur
- Exportation et restauration manuelles des données en JSON
- Interface responsive Android/ordinateur
- Cache PWA pour démarrer hors connexion après un premier chargement depuis un hébergement HTTPS

LIMITES IMPORTANTES
- Cette version stocke les données dans le navigateur de l’appareil (localStorage). Elle n’a pas encore de serveur, de connexion utilisateur, de synchronisation multi-appareils ni de sauvegarde cloud automatique.
- Ne pas vider les données du navigateur ni désinstaller/effacer les données du navigateur avant d’avoir fait une sauvegarde JSON.
- Les plats et coûts préremplis sont fictifs et doivent être remplacés par les vrais coûts du restaurant.
- Le calcul de résultat = ventes validées - coût des recettes vendues - dépenses enregistrées. Ne saisis pas un achat d’ingrédients comme dépense de fonctionnement si tu comptes aussi déduire la consommation via le coût des plats, sinon il y aura double comptage.

POUR TESTER
1. Décompresser le ZIP.
2. Dans Ventes, vérifier la date de vente, puis choisir une date dans « Ventes par journée » pour isoler les ventes de ce jour. « Toutes les dates » réaffiche l’historique complet.
3. Dans Rapports, choisir les dates de début et de fin : le résumé global et le tableau « Récapitulatif jour par jour » incluent toutes les opérations valides de la période.
4. Pour le test le plus simple, ouvrir index.html dans un navigateur moderne. Le stockage local fonctionne, mais le mode PWA hors connexion n’est pleinement disponible qu’après hébergement HTTPS ou via un serveur local.
5. Pour installer comme application, publier les fichiers sur un hébergement HTTPS puis ouvrir l’adresse dans Chrome et choisir « Installer l’application » / « Ajouter à l’écran d’accueil ».
6. Faire une sauvegarde depuis Paramètres & sauvegarde avant toute manipulation importante.

ÉTAPE SUIVANTE POUR UN USAGE PROFESSIONNEL
Ajouter un backend sécurisé et PostgreSQL, une authentification propriétaire/employés, la sauvegarde cloud automatisée, la synchronisation idempotente, puis tester la restauration avant utilisation réelle.
