# Uploads / Storage (Onda E)

O endpoint `POST /api/v1/uploads` aceita multipart com campo `file` e devolve:

```json
{
  "url": "/uploads/2026-05/<uuid>.png",
  "key": "uploads/2026-05/<uuid>.png",
  "bytes": 12345,
  "content_type": "image/png",
  "backend": "local"
}
```

## Limites e tipos aceitos

- Máximo: 25 MB por arquivo
- Tipos aceitos: `image/*` (png, jpeg, webp, gif), `video/mp4`, `video/quicktime`, `video/webm`, `application/pdf`, `application/zip`

## Estratégia automática

`Uploads::StorageStrategy` decide o backend em runtime:

- Se as 4 vars `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_BUCKET`, `CLOUDFLARE_R2_ACCESS_KEY_ID` e `CLOUDFLARE_R2_SECRET_ACCESS_KEY` estiverem definidas, usa `Uploads::R2Adapter` (PUT direto S3-compatível com SigV4 manual, sem precisar do gem aws-sdk-s3).
- Caso contrário, grava em `public/uploads/<yyyy-mm>/<uuid>.<ext>` e devolve a URL relativa que o Rails ou o Vite servem em dev.

## Setup R2 em produção

1. Cloudflare Dashboard → R2 → Create bucket (`comunidade-uploads`).
2. R2 → Manage R2 API Tokens → Create API token (read+write no bucket).
3. (Opcional) R2 → Settings → Public access → Connect Domain (`cdn.comunidade.com`).
4. Defina no Fly.io:
   ```bash
   flyctl secrets set \
     CLOUDFLARE_R2_ACCOUNT_ID=... \
     CLOUDFLARE_R2_BUCKET=comunidade-uploads \
     CLOUDFLARE_R2_ACCESS_KEY_ID=... \
     CLOUDFLARE_R2_SECRET_ACCESS_KEY=... \
     CLOUDFLARE_R2_PUBLIC_URL=https://cdn.comunidade.com
   ```

Sem `CLOUDFLARE_R2_PUBLIC_URL` o adapter retorna a URL S3 padrão `https://<account>.r2.cloudflarestorage.com/<bucket>/<key>`, que exige bucket público para servir.

## Local dev

Sem variáveis configuradas o backend grava em `public/uploads/`. Essa pasta está no `.gitignore` e nunca vai pro repo.

Em produção evite o `LocalAdapter` — uploads locais somem a cada deploy do Fly.io porque o filesystem é efêmero.
