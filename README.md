# Finger Filter — Hand-Tracked Canvas Filter

Real-time webcam filter que dibuja un cuadrilátero entre tus dos manos (pulgar + índice por mano) y aplica un filtro + tinte RGB **solo dentro del polígono**. Vista espejo, Angular 19 standalone + MediaPipe `HandLandmarker` + Angular Material.

## Cómo Funciona

### Pipeline
```
Webcam (getUserMedia)
  → <video> oculto (videoRef)
  → <canvas> (canvasRef) : frame crudo cada rAF
  → HandLandmarker.detectForVideo() (2 manos, modo VIDEO)
  → landmarks[0..1] — orden por Y para mano superior vs inferior
  → landmarks[4] (punta pulgar) + landmarks[8] (punta índice) por mano
  → suavizado LERP (lerpFactor=0.35)
  → recorte polígono (4 puntos) → drawImage filtrado → tinte RGB → borde
```

### Archivos Clave
- `src/finger-filter/finger-filter.component.ts:1-355` — lógica (MediaPipe, cámara, render loop, suavizado, máscara, filtros, limpieza) + helpers Material
- `src/finger-filter/finger-filter.component.html:1-115` — canvas espejado + panel `mat-card` con `mat-button-toggle-group`, `mat-slider` discretos y selector de color
- `src/finger-filter/finger-filter.styles.css:1-248` — layout, espejo CSS (`transform: scaleX(-1)`), panel con densidad compacta + responsive
- `src/styles.css:1-11` — tema prebuilt `azure-blue` + `@include mat.theme(density: -2)` compacto
- `src/main.ts:1-8` — bootstrap directo de `FingerFilterComponent`
- `src/app/app.config.ts` — `provideAnimations()` para Material, `provideRouter`

### Estado (Signals Angular 19)
Todo el estado interactivo usa `model()` (signal writable bidireccional). Material lo consume vía `[value]`/`(valueChange)`:

| Signal | Tipo | Rango | Propósito |
|---|---|---|---|
| `selectedEffect` | `model<FilterType>` | `invert \| grayscale \| sepia \| thermal` | Filtro activo |
| `amount` | `model<number>` | 0–100 | Intensidad global (fuerza del filtro + opacidad tinte) |
| `redAmount` / `greenAmount` / `blueAmount` | `model<number>` | 0–255 | Color tinte RGB |
| `hexColor` | `computed<string>` | `#rrggbb` | Hex derivado para selector |
| `rgbLabel` | `computed<string>` | `rgb(r,g,b)` | Preview |
| `error` | `signal<string\|null>` | — | Error init/cámara (banner) |

Labels 100% español: *Filtro* (Invertir/Grises/Sepia/Térmico), *Intensidad*, *Tono RGB*, *Selector*. `displayWith` muestra `%` y `0–255` en el thumb discreto.

### Landmarks
- `4 = punta pulgar`, `8 = punta índice`.
- `numHands: 2` obligatorio; `<2` manos → polígono oculto y reset de suavizado a `null` (modo estricto dos manos).
- Orden: `(thumb.y + index.y)/2` por mano determina superior vs inferior.

### Suavizado
`lerpPoint(current, target)` con `lerpFactor = 0.35` por punto. `0.1` muy suave/lag, `0.8` brusco. Reset a `null` al perder tracking → próximo detection hace snap.

### Renderizado
1. `clearRect` + `drawImage(video)` base.
2. `detectForVideo(video, performance.now())` síncrono cada frame.
3. Si 2 manos: `save` → polígono 4 puntos → `clip` → `filter = getFilterString()` → `drawImage(video)` filtrado → `filter='none'` → `rgba(r,g,b, amount/100*0.4)` → `stroke` borde → `restore`.
4. `requestAnimationFrame` con guards `isDestroyed`/`handLandmarker`/ `readyState`.

### Filtros
Factor `f = amount/100`:
- `Invertir`: `invert(100f%) contrast(100+120f%) grayscale(100f%)`
- `Grises`: `grayscale(100f%) contrast(100+30f%) brightness(100-10f%)`
- `Sepia`: `sepia(100f%) contrast(100+50f%) brightness(90+20f%)`
- `Térmico`: `invert(100f%) hue-rotate(180f°) saturate(100+300f%)`

