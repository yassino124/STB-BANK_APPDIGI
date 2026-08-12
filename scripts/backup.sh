#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  STB Banking Platform — MongoDB Backup Script
#  Usage: ./scripts/backup.sh
#  Cron (chaque nuit à 2h du matin): 0 2 * * * /opt/stb-banking/scripts/backup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Arrête le script si une erreur survient

# ── Configuration ─────────────────────────────────────────────────────────────
CONTAINER="stb_mongodb"
DB_NAME="stb_db"
BACKUP_DIR="/backups/stb-mongodb"
KEEP_DAYS=7  # Nombre de jours de backup à garder
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="stb_backup_${DATE}"

# Charger les variables d'environnement si disponibles
if [ -f /opt/stb-banking/.env ]; then
  source /opt/stb-banking/.env
fi

MONGO_USER="${MONGO_ROOT_USER:-stb_admin}"
MONGO_PASS="${MONGO_ROOT_PASS:-stb_secure_pass_2024}"

# ── Couleurs pour les logs ────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info()    { echo -e "${GREEN}[INFO]${NC}  $(date '+%Y-%m-%d %H:%M:%S') $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $(date '+%Y-%m-%d %H:%M:%S') $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"; }

# ── Vérifications préliminaires ───────────────────────────────────────────────
log_info "🚀 Démarrage du backup STB Banking..."

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
  log_error "Docker n'est pas installé ou accessible."
  exit 1
fi

# Vérifier que le container MongoDB tourne
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  log_error "Le container MongoDB '${CONTAINER}' n'est pas en cours d'exécution."
  exit 1
fi

# Créer le répertoire de backup
mkdir -p "${BACKUP_DIR}"
log_info "📁 Répertoire de backup: ${BACKUP_DIR}"

# ── Backup MongoDB ────────────────────────────────────────────────────────────
log_info "💾 Création du dump MongoDB (base: ${DB_NAME})..."

# Dump dans le container
docker exec "${CONTAINER}" mongodump \
  --authenticationDatabase admin \
  --username "${MONGO_USER}" \
  --password "${MONGO_PASS}" \
  --db "${DB_NAME}" \
  --out "/tmp/${BACKUP_NAME}" \
  --quiet

# Copier le dump hors du container
docker cp "${CONTAINER}:/tmp/${BACKUP_NAME}" "${BACKUP_DIR}/${BACKUP_NAME}"

# Nettoyer le dump dans le container
docker exec "${CONTAINER}" rm -rf "/tmp/${BACKUP_NAME}"

log_info "✅ Dump créé: ${BACKUP_DIR}/${BACKUP_NAME}"

# ── Compression ───────────────────────────────────────────────────────────────
log_info "🗜️  Compression du backup..."
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
  -C "${BACKUP_DIR}" \
  "${BACKUP_NAME}"

# Supprimer le dossier non compressé
rm -rf "${BACKUP_DIR}/${BACKUP_NAME}"

BACKUP_SIZE=$(du -sh "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)
log_info "📦 Archive créée: ${BACKUP_NAME}.tar.gz (${BACKUP_SIZE})"

# ── Checksum (intégrité) ──────────────────────────────────────────────────────
sha256sum "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" > "${BACKUP_DIR}/${BACKUP_NAME}.sha256"
log_info "🔐 Checksum SHA256 généré"

# ── Nettoyage des anciens backups ─────────────────────────────────────────────
log_info "🧹 Nettoyage des backups de plus de ${KEEP_DAYS} jours..."
find "${BACKUP_DIR}" -name "stb_backup_*.tar.gz" -mtime +${KEEP_DAYS} -delete
find "${BACKUP_DIR}" -name "stb_backup_*.sha256" -mtime +${KEEP_DAYS} -delete

REMAINING=$(ls "${BACKUP_DIR}"/stb_backup_*.tar.gz 2>/dev/null | wc -l)
log_info "📋 Backups conservés: ${REMAINING}"

# ── Rapport final ──────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ STB BACKUP TERMINÉ AVEC SUCCÈS"
echo "═══════════════════════════════════════════════════════"
echo "  Date     : $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Fichier  : ${BACKUP_NAME}.tar.gz"
echo "  Taille   : ${BACKUP_SIZE}"
echo "  Lieu     : ${BACKUP_DIR}"
echo "  Conservés: ${REMAINING} backup(s)"
echo "═══════════════════════════════════════════════════════"

exit 0
