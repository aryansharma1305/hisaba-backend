#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-hisaba-backend}"
REGION="${REGION:-ams}"
APP_EXISTS=true

# Load local env file if present so DATABASE_URL/JWT_SECRET/CORS_ORIGINS can be reused.
if [[ -f ".env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

if ! command -v fly >/dev/null 2>&1; then
  echo "Error: fly CLI is not installed."
  exit 1
fi

if ! fly auth whoami >/dev/null 2>&1; then
  echo "Error: not logged into Fly. Run: fly auth login"
  exit 1
fi

if ! fly status -a "$APP_NAME" >/dev/null 2>&1; then
  APP_EXISTS=false
  echo "Creating Fly app '$APP_NAME' in region '$REGION'..."
  fly apps create "$APP_NAME" --machines
fi

if [[ "$APP_EXISTS" == "false" && -z "${DATABASE_URL:-}" ]]; then
  echo "Error: DATABASE_URL is required for first deployment."
  exit 1
fi

if [[ -z "${JWT_SECRET:-}" ]]; then
  if [[ "$APP_EXISTS" == "false" ]]; then
    JWT_SECRET="$(openssl rand -base64 48)"
    echo "JWT_SECRET was not provided. Generated one for initial deploy."
  else
    echo "JWT_SECRET not set locally; keeping existing Fly secret."
  fi
fi

if [[ -z "${CORS_ORIGINS:-}" ]]; then
  if [[ "$APP_EXISTS" == "false" ]]; then
    CORS_ORIGINS="*"
    echo "CORS_ORIGINS was not provided. Defaulting to '*'."
  else
    echo "CORS_ORIGINS not set locally; keeping existing Fly secret."
  fi
fi

SECRETS_ARGS=()

if [[ -n "${DATABASE_URL:-}" ]]; then
  SECRETS_ARGS+=("DATABASE_URL=$DATABASE_URL")
fi
if [[ -n "${JWT_SECRET:-}" ]]; then
  SECRETS_ARGS+=("JWT_SECRET=$JWT_SECRET")
fi
if [[ -n "${CORS_ORIGINS:-}" ]]; then
  SECRETS_ARGS+=("CORS_ORIGINS=$CORS_ORIGINS")
fi

# Keep these stable defaults on each deploy.
SECRETS_ARGS+=("NODE_ENV=production" "PORT=3000")

echo "Setting Fly secrets..."
fly secrets set "${SECRETS_ARGS[@]}" -a "$APP_NAME"

echo "Deploying app..."
fly deploy -a "$APP_NAME"

echo "Health check:"
curl -fsS "https://${APP_NAME}.fly.dev/health" || {
  echo "Health check failed. Inspect logs: fly logs -a $APP_NAME"
  exit 1
}

echo "Done."