### Espejo — CSS
`transform: scaleX(-1)` en `filter-canvas`. Sin `ctx.scale`.

### Controles Material (nuevo)
- **Filtro**: `mat-button-toggle-group` (`hideSingleSelectionIndicator=false`) con `<mat-icon>` (`invert_colors`, `filter_b_and_w`, `filter_vintage`, `whatshot`) + etiquetas español. Binding: `[value]="selectedEffect()" (change)="selectedEffect.set($event.value)"`.
- **Intensidad**: `mat-slider discrete [displayWith]="displayWithPercent"` (0–100). Thumb: `<input matSliderThumb [value]="amount()" (valueChange)="amount.set($event)">`.
- **Tono RGB — ambos**: 3× `mat-slider discrete [displayWith]="displayWith255"` (R/G/B 0–255) con valor numérico a la derecha + `<input type="color">` nativo circular + `mat-form-field` Hex readonly. Sync vía `hexColor` computed y `onHexColorChange` (hex→rgb). Preview círculo + hex badge.

### Densidad & Tema
- Prebuilt `azure-blue.css` en `angular.json:30` (zero config).
- Densidad compacta `-2` inyectada en `src/styles.css` vía `@include mat.theme((color: mat.$azure-palette, typography: Roboto, density: -2))` — reduce 8px vs default. Panel `mat-card` `appearance="outlined"` `mat-elevation-z8` con `backdrop-filter: blur(12px)`, responsive `<600px`.

## Instalación & Uso

```bash
npm install
ng serve              # http://localhost:4200 — permitir cámara
ng build              # prod → dist/finger-filter (presupuesto 800kB/1.2MB)
ng test               # Karma (spec placeholder)
```

Requisitos: HTTPS o `localhost`, cámara, WebGL. `@angular/material@19.2.19` + `@angular/cdk` + `@angular/animations` ya instalados. CDN: wasm + `hand_landmarker.task` en primera carga.

## Cómo Modificar

### Añadir Filtro
1. Extender `FilterType:22` y `effectLabels`/`effectIcons` + `effects[]:51`.
2. Caso en `getFilterString:331-342` (usar funciones CSS `blur`, `hue-rotate`, etc., con `factor`).
3. Icono Material disponible en https://fonts.google.com/icons.

### Intensidad / Tinte
- Opacidad tinte `(amount()/100)*0.4` en `applyFilterMask:318`. Para independiente: `tintAmount = model(40)` + slider.
- Ajustar constantes por filtro en `getFilterString`.

### Landmarks Diferentes
Índices en `renderLoop:226-241`: `4` pulgar, `8` índice, `12` medio, `0` muñeca. Para 1 mano: `>=2` → `>=1`.

### Suavizado
`lerpFactor = 0.35:122` — exponer como `model` + slider si quieres tuning.

### Resolución
`setupWebcam:165` usa 1280×720 fijos. Para adaptativo: `{width:{ideal:1280}}` + `ResizeObserver`.

## Troubleshooting

| Síntoma | Causa | Solución |
|---|---|---|
| Banner "permiso denegado" | Bloqueo | Permitir en `chrome://settings/content/camera`, recargar |
| "No hay cámara" | Sin dispositivo/VM | Conectar, verificar |
| WASM 404 | CDN bloqueado | `connect-src` para `cdn.jsdelivr.net` + `storage.googleapis.com` |
| Build `initial exceeded 800kB` | Material + animations | Presupuesto ya subido a 800kB/1.2MB y `anyComponentStyle` 8/12kB |
| Slider Material sin estilo | Falta `provideAnimations()` | Verificado en `app.config.ts` |

## Limitaciones Conocidas
- Requiere 2 manos exactas.
- WASM `latest` no pineado; `GPU` sin fallback CPU.
- `stroke()` dentro de `clip()` → borde medio-recortado; opacidad tinte acoplada a intensidad.

## Estructura
```
src/
  finger-filter/
    finger-filter.component.ts
    finger-filter.component.html
    finger-filter.styles.css
  styles.css               # mat.theme densidad compacta
  app/app.config.ts        # provideAnimations
  main.ts
```

## Licencia
Angular 19 + MediaPipe Tasks Vision. Material Design © Google.
