# 🏆 Fixture FROPOREO — Live 2026

Fixture del Mundial 2026 (USA · México · Canadá) con **resultados automáticos** en tiempo real.

## ✨ Novedades vs versión original

| Feature | Original | Live |
|---------|----------|------|
| Resultados | Manual (toca para editar) | **🤖 Automáticos vía ESPN** |
| Actualización | On demand | **Cada ~3 min (90s si hay LIVE)** |
| GitHub Actions | ❌ | **✅ Actualiza scores.json c/5 min** |
| Override manual | ✅ | **✅ Tus ediciones no se pisan** |

## 🔄 Cómo funciona el auto-sync

1. **GitHub Actions** ejecuta `scripts/fetch-scores.js` cada 5 minutos
2. El script llama a la **ESPN API** y mapea los nombres de equipos al español
3. Los resultados se guardan en `data/scores.json` (archivo estático en GitHub Pages)
4. El **browser también llama a ESPN directamente** para updates más rápidos
5. Si un resultado fue editado manualmente, **el auto-sync NO lo pisa**

## 🛠 Desarrollo local

```bash
# Fetchear resultados manualmente
node scripts/fetch-scores.js

# Ver la app localmente
npx serve . -p 3000
```

## 📱 PWA

Instalable como app desde el browser (Android/iOS).

---
*By FROPOREO · Mundial 2026 🧡*
