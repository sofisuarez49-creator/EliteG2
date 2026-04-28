        // Configuración de tu proyecto de Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyAcW679YdIT03pyq8IgKKnR8oyO4_fvpFs",
            authDomain: "g2elite-a3b85.firebaseapp.com",
            databaseURL: "https://g2elite-a3b85-default-rtdb.firebaseio.com/",
            projectId: "g2elite-a3b85",
            storageBucket: "g2elite-a3b85.firebasestorage.app",
            messagingSenderId: "951346482286",
            appId: "1:951346482286:web:6001135252de2a4d982a7f",
        };

        // Inicializar Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.database();
        const { useState, useEffect, useMemo, useRef } = React;

        const GALLERY_LABELS = ['C', 'P', 'B', 'N', 'S', 'E', 'X'];
        const GALLERY_VIEW_MODES = ['PERSONAJE', 'ETIQUETA', 'CARPETA', 'GENERAL'];
        const GALLERY_VIEW_MODE_LABELS = {
            PERSONAJE: 'Personaje',
            ETIQUETA: 'Etiqueta',
            CARPETA: 'Carpetas',
            GENERAL: 'General'
        };
        const BATTLE_PHOTO_SLOTS = [
            { id: 'pechos', label: 'Pechos', labels: ['P'] },
            { id: 'colaPiernas', label: 'Cola/Piernas', labels: ['C'] },
            { id: 'cuerpoCintura', label: 'Cuerpo/Cintura', labels: ['N', 'B'] },
            { id: 'sensualidad', label: 'Sensualidad', labels: ['E', 'S'] }
        ];
        const BATTLE_ARENA_TO_SLOT = {
            pecho: 'pechos',
            pechos: 'pechos',
            cola: 'colaPiernas',
            piernas: 'colaPiernas',
            cuerpo: 'cuerpoCintura',
            cintura: 'cuerpoCintura',
            sensualidad: 'sensualidad'
        };
        const getDefaultBattlePhotoPreferences = () => (
            BATTLE_PHOTO_SLOTS.reduce((acc, slot) => {
                acc[slot.id] = '';
                return acc;
            }, {})
        );
        const sanitizeBattlePhotoPreferences = (prefs = {}) => {
            const defaults = getDefaultBattlePhotoPreferences();
            const candidate = prefs && typeof prefs === 'object' ? prefs : {};
            return Object.keys(defaults).reduce((acc, key) => {
                acc[key] = typeof candidate[key] === 'string' ? candidate[key].trim() : '';
                return acc;
            }, { ...defaults });
        };
        const getBattleSlotById = (slotId = '') => BATTLE_PHOTO_SLOTS.find((slot) => slot.id === slotId);
        const getBattleSlotForArena = (arenaName = '') => BATTLE_ARENA_TO_SLOT[(arenaName || '').trim().toLowerCase()] || '';
        const getCompatibleBattleSlotsForLabel = (label = '') => BATTLE_PHOTO_SLOTS.filter((slot) => slot.labels.includes(label));
        const GALLERY_LABEL_STYLES = {
            C: {
                bg: 'linear-gradient(135deg, rgba(34,211,238,0.92), rgba(14,116,144,0.95))',
                border: 'rgba(103,232,249,0.95)',
                glow: 'rgba(34,211,238,0.8)',
                text: '#ecfeff'
            },
            P: {
                bg: 'linear-gradient(135deg, rgba(244,114,182,0.92), rgba(157,23,77,0.95))',
                border: 'rgba(251,207,232,0.95)',
                glow: 'rgba(244,114,182,0.78)',
                text: '#fff1f2'
            },
            B: {
                bg: 'linear-gradient(135deg, rgba(251,191,36,0.94), rgba(180,83,9,0.95))',
                border: 'rgba(253,224,71,0.98)',
                glow: 'rgba(251,191,36,0.82)',
                text: '#fffbea'
            },
            N: {
                bg: 'linear-gradient(135deg, rgba(163,230,53,0.92), rgba(63,98,18,0.95))',
                border: 'rgba(217,249,157,0.95)',
                glow: 'rgba(163,230,53,0.78)',
                text: '#f7fee7'
            },
            S: {
                bg: 'linear-gradient(135deg, rgba(192,132,252,0.92), rgba(107,33,168,0.95))',
                border: 'rgba(233,213,255,0.95)',
                glow: 'rgba(192,132,252,0.8)',
                text: '#faf5ff'
            },
            E: {
                bg: 'linear-gradient(135deg, rgba(248,113,113,0.92), rgba(153,27,27,0.95))',
                border: 'rgba(254,202,202,0.95)',
                glow: 'rgba(248,113,113,0.8)',
                text: '#fef2f2'
            },
            X: {
                bg: 'linear-gradient(135deg, rgba(239,68,68,0.98), rgba(127,29,29,0.98))',
                border: 'rgba(254,226,226,1)',
                glow: 'rgba(239,68,68,0.95)',
                text: '#fff7f7'
            },
            DEFAULT: {
                bg: 'linear-gradient(135deg, rgba(51,65,85,0.92), rgba(15,23,42,0.95))',
                border: 'rgba(148,163,184,0.85)',
                glow: 'rgba(148,163,184,0.45)',
                text: '#f8fafc'
            }
        };
        const clampIndex = (index, total) => {
            if (!total) return 0;
            return (index + total) % total;
        };
        const getNextPlayableIndex = (currentIndex, items, useRandom = false) => {
            const total = Array.isArray(items) ? items.length : 0;
            if (!total) return null;
            if (total === 1) return 0;

            if (useRandom) {
                const candidateIndexes = items
                    .map((item, idx) => ({ item, idx }))
                    .filter(({ item, idx }) => idx !== currentIndex && item && item.url)
                    .map(({ idx }) => idx);
                if (!candidateIndexes.length) return clampIndex((currentIndex ?? 0) + 1, total);
                return candidateIndexes[Math.floor(Math.random() * candidateIndexes.length)];
            }

            return clampIndex((currentIndex ?? 0) + 1, total);
        };
        const getGalleryLabelStyle = (label) => GALLERY_LABEL_STYLES[label] || GALLERY_LABEL_STYLES.DEFAULT;
        const getGalleryFilterButtonStyle = (label, isActive = false) => {
            const styleForLabel = label === 'INICIAL'
                ? GALLERY_LABEL_STYLES.DEFAULT
                : label === '100'
                    ? GALLERY_LABEL_STYLES.B
                    : getGalleryLabelStyle(label);
            return {
                '--btn-neon-color': styleForLabel.glow,
                borderColor: styleForLabel.border,
                color: styleForLabel.text,
                boxShadow: isActive
                    ? `inset 0 1px 0 rgba(186,230,253,0.35), 0 0 0 1px ${styleForLabel.border}, 0 0 20px ${styleForLabel.glow}`
                    : `inset 0 1px 0 rgba(186,230,253,0.2), 0 0 0 1px color-mix(in srgb, ${styleForLabel.border} 65%, rgba(15,23,42,0.65) 35%), 0 0 12px color-mix(in srgb, ${styleForLabel.glow} 60%, transparent)`,
                textShadow: `0 0 8px color-mix(in srgb, ${styleForLabel.glow} 70%, transparent)`,
                filter: isActive ? 'brightness(1.14)' : 'brightness(1)'
            };
        };
        const VIDEO_FILE_REGEX = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;
        const GIF_FILE_REGEX = /\.gif(\?.*)?$/i;
        const SCENE_FREE_CATEGORIES = ['General', 'Acción', 'Romántica', 'NSFW'];
        const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
        const VIMEO_REGEX = /vimeo\.com\/(?:video\/)?(\d+)/i;
        const getVideoEmbedInfo = (url) => {
            const normalizedUrl = (url || '').trim();
            if (!normalizedUrl) return null;

            const youtubeMatch = normalizedUrl.match(YOUTUBE_REGEX);
            if (youtubeMatch) {
                return {
                    provider: 'youtube',
                    src: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
                    title: 'Video de YouTube'
                };
            }

            const vimeoMatch = normalizedUrl.match(VIMEO_REGEX);
            if (vimeoMatch) {
                return {
                    provider: 'vimeo',
                    src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
                    title: 'Video de Vimeo'
                };
            }

            return null;
        };
        const BLOCKED_MEDIA_HOST_PATTERNS = ['eporner.com'];
        const INSECURE_MEDIA_CLEANUP_PATH = 'mediaCleanupQueue';
        const createInsecureMediaEntry = ({
            originalUrl = '',
            sanitizedUrl = '',
            contextPath = '',
            reason = 'unknown',
            status = 'flagged'
        } = {}) => ({
            originalUrl,
            sanitizedUrl,
            contextPath,
            reason,
            status,
            detectedAt: firebase.database.ServerValue.TIMESTAMP
        });
        const sanitizeMediaUrl = (rawUrl = '', fallback = '', { contextPath = '' } = {}) => {
            const normalized = String(rawUrl || '').trim();
            const fallbackValue = String(fallback || '').trim();
            if (!normalized) {
                return { url: fallbackValue, changed: normalized !== fallbackValue, flagged: false, reason: '', originalUrl: normalized };
            }
            if (isBlockedMediaUrl(normalized)) {
                return {
                    url: fallbackValue,
                    changed: normalized !== fallbackValue,
                    flagged: true,
                    reason: 'blocked_host',
                    originalUrl: normalized,
                    contextPath
                };
            }
            if (normalized.startsWith('http://')) {
                return {
                    url: normalized.replace(/^http:\/\//i, 'https://'),
                    changed: true,
                    flagged: true,
                    reason: 'http_upgraded',
                    originalUrl: normalized,
                    contextPath
                };
            }
            return { url: normalized, changed: false, flagged: false, reason: '', originalUrl: normalized, contextPath };
        };
        const queueInsecureMediaEntries = async (entries = []) => {
            const validEntries = (entries || []).filter(Boolean);
            if (!validEntries.length) return;
            const cleanupRef = db.ref(INSECURE_MEDIA_CLEANUP_PATH);
            await Promise.all(validEntries.map((entry) => cleanupRef.push(entry)));
        };
        const validateHttpsMediaUrl = async (url = '', mediaType = 'image') => {
            const normalizedUrl = String(url || '').trim();
            if (!normalizedUrl || !normalizedUrl.startsWith('https://')) return false;
            if (mediaType === 'image') {
                return !(await checkImageUrlIsBroken(normalizedUrl, { timeoutMs: 5000, retries: 1 }));
            }
            try {
                await fetch(normalizedUrl, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' });
                return true;
            } catch {
                return false;
            }
        };
        const isBlockedMediaUrl = (rawUrl = '') => {
            const normalized = String(rawUrl || '').trim();
            if (!normalized || normalized.startsWith('data:') || normalized.startsWith('blob:')) return false;
            try {
                const parsed = new URL(normalized);
                const host = parsed.hostname.toLowerCase();
                return BLOCKED_MEDIA_HOST_PATTERNS.some((pattern) => host === pattern || host.endsWith(`.${pattern}`));
            } catch {
                return false;
            }
        };
        const getSafeImageSrc = (rawUrl = '', fallback = '') => {
            const result = sanitizeMediaUrl(rawUrl, fallback);
            return result.url;
        };
        const normalizeSearchValue = (value = '') => (
            String(value || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim()
        );
        const detectGalleryItemType = (url = '', explicitType = '') => {
            if (explicitType === 'video' || explicitType === 'image') return explicitType;
            const normalizedUrl = (url || '').trim();
            if (VIDEO_FILE_REGEX.test(normalizedUrl) || getVideoEmbedInfo(normalizedUrl)) {
                return 'video';
            }
            return 'image';
        };
        const normalizeGalleryItem = (item, fallbackType = '') => {
            if (typeof item === 'string') {
                const normalizedUrl = sanitizeMediaUrl(item.trim(), '');
                return {
                    url: normalizedUrl.url,
                    label: '',
                    type: detectGalleryItemType(normalizedUrl.url, fallbackType),
                    insecureReason: normalizedUrl.flagged ? normalizedUrl.reason : ''
                };
            }
            if (item && typeof item === 'object') {
                const safeUrlResult = sanitizeMediaUrl((item.url || '').trim(), '');
                const url = safeUrlResult.url;
                return {
                    url,
                    label: GALLERY_LABELS.includes(item.label) ? item.label : '',
                    type: detectGalleryItemType(url, item.type || fallbackType),
                    insecureReason: safeUrlResult.flagged ? safeUrlResult.reason : ''
                };
            }
            return { url: '', label: '', type: detectGalleryItemType('', fallbackType), insecureReason: '' };
        };
        const normalizeGlobalMediaItem = (itemId, item) => {
            const rawItem = item && typeof item === 'object' ? item : {};
            const safeUrlResult = sanitizeMediaUrl((rawItem.url || '').trim(), '');
            const safeUrl = safeUrlResult.url;
            const detectedType = detectGalleryItemType(safeUrl, rawItem.type || '');
            const embedInfo = detectedType === 'video' ? getVideoEmbedInfo(safeUrl) : null;
            return {
                id: String(itemId || ''),
                url: safeUrl,
                type: detectedType,
                category: rawItem.category || '',
                createdAt: rawItem.createdAt || 0,
                source: rawItem.source === 'file' ? 'file' : 'url',
                embedInfo,
                insecureReason: safeUrlResult.flagged ? safeUrlResult.reason : ''
            };
        };
        const sanitizeAndMigrateHistoricalMedia = async () => {
            const cleanupEntries = [];
            const buildSanitizedUrl = async ({ url = '', fallback = '', mediaType = 'image', contextPath = '' } = {}) => {
                const sanitized = sanitizeMediaUrl(url, fallback, { contextPath });
                if (!sanitized.flagged) return sanitized;
                if (sanitized.reason !== 'http_upgraded') {
                    cleanupEntries.push(createInsecureMediaEntry({
                        originalUrl: sanitized.originalUrl,
                        sanitizedUrl: sanitized.url,
                        contextPath,
                        reason: sanitized.reason,
                        status: 'fallback_applied'
                    }));
                    return sanitized;
                }
                const isValidHttps = await validateHttpsMediaUrl(sanitized.url, mediaType);
                if (isValidHttps) {
                    cleanupEntries.push(createInsecureMediaEntry({
                        originalUrl: sanitized.originalUrl,
                        sanitizedUrl: sanitized.url,
                        contextPath,
                        reason: sanitized.reason,
                        status: 'https_migrated'
                    }));
                    return sanitized;
                }
                cleanupEntries.push(createInsecureMediaEntry({
                    originalUrl: sanitized.originalUrl,
                    sanitizedUrl: fallback,
                    contextPath,
                    reason: 'https_validation_failed',
                    status: 'fallback_applied'
                }));
                return { ...sanitized, url: fallback };
            };

            const perfilesRef = db.ref('perfiles');
            const perfilesSnapshot = await perfilesRef.once('value');
            const perfilesData = perfilesSnapshot.val() || {};
            const perfilUpdates = {};
            for (const [profileId, profile] of Object.entries(perfilesData)) {
                if (!profile || typeof profile !== 'object') continue;
                const fotos = Array.isArray(profile.fotos) ? profile.fotos : [];
                for (let i = 0; i < fotos.length; i++) {
                    const currentUrl = String(fotos[i] || '').trim();
                    const nextUrlResult = await buildSanitizedUrl({ url: currentUrl, fallback: '', mediaType: 'image', contextPath: `perfiles/${profileId}/fotos/${i}` });
                    if (nextUrlResult.url !== currentUrl) perfilUpdates[`${profileId}/fotos/${i}`] = nextUrlResult.url;
                }
                const galleryBuckets = [
                    { tag: 'fotos', mediaType: 'image' },
                    { tag: 'videos', mediaType: 'video' }
                ];
                for (const bucket of galleryBuckets) {
                    const items = Array.isArray(profile?.galeria?.[bucket.tag]) ? profile.galeria[bucket.tag] : [];
                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        if (typeof item === 'string') {
                            const currentUrl = item.trim();
                            const nextUrlResult = await buildSanitizedUrl({ url: currentUrl, fallback: '', mediaType: bucket.mediaType, contextPath: `perfiles/${profileId}/galeria/${bucket.tag}/${i}` });
                            if (nextUrlResult.url !== currentUrl) perfilUpdates[`${profileId}/galeria/${bucket.tag}/${i}`] = nextUrlResult.url;
                            continue;
                        }
                        if (item && typeof item === 'object') {
                            const currentUrl = String(item.url || '').trim();
                            const nextUrlResult = await buildSanitizedUrl({ url: currentUrl, fallback: '', mediaType: bucket.mediaType, contextPath: `perfiles/${profileId}/galeria/${bucket.tag}/${i}/url` });
                            if (nextUrlResult.url !== currentUrl) perfilUpdates[`${profileId}/galeria/${bucket.tag}/${i}/url`] = nextUrlResult.url;
                        }
                    }
                }
                const prefs = profile?.batallaFotosPreferidas && typeof profile.batallaFotosPreferidas === 'object'
                    ? profile.batallaFotosPreferidas
                    : {};
                for (const [slotId, slotUrl] of Object.entries(prefs)) {
                    const currentUrl = String(slotUrl || '').trim();
                    const nextUrlResult = await buildSanitizedUrl({ url: currentUrl, fallback: '', mediaType: 'image', contextPath: `perfiles/${profileId}/batallaFotosPreferidas/${slotId}` });
                    if (nextUrlResult.url !== currentUrl) perfilUpdates[`${profileId}/batallaFotosPreferidas/${slotId}`] = nextUrlResult.url;
                }
            }
            if (Object.keys(perfilUpdates).length) await perfilesRef.update(perfilUpdates);

            const escenasRef = db.ref('escenasFotos');
            const escenasSnapshot = await escenasRef.once('value');
            const escenasData = escenasSnapshot.val() || {};
            const escenasUpdates = {};
            for (const [itemId, item] of Object.entries(escenasData)) {
                if (!item || typeof item !== 'object') continue;
                const currentUrl = String(item.url || '').trim();
                const nextUrlResult = await buildSanitizedUrl({ url: currentUrl, fallback: '', mediaType: item.type || 'image', contextPath: `escenasFotos/${itemId}/url` });
                if (nextUrlResult.url !== currentUrl) escenasUpdates[`${itemId}/url`] = nextUrlResult.url;
            }
            if (Object.keys(escenasUpdates).length) await escenasRef.update(escenasUpdates);
            await queueInsecureMediaEntries(cleanupEntries);
            return {
                perfilesUpdated: Object.keys(perfilUpdates).length,
                escenasUpdated: Object.keys(escenasUpdates).length,
                insecureLogged: cleanupEntries.length
            };
        };
        const getGalleryItemUrl = (item) => normalizeGalleryItem(item).url;
        const getGalleryItemLabel = (item) => normalizeGalleryItem(item).label;
        const getGalleryItemType = (item) => normalizeGalleryItem(item).type;
        const checkImageUrlIsBroken = async (url = '', {
            timeoutMs = 5000,
            retries = 0
        } = {}) => {
            const normalizedUrl = String(url || '').trim();
            if (!normalizedUrl) return true;

            const runSingleCheck = () => new Promise((resolve) => {
                const image = new Image();
                let settled = false;
                const finalize = (isBroken) => {
                    if (settled) return;
                    settled = true;
                    image.onload = null;
                    image.onerror = null;
                    resolve(Boolean(isBroken));
                };

                const timeoutId = window.setTimeout(() => finalize(true), timeoutMs);
                image.onload = () => {
                    clearTimeout(timeoutId);
                    const hasPixels = Number(image.naturalWidth) > 0 && Number(image.naturalHeight) > 0;
                    finalize(!hasPixels);
                };
                image.onerror = () => {
                    clearTimeout(timeoutId);
                    finalize(true);
                };
                image.src = normalizedUrl;
            });

            for (let attempt = 0; attempt <= retries; attempt += 1) {
                const isBroken = await runSingleCheck();
                if (!isBroken) return false;
            }

            return true;
        };
        const getBattlePhotoForArena = (profile, arenaName) => {
            const normalizedArena = (arenaName || '').trim().toLowerCase();
            const galleryImages = Array.isArray(profile?.galeria?.fotos)
                ? profile.galeria.fotos
                    .map((item) => normalizeGalleryItem(item, 'image'))
                    .filter((item) => item.type === 'image' && item.url)
                : [];
            const profilePhoto = getSafeImageSrc(profile?.fotos?.[0], '');
            const fallbackPhoto = profilePhoto || 'https://via.placeholder.com/400x500';

            const useProfilePhotoArenas = new Set([
                'rostro', 'ojos', 'boca', 'cabello',
                'carisma', 'elegancia', 'dulzura', 'talento',
                'estatura'
            ]);

            if (useProfilePhotoArenas.has(normalizedArena)) {
                return fallbackPhoto;
            }

            const getRandomByLabels = (labels = []) => {
                const candidates = galleryImages.filter((item) => labels.includes(getGalleryItemLabel(item)));
                if (!candidates.length) return '';
                const randomIndex = Math.floor(Math.random() * candidates.length);
                return candidates[randomIndex]?.url || '';
            };

            const slotId = getBattleSlotForArena(normalizedArena);
            const slotConfig = getBattleSlotById(slotId);
            if (!slotConfig) return fallbackPhoto;

            const preferences = sanitizeBattlePhotoPreferences(profile?.batallaFotosPreferidas);
            const preferredUrl = preferences[slotId];
            if (preferredUrl) {
                const preferredExists = galleryImages.some((item) => item.url === preferredUrl && slotConfig.labels.includes(getGalleryItemLabel(item)));
                if (preferredExists) {
                    return preferredUrl;
                }
            }

            const selectedPhoto = getRandomByLabels(slotConfig.labels);

            return selectedPhoto || fallbackPhoto;
        };
        const isGifUrl = (url = '') => GIF_FILE_REGEX.test((url || '').trim());
        const CRYING_EMOJI_FALLBACK = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%20256%20256%27%3E%3Crect%20width%3D%27256%27%20height%3D%27256%27%20rx%3D%2740%27%20fill%3D%27%23020617%27/%3E%3Ctext%20x%3D%27128%27%20y%3D%27152%27%20text-anchor%3D%27middle%27%20font-size%3D%27120%27%3E%F0%9F%98%A2%3C/text%3E%3C/svg%3E";
        const BROKEN_IMAGE_INLINE_HANDLER = `if(this.dataset.fallbackApplied==='true')return;this.dataset.fallbackApplied='true';this.src='${CRYING_EMOJI_FALLBACK}';this.style.objectFit='contain';this.style.padding='12px';this.style.background='#020617';this.alt='Imagen no disponible';`;
        const applyCryingEmojiFallback = (event) => {
            const img = event?.currentTarget || event?.target;
            if (!img || img.dataset.fallbackApplied === 'true') return;
            img.dataset.fallbackApplied = 'true';
            img.src = CRYING_EMOJI_FALLBACK;
            img.style.objectFit = 'contain';
            img.style.padding = '12px';
            img.style.background = '#020617';
            img.alt = 'Imagen no disponible';
        };

        const STORAGE_KEY = 'g2_elite_database_v4';
        const CAT_STORAGE_KEY = 'g2_elite_categories_v4';
        const CARACTERISTICAS = [
            'Rostro', 'Ojos', 'Boca', 'Cabello',
            'Cuerpo', 'Cola', 'Pechos', 'Cintura', 'Piernas', 'Estatura',
            'Sensualidad', 'Carisma', 'Elegancia', 'Dulzura', 'Talento'
        ];
        const ARENAS = [...CARACTERISTICAS];
        const BATTLE_SCOPES = [
            { id: 'PROFESIONES', label: 'Profesiones', description: 'Compará perfiles por profesión.' },
            { id: 'NACIONALIDADES', label: 'Nacionalidades', description: 'Compará perfiles por nacionalidad.' },
            { id: 'EDADES', label: 'Edades', description: 'Compará perfiles por rango etario.' },
            { id: 'GENERAL', label: 'General', description: 'Modo libre sin segmentación extra.' }
        ];
        const ARENA_PARTICIPANT_MODES = BATTLE_SCOPES.map((scope) => scope.id);
        const getBattleScopeLabel = (scopeId = '') => {
            const scope = BATTLE_SCOPES.find((item) => item.id === scopeId);
            return scope?.label || 'General';
        };
        const getArenaBattleKey = (arenaName, scopeId = 'GENERAL', groupKey = '') => {
            const safeArena = String(arenaName || '').trim();
            const safeScope = String(scopeId || 'GENERAL').trim().toUpperCase();
            const safeGroup = String(groupKey || '').trim().toLowerCase();
            if (!safeArena) return '';
            return `${safeScope}::${safeGroup || 'all'}::${safeArena}`;
        };
        const getArenaGlobalKey = (arenaName = '') => String(arenaName || '').trim();
        const parseArenaBattleKey = (arenaKey = '') => {
            const parts = String(arenaKey || '').split('::');
            if (parts.length < 3) {
                return {
                    scopeId: 'GENERAL',
                    groupKey: 'all',
                    arenaName: ''
                };
            }
            const arenaName = parts.slice(2).join('::');
            return {
                scopeId: String(parts[0] || 'GENERAL').trim().toUpperCase() || 'GENERAL',
                groupKey: String(parts[1] || 'all').trim().toLowerCase() || 'all',
                arenaName: String(arenaName || '').trim()
            };
        };
        const createZeroScores = () => CARACTERISTICAS.reduce((acc, item) => {
            acc[item] = 0;
            return acc;
        }, {});
        const INITIAL_CATEGORIES = [];
        const PROFESIONES_CONFIG = {
            'Cantante': { glyph: 'crown', color: 'rgba(34, 211, 238, 0.8)', tailwind: 'cyan-400' },
            'Actriz': { glyph: 'theater', color: 'rgba(34, 197, 94, 0.8)', tailwind: 'green-500' },
            'Modelo': { glyph: 'floron', color: 'rgba(168, 85, 247, 0.8)', tailwind: 'purple-500' },
            'NSFW': { glyph: 'torch', color: 'rgba(239, 68, 68, 0.8)', tailwind: 'red-500' },
            'Influencer': { glyph: 'sigil', color: 'rgba(236, 72, 153, 0.8)', tailwind: 'pink-500' },
            'Periodista': { glyph: 'quill', color: 'rgba(234, 179, 8, 0.8)', tailwind: 'yellow-500' },
            'Bailarina': { glyph: 'floron', color: 'rgba(249, 115, 22, 0.8)', tailwind: 'orange-500' },
            'Atleta': { glyph: 'shield', color: 'rgba(59, 130, 246, 0.8)', tailwind: 'blue-500' },
            'Otro': { glyph: 'sigil', color: 'rgba(148, 163, 184, 0.8)', tailwind: 'slate-400' }
        };
        const getProfessionGlyph = (profession = '') => {
            const lowP = String(profession || '').toLowerCase();
            if (lowP.includes('cantante')) return 'crown';
            if (lowP.includes('nsfw')) return 'torch';
            if (lowP.includes('actriz') || lowP.includes('actor')) return 'theater';
            if (lowP.includes('modelo')) return 'floron';
            if (lowP.includes('influencer')) return 'sigil';
            if (lowP.includes('periodista')) return 'quill';
            if (lowP.includes('bailarina')) return 'floron';
            if (lowP.includes('atleta')) return 'shield';
            return 'shield';
        };
        const getEmoji = (profession = '') => {
            const lowP = String(profession || '').toLowerCase();
            if (lowP.includes('cantante')) return '🎤';
            if (lowP.includes('nsfw')) return '🔥';
            if (lowP.includes('actriz') || lowP.includes('actor')) return '🎬';
            if (lowP.includes('modelo')) return '👠';
            if (lowP.includes('influencer')) return '📱';
            if (lowP.includes('periodista')) return '👓';
            if (lowP.includes('bailarina')) return '💃';
            if (lowP.includes('atleta')) return '🏋️‍♀️';
            return '📖';
        };
        const getProfessionCardVisual = (profession = '') => {
            const normalizedProfession = String(profession || '').trim();
            const config = PROFESIONES_CONFIG[normalizedProfession] || PROFESIONES_CONFIG.Otro;
            const baseColor = String(config?.color || 'rgba(148, 163, 184, 0.8)')
                .replace(/,\s*[\d.]+\)$/, ', 1)');
            const glowColor = String(config?.color || 'rgba(148, 163, 184, 0.8)')
                .replace(/,\s*[\d.]+\)$/, ', 0.75)');
            return { baseColor, glowColor };
        };

        const HeraldicGlyph = ({ variant = 'sigil', size = 18, className = '', tint = 'currentColor' }) => {
            const common = {
                width: size,
                height: size,
                viewBox: '0 0 24 24',
                fill: 'none',
                xmlns: 'http://www.w3.org/2000/svg',
                className
            };

            if (variant === 'crown') {
                return <svg {...common} stroke={tint} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17h18v3H3z"/><path d="M4 17l3-8 5 5 5-7 3 10"/></svg>;
            }
            if (variant === 'shield') {
                return <svg {...common} stroke={tint} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.3-2.4 7-7 9-4.6-2-7-4.7-7-9V6l7-3z"/><path d="M9.5 11h5M12 8.5v5"/></svg>;
            }
            if (variant === 'floron') {
                return <svg {...common} stroke={tint} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16"/><path d="M6 9c1.4 0 2.8.9 3.4 2.2C8.2 11.5 7 12.8 7 14.3 5.4 13.5 4.3 11.9 4.3 10 4.3 9.5 5 9 6 9z"/><path d="M18 9c-1.4 0-2.8.9-3.4 2.2 1.2.3 2.4 1.6 2.4 3.1 1.6-.8 2.7-2.4 2.7-4.3 0-.5-.7-1-1.7-1z"/><circle cx="12" cy="12" r="2.2"/></svg>;
            }
            if (variant === 'quill') {
                return <svg {...common} stroke={tint} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4c-7 1-11.5 5.2-13 12l4-1 1 4c6.8-2.4 8.4-8.4 8-15z"/><path d="M8 16l-4 4"/></svg>;
            }
            if (variant === 'torch') {
                return <svg {...common} stroke={tint} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 13l6-6"/><path d="M8 14l2 2 2-2-2-2z"/><path d="M11 16l-4 5h10l-4-5"/><path d="M15.5 4.5c.9 1.3.5 3.2-1 4.3-1.5-1.4-1.8-3.3-.8-4.9.6.1 1.2.3 1.8.6z"/></svg>;
            }
            if (variant === 'theater') {
                return <svg {...common} stroke={tint} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 6h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M9 11h.01M15 11h.01"/><path d="M8.5 15c1 .8 2.2 1.2 3.5 1.2s2.5-.4 3.5-1.2"/></svg>;
            }
            return <svg {...common} stroke={tint} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 6v12M6 12h12"/></svg>;
        };

        const LucideIcon = ({ name, size = 20, className = "" }) => {
            return (
                <i
                    data-lucide={name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2')}
                    style={{ width: size, height: size }}
                    className={`inline-block ${className}`}
                ></i>
            );
        };

        const renderGalleryWindow = ({ targetWindow, profileName, profession, photos, editingId, battlePhotoPrefs = {} }) => {
            if (!targetWindow || targetWindow.closed) return;
            const safeBattlePhotoPrefs = sanitizeBattlePhotoPreferences(battlePhotoPrefs);

            const fotosGaleria = (photos || []).map((item, index) => {
                const normalizedItem = normalizeGalleryItem(item);
                return {
                    ...normalizedItem,
                    sourceTag: item?.sourceTag || (normalizedItem.type === 'video' ? 'videos' : 'fotos'),
                    sourceIndex: typeof item?.sourceIndex === 'number' ? item.sourceIndex : index
                };
            }).filter(item => item.url);

            targetWindow.document.open();
            targetWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Galería de ${profileName}</title>
                <style>
                    body {
                        background:
                            radial-gradient(circle at 20% 18%, rgba(255, 208, 140, 0.14), transparent 32%),
                            radial-gradient(circle at 82% 8%, rgba(184, 115, 51, 0.17), transparent 28%),
                            linear-gradient(180deg, #120f0a 0%, #1d160f 45%, #271b12 100%);
                        color: #f7ebd2;
                        font-family: 'Cinzel', 'Plus Jakarta Sans', serif;
                        padding: 40px;
                        margin: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .btn-critical-plate {
                        position: fixed;
                        top: 20px;
                        right: 30px;
                        padding: 10px 20px;
                        color: #ff3131;
                        font-weight: 800;
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        background: #020617;
                        border: 2px solid #ff3131;
                        border-radius: 12px;
                        cursor: pointer;
                        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 0 0 2px rgba(255, 49, 49, 0.22), 4px 4px 0px #660000;
                        transition: all 0.3s ease;
                        text-shadow: 0 0 8px #ff3131;
                        z-index: 999;
                    }
                    .btn-critical-plate:hover {
                        background: #ff3131;
                        color: white;
                        box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 0 20px rgba(255,49,49,0.5);
                        transform: translateY(-1px);
                    }
                    .modal-url {
                        display: none;
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: #0f172a;
                        padding: 30px;
                        border-radius: 18px;
                        border: 1px solid rgba(100, 116, 139, 0.45);
                        box-shadow: inset 0 1px 0 rgba(148, 163, 184, 0.18), 0 24px 48px rgba(0,0,0,0.55);
                        z-index: 1000;
                        width: 350px;
                    }
                    input {
                        width: 100%;
                        padding: 12px;
                        margin-top: 15px;
                        background: #020617;
                        border: 1px solid #334155;
                        color: #22d3ee;
                        border-radius: 8px;
                        outline: none;
                    }
                    h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 2rem; color: #fff; text-align: center; }
                    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; width: 100%; }
                    .fullscreen-viewer {
                        display: none;
                        position: fixed;
                        inset: 0;
                        z-index: 2000;
                        background:
                            radial-gradient(circle at 50% 20%, rgba(255, 214, 153, 0.08), transparent 42%),
                            rgba(16, 10, 4, 0.95);
                        backdrop-filter: blur(6px);
                    }
                    .fullscreen-viewer.open {
                        display: flex;
                    }
                    .viewer-close {
                        position: fixed;
                        top: 20px;
                        right: 30px;
                        z-index: 2100;
                        background: rgba(15, 23, 42, 0.9);
                        color: #f87171;
                        border: 1px solid rgba(248, 113, 113, 0.78);
                        border-radius: 999px;
                        width: 48px;
                        height: 48px;
                        cursor: pointer;
                        font-size: 30px;
                        font-weight: 900;
                        line-height: 1;
                        font-weight: 700;
                        box-shadow:
                            0 6px 16px rgba(0, 0, 0, 0.55),
                            inset 0 1px 0 rgba(255, 244, 214, 0.35),
                            inset 0 -2px 0 rgba(48, 28, 12, 0.55);
                        text-shadow: 0 0 6px rgba(0, 0, 0, 0.75);
                        transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
                    }
                    .viewer-close:hover {
                        transform: scale(1.06);
                        filter: brightness(1.08);
                        box-shadow:
                            0 8px 18px rgba(0, 0, 0, 0.62),
                            inset 0 1px 0 rgba(255, 244, 214, 0.42),
                            inset 0 -2px 0 rgba(48, 28, 12, 0.62);
                    }
                    .viewer-close:focus-visible,
                    .viewer-nav:focus-visible {
                        outline: 3px solid #ffe0a8;
                        outline-offset: 3px;
                    }
                    .viewer-stage {
                        position: relative;
                        width: 100%;
                        height: 100vh;
                        height: 100dvh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 32px 24px 112px;
                        box-sizing: border-box;
                    }
                    .viewer-slide {
                        display: none;
                        width: 100%;
                        height: 100%;
                        align-items: center;
                        justify-content: center;
                    }
                    .viewer-slide.active {
                        display: flex;
                    }
                    .viewer-slide img {
                        max-width: min(92vw, 1400px);
                        max-height: calc(100vh - 64px);
                        width: auto;
                        height: auto;
                        object-fit: contain;
                        border-radius: 20px;
                        border: 3px solid #c8a167;
                        box-shadow:
                            0 24px 52px rgba(0, 0, 0, 0.64),
                            0 0 0 3px rgba(83, 55, 27, 0.8),
                            inset 0 0 24px rgba(255, 223, 171, 0.12);
                    }
                    .viewer-slide video,
                    .viewer-slide iframe {
                        max-width: min(92vw, 1400px);
                        max-height: calc(100vh - 64px);
                        width: auto;
                        height: auto;
                        border-radius: 24px;
                        box-shadow: 0 0 40px rgba(34, 211, 238, 0.2);
                        background: #000;
                    }
                    .viewer-slide iframe {
                        border: 0;
                        aspect-ratio: 16 / 9;
                    }
                    .viewer-nav {
                        position: fixed;
                        bottom: 26px;
                        z-index: 2100;
                        width: 44px;
                        height: 44px;
                        border-radius: 50%;
                        border: 2px solid #d8b374;
                        background: linear-gradient(180deg, #624021 0%, #3a2512 100%);
                        color: #fff7e6;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        font-size: 28px;
                        font-weight: 900;
                        line-height: 1;
                        text-shadow: 0 0 5px rgba(0, 0, 0, 0.72);
                        box-shadow:
                            0 6px 16px rgba(0, 0, 0, 0.55),
                            inset 0 1px 0 rgba(255, 244, 214, 0.34),
                            inset 0 -2px 0 rgba(48, 28, 12, 0.55);
                        transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease, filter 0.2s ease;
                    }
                    .viewer-nav:hover {
                        transform: scale(1.06);
                        border-color: #f0c883;
                        color: #fff7e6;
                        filter: brightness(1.1);
                    }
                    .viewer-nav.prev {
                        left: 24px;
                    }
                    .viewer-nav.next {
                        right: 24px;
                    }
                    .viewer-nav[disabled] {
                        opacity: 0.62;
                        cursor: default;
                        filter: grayscale(0.28);
                    }
                    .viewer-nav[disabled]:hover {
                        transform: none;
                        border-color: #d8b374;
                        color: #fff7e6;
                        filter: grayscale(0.28);
                    }
                    .viewer-hint {
                        position: fixed;
                        left: 50%;
                        bottom: 28px;
                        transform: translateX(-50%);
                        z-index: 2100;
                        padding: 10px 16px;
                        border-radius: 999px;
                        background: rgba(43, 29, 16, 0.72);
                        color: #f6e7ca;
                        border: 1px solid rgba(201, 162, 98, 0.72);
                        font-size: 12px;
                        letter-spacing: 0.08em;
                        text-transform: uppercase;
                        pointer-events: none;
                    }
                    .viewer-controls {
                        position: fixed;
                        top: 24px;
                        left: 24px;
                        z-index: 2100;
                        display: flex;
                        gap: 10px;
                    }
                    .viewer-control-btn {
                        border: 1px solid rgba(56, 189, 248, 0.5);
                        background: rgba(8, 47, 73, 0.52);
                        color: #bae6fd;
                        border-radius: 999px;
                        padding: 8px 14px;
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.2em;
                        font-weight: 900;
                        cursor: pointer;
                    }
                    .viewer-control-btn.random-active {
                        border-color: rgba(232, 121, 249, 0.85);
                        color: #f5d0fe;
                        background: rgba(192, 38, 211, 0.35);
                    }
                    @media (max-width: 768px) {
                        .fullscreen-viewer {
                            background: rgba(8, 4, 2, 0.985);
                        }
                        .viewer-stage {
                            width: 100vw;
                            height: 100dvh;
                            min-height: 100dvh;
                            padding:
                                calc(env(safe-area-inset-top, 0px) + 76px)
                                0
                                calc(env(safe-area-inset-bottom, 0px) + 116px);
                        }
                        .viewer-slide {
                            width: 100vw;
                            height: 100dvh;
                        }
                        .viewer-slide img,
                        .viewer-slide video,
                        .viewer-slide iframe {
                            width: 100vw;
                            height: 100dvh;
                            max-width: none;
                            max-height: none;
                            min-width: 100vw;
                            min-height: 100dvh;
                            object-fit: contain;
                            border-radius: 0;
                            border: 0;
                            box-shadow: none;
                        }
                        .viewer-controls {
                            top: calc(env(safe-area-inset-top, 0px) + 12px);
                            left: calc(env(safe-area-inset-left, 0px) + 12px);
                            gap: 10px;
                        }
                        .viewer-control-btn {
                            min-height: 44px;
                            padding: 10px 14px;
                            font-size: 10px;
                        }
                        .viewer-close {
                            top: calc(env(safe-area-inset-top, 0px) + 12px);
                            right: calc(env(safe-area-inset-right, 0px) + 12px);
                            width: 44px;
                            height: 44px;
                            font-size: 28px;
                        }
                        .viewer-nav {
                            bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
                            width: 48px;
                            height: 48px;
                            font-size: 26px;
                        }
                        .viewer-nav.prev {
                            left: calc(env(safe-area-inset-left, 0px) + 12px);
                        }
                        .viewer-nav.next {
                            right: calc(env(safe-area-inset-right, 0px) + 12px);
                        }
                        .viewer-hint {
                            left: 50%;
                            bottom: calc(env(safe-area-inset-bottom, 0px) + 22px);
                            max-width: calc(100vw - 132px);
                            padding: 8px 12px;
                            font-size: 10px;
                            text-align: center;
                        }
                    }
                    @media (max-width: 640px) {
                        .viewer-close {
                            width: 44px;
                            height: 44px;
                        }
                        .viewer-nav {
                            width: 44px;
                            height: 44px;
                            font-size: 24px;
                        }
                        .viewer-hint {
                            padding: 8px 10px;
                            font-size: 10px;
                            max-width: calc(100vw - 120px);
                            text-align: center;
                        }
                        .viewer-controls {
                            gap: 8px;
                        }
                        .viewer-control-btn {
                            min-height: 44px;
                            padding: 8px 10px;
                            font-size: 9px;
                            letter-spacing: 0.16em;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>Galería de ${profileName}</h1>
                <button class="btn-critical-plate" onclick="document.getElementById('miModal').style.display='block'">
                    AGREGAR ARCHIVO
                </button>

                <div id="miModal" class="modal-url">
                    <h2 style="margin:0; font-size: 14px; color: #94a3b8;">PEGAR URL DEL ARCHIVO</h2>
                    <input type="text" id="nuevaFotoUrl" placeholder="https://ejemplo.com/foto.jpg o https://youtube.com/...">
                    <label for="nuevoArchivoLocal" style="display:block; margin-top: 14px; font-size: 10px; font-weight: 900; letter-spacing: 0.14em; color: #94a3b8; text-transform: uppercase;">o subir desde escritorio</label>
                    <input type="file" id="nuevoArchivoLocal" accept="image/*,video/*,.gif" style="width: 100%; margin-top: 8px; padding: 10px; background: #020617; border: 1px dashed rgba(34,211,238,0.65); color: #e2e8f0; border-radius: 8px; outline: none; font-size: 12px; box-shadow: 0 0 10px rgba(34,211,238,0.18);">
                    <select id="nuevoArchivoTipo" style="width: 100%; padding: 12px; margin-top: 15px; background: #020617; border: 1px solid rgba(71,85,105,0.92); color: #e2e8f0; border-radius: 8px; outline: none; box-shadow: inset 0 1px 0 rgba(148,163,184,0.18);">
                        <option value="image">Imagen</option>
                        <option value="video">Video</option>
                    </select>
                    <select id="nuevaFotoEtiqueta" style="width: 100%; padding: 12px; margin-top: 15px; background: #020617; border: 1px solid rgba(71,85,105,0.92); color: #e2e8f0; border-radius: 8px; outline: none; box-shadow: inset 0 1px 0 rgba(148,163,184,0.18);">
                        ${GALLERY_LABELS.map(label => `<option value="${label}">Etiqueta ${label}</option>`).join('')}
                    </select>
                    <button onclick="addMediaFromModal()"
                        style="margin-top: 15px; width: 100%; padding: 10px; background: linear-gradient(180deg, rgba(14,116,144,0.95), rgba(8,47,73,0.95)); color: #ecfeff; border: 1px solid rgba(103,232,249,0.9); border-radius: 8px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.08em; box-shadow: 0 0 14px rgba(34,211,238,0.4);">
                        Guardar
                    </button>
                </div>

                <div style="width:100%; margin-bottom: 20px; padding: 14px; border-radius: 12px; border: 1px solid rgba(148,163,184,0.28); background: rgba(2,6,23,0.45); display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px;">
                    ${BATTLE_PHOTO_SLOTS.map((slot) => {
                        const hasSelection = !!safeBattlePhotoPrefs[slot.id];
                        return `
                            <div style="border:1px solid rgba(71,85,105,0.65); border-radius:10px; padding:10px; background: rgba(15,23,42,0.75);">
                                <div style="font-size:10px; color:#f8fafc; font-weight:900; letter-spacing:0.12em; text-transform:uppercase;">${slot.label}</div>
                                <div style="font-size:11px; color:${hasSelection ? '#86efac' : '#94a3b8'}; margin-top:6px;">${hasSelection ? 'Foto fija elegida' : 'Modo aleatorio'}</div>
                                <button
                                    type="button"
                                    onclick="event.stopPropagation(); window.opener.postMessage({type: 'CLEAR_BATTLE_PHOTO_PREF', id: '${editingId}', slotId: '${slot.id}'}, '*');"
                                    style="margin-top:8px; width:100%; border:1px solid rgba(125,211,252,0.6); background: rgba(2,6,23,0.82); color:#e2e8f0; border-radius:8px; padding:6px 8px; font-size:10px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; cursor:pointer; box-shadow: 0 0 12px rgba(34,211,238,0.22);"
                                >
                                    Quitar fija
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="grid" id="galleryGrid">
                    ${fotosGaleria.length ? fotosGaleria.map((foto, index) => {
                    const fotoUrl = getGalleryItemUrl(foto);
                    const fotoLabel = getGalleryItemLabel(foto);
                    const labelStyle = getGalleryLabelStyle(fotoLabel);
                    const config = {
                        "CANTANTE": { color: "#0ea5e9", sombra: "rgba(14,165,233,0.8)" },
                        "NSFW":  { color: "#ef4444", sombra: "rgba(239,68,68,0.8)" },
                        "ACTRIZ":{ color: "#22c55e", sombra: "rgba(34,197,94,0.8)" },
                        "MODELO": { color: "#f97316", sombra: "rgba(249,115,22,0.8)" },
                        "BAILARINA": { color: "#a855f7", sombra: "rgba(168,85,247,0.8)" },
                        "INFLUENCER":{ color: "#ec4899", sombra: "rgba(236,72,153,0.8)" },
                        "PERIODISTA": { color: "#facc15", sombra: "rgba(250,204,21,0.8)" },
                        "ATLETA":  { color: "#78350f", sombra: "rgba(120,53,15,0.8)" },
                        "OTRO":{ color: "#ffffff", sombra: "rgba(255,255,255,0.8)" },
                        "DEFAULT": { color: "#334155", sombra: "transparent" }
                    };
                    const estilo = config[profession?.toUpperCase()] || config["DEFAULT"];
                    const compatibleSlots = getGalleryItemType(foto) === 'image' ? getCompatibleBattleSlotsForLabel(fotoLabel) : [];
                    const battleButtons = compatibleSlots.length
                        ? `<div style="position:absolute; left: 8px; right: 8px; bottom: 48px; z-index: 16; display:flex; flex-wrap:wrap; justify-content:center; gap:6px;">
                            ${compatibleSlots.map((slot) => {
                                const isSelected = safeBattlePhotoPrefs[slot.id] === fotoUrl;
                                return `<button
                                    onclick="event.stopPropagation(); window.opener.postMessage({type: 'SET_BATTLE_PHOTO_PREF', id: '${editingId}', slotId: '${slot.id}', index: ${foto.sourceIndex}, mediaType: '${getGalleryItemType(foto)}'}, '*');"
                                    title="Usar en ${slot.label}"
                                    style="border: 1px solid ${isSelected ? '#fbbf24' : 'rgba(148,163,184,0.45)'}; background: ${isSelected ? 'rgba(120,53,15,0.88)' : 'rgba(2,6,23,0.75)'}; color: ${isSelected ? '#fde68a' : '#e2e8f0'}; border-radius: 999px; padding: 4px 8px; font-size: 9px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;">
                                    ${slot.label}${isSelected ? ' ✓' : ''}
                                </button>`;
                            }).join('')}
                        </div>`
                        : '';
                    return `
                        <div
                            class="gallery-card"
                            data-gallery-index="${index}"
                            title="Abrir visor de pantalla completa"
                            style="
                                aspect-ratio: 1/1;
                                border-radius: 15px;
                                overflow: hidden;
                                border: 2px solid ${estilo.color};
                                box-shadow: 0 0 15px ${estilo.sombra};
                                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                                cursor: pointer;
                                position: relative;
                                background: #0f172a;
                            "
                            onmouseover="this.style.transform='scale(1.08)'; this.style.boxShadow='0 0 35px ${estilo.color}, inset 0 0 15px ${estilo.sombra}'; this.style.zIndex='10';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 15px ${estilo.sombra}'; this.style.zIndex='1';"
                        >
                           <button
                            onclick="event.stopPropagation(); window.opener.postMessage({type: 'DELETE_IMAGE', index: ${foto.sourceIndex}, mediaType: '${getGalleryItemType(foto)}', id: '${editingId}'}, '*');"
                            style="
                                position: absolute;
                                top: 5px;
                                right: 5px;
                                z-index: 20;
                                background: #ef4444;
                                color: white;
                                border: none;
                                width: 22px;
                                height: 22px;
                                border-radius: 50%;
                                cursor: pointer;
                                font-weight: bold;
                                font-size: 12px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
                            "
                            aria-label="Eliminar elemento de galería"
                            type="button"
                        >✕</button>
                        ${getGalleryItemType(foto) === 'video'
                            ? (() => {
                                const embedInfo = getVideoEmbedInfo(fotoUrl);
                                if (embedInfo) {
                                    return `<div style="width: 100%; height: 100%; background: radial-gradient(circle at top, rgba(34,211,238,0.35), rgba(15,23,42,0.96)); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding: 18px; box-sizing:border-box; text-align:center;"><div style="width:64px; height:64px; border-radius:999px; border:1px solid rgba(34,211,238,0.5); background:rgba(15,23,42,0.75); display:flex; align-items:center; justify-content:center; color:#22d3ee; font-size:28px;">▶</div><div style="font-size:12px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:#e2e8f0;">Video embebido</div><div style="font-size:11px; color:#94a3b8; max-width:100%; word-break:break-word;">${embedInfo.provider.toUpperCase()}</div></div>`;
                                }
                                return `<video src="${fotoUrl}" style="width: 100%; height: 100%; object-fit: cover;" muted playsinline preload="metadata"></video>`;
                            })()
                            : `<img src="${fotoUrl}" alt="Imagen de la galería" onerror="${BROKEN_IMAGE_INLINE_HANDLER}" style="width: 100%; height: 100%; object-fit: cover;" />`
                        }
                        <div style="position:absolute; left: 12px; top: 12px; z-index: 15; padding: 6px 10px; border-radius: 999px; background: rgba(2,6,23,0.72); border: 1px solid rgba(148,163,184,0.24); color: #e2e8f0; display:flex; align-items:center; justify-content:center; font-size: 10px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; backdrop-filter: blur(8px);">${getGalleryItemType(foto) === 'video' ? 'VIDEO' : 'IMG'}</div>
                        ${battleButtons}
                        ${fotoLabel ? `<div style="position:absolute; left: 50%; bottom: 10px; transform: translateX(-50%); z-index: 15; min-width: 52px; height: 30px; padding: 0 14px; border-radius: 999px; background: ${labelStyle.bg}; border: 1px solid ${labelStyle.border}; color: ${labelStyle.text}; display:flex; align-items:center; justify-content:center; font-size: 12px; font-weight: 900; letter-spacing: 0.24em; box-shadow: 0 0 14px ${labelStyle.glow}, 0 0 24px ${labelStyle.glow}; text-shadow: 0 0 10px ${labelStyle.glow}; backdrop-filter: blur(8px);">${fotoLabel}</div>` : ""}
                        </div>
                    `;
                }).join('') : '<p style="text-align:center; grid-column: 1/-1; color: #64748b;">No hay archivos cargados.</p>'}
                </div>

                <div id="fullscreenViewer" class="fullscreen-viewer">
                    <button class="viewer-close" onclick="closeFullscreenViewer()" aria-label="Cerrar visor">✕</button>
                    <div class="viewer-controls">
                        <button id="viewerPlayToggle" class="viewer-control-btn" type="button" onclick="toggleViewerAutoplay(event)">Play</button>
                        <button id="viewerRandomToggle" class="viewer-control-btn" type="button" onclick="toggleViewerRandom(event)">Aleatorio OFF</button>
                    </div>
                    ${fotosGaleria.length > 1 ? `
                        <button class="viewer-nav prev" id="viewerPrev" onclick="showPreviousViewerPhoto(event)" aria-label="Foto anterior">←</button>
                        <button class="viewer-nav next" id="viewerNext" onclick="showNextViewerPhoto(event)" aria-label="Foto siguiente">→</button>
                    ` : ''}
                    <div class="viewer-hint">Usá ← → para cambiar y Escape para salir</div>
                    <div class="viewer-stage" id="viewerStage">
                        ${fotosGaleria.map((foto, index) => {
                            const itemType = getGalleryItemType(foto);
                            const embedInfo = getVideoEmbedInfo(foto.url);
                            return `
                            <div class="viewer-slide" id="viewer-slide-${index}">
                                ${itemType === 'video'
                                    ? (embedInfo
                                        ? `<iframe src="${embedInfo.src}" title="${embedInfo.title} ${index + 1}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
                                        : `<video src="${foto.url}" controls playsinline></video>`)
                                    : `<img src="${foto.url}" alt="Vista completa ${index + 1}" onerror="${BROKEN_IMAGE_INLINE_HANDLER}" />`
                                }
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <script>
                    const viewer = document.getElementById('fullscreenViewer');
                    const galleryGrid = document.getElementById('galleryGrid');
                    const viewerStage = document.getElementById('viewerStage');
                    const viewerSlides = Array.from(document.querySelectorAll('.viewer-slide'));
                    const viewerPrevButton = document.getElementById('viewerPrev');
                    const viewerNextButton = document.getElementById('viewerNext');
                    const viewerPlayToggleButton = document.getElementById('viewerPlayToggle');
                    const viewerRandomToggleButton = document.getElementById('viewerRandomToggle');
                    const viewerStage = document.getElementById('viewerStage') || viewer;
                    let currentViewerIndex = 0;
                    let viewerAutoplay = false;
                    let viewerRandom = false;
                    let viewerAutoplayTimeout = null;
                    let viewerScrollTop = 0;
                    let previousBodyOverflow = '';
                    let previousBodyPosition = '';
                    let previousBodyTop = '';
                    let previousBodyWidth = '';

                    function resetAddMediaModalFields() {
                        const urlInput = document.getElementById('nuevaFotoUrl');
                        const localInput = document.getElementById('nuevoArchivoLocal');
                        const labelInput = document.getElementById('nuevaFotoEtiqueta');
                        const mediaTypeInput = document.getElementById('nuevoArchivoTipo');
                        if (urlInput) urlInput.value = '';
                        if (localInput) localInput.value = '';
                        if (labelInput) labelInput.value = '${GALLERY_LABELS[0]}';
                        if (mediaTypeInput) mediaTypeInput.value = 'image';
                    }

                    function addMediaFromModal() {
                        const urlInput = document.getElementById('nuevaFotoUrl');
                        const localInput = document.getElementById('nuevoArchivoLocal');
                        const labelInput = document.getElementById('nuevaFotoEtiqueta');
                        const mediaTypeInput = document.getElementById('nuevoArchivoTipo');
                        const normalizedUrl = (urlInput?.value || '').trim();
                        const selectedFile = localInput?.files?.[0];
                        const mediaType = mediaTypeInput?.value || 'image';
                        const label = labelInput?.value || '${GALLERY_LABELS[0]}';

                        const postMedia = (finalUrl, finalType) => {
                            if (!finalUrl) return;
                            window.opener.postMessage({ type: 'ADD_IMAGE', url: finalUrl, label, mediaType: finalType, id: '${editingId}' }, '*');
                            document.getElementById('miModal').style.display = 'none';
                            resetAddMediaModalFields();
                        };

                        if (selectedFile) {
                            const inferredType = selectedFile.type && selectedFile.type.startsWith('video/') ? 'video' : 'image';
                            const reader = new FileReader();
                            reader.onload = () => postMedia(String(reader.result || ''), inferredType);
                            reader.onerror = () => alert('No se pudo leer el archivo seleccionado.');
                            reader.readAsDataURL(selectedFile);
                            return;
                        }

                        postMedia(normalizedUrl, mediaType);
                    }

                    function getNextViewerIndex() {
                        if (viewerSlides.length <= 1) return 0;
                        if (!viewerRandom) return (currentViewerIndex + 1) % viewerSlides.length;
                        const candidates = viewerSlides.map((_, idx) => idx).filter((idx) => idx !== currentViewerIndex);
                        return candidates[Math.floor(Math.random() * candidates.length)];
                    }

                    function clearViewerAutoplayTimer() {
                        if (viewerAutoplayTimeout) {
                            clearTimeout(viewerAutoplayTimeout);
                            viewerAutoplayTimeout = null;
                        }
                    }

                    function setViewerAutoplayState(nextState) {
                        viewerAutoplay = !!nextState;
                        if (viewerPlayToggleButton) {
                            viewerPlayToggleButton.textContent = viewerAutoplay ? 'Pause' : 'Play';
                        }
                        scheduleViewerAutoplay();
                    }

                    function setViewerRandomState(nextState) {
                        viewerRandom = !!nextState;
                        if (viewerRandomToggleButton) {
                            viewerRandomToggleButton.textContent = 'Aleatorio ' + (viewerRandom ? 'ON' : 'OFF');
                            viewerRandomToggleButton.classList.toggle('random-active', viewerRandom);
                        }
                    }

                    function scheduleViewerAutoplay() {
                        clearViewerAutoplayTimer();
                        if (!viewerAutoplay || !viewer.classList.contains('open') || viewerSlides.length <= 1) return;
                        const currentSlide = viewerSlides[currentViewerIndex];
                        const currentVideo = currentSlide ? currentSlide.querySelector('video') : null;
                        if (currentVideo) return;
                        viewerAutoplayTimeout = setTimeout(function() {
                            renderViewerSlide(getNextViewerIndex());
                        }, 7000);
                    }

                    function syncViewerButtons() {
                        const disableNavigation = viewerSlides.length <= 1;
                        if (viewerPrevButton) viewerPrevButton.disabled = disableNavigation;
                        if (viewerNextButton) viewerNextButton.disabled = disableNavigation;
                    }

                    function renderViewerSlide(index, options = {}) {
                        if (!viewerSlides.length) return;
                        const shouldSyncScroll = options.syncScroll !== false;
                        const scrollBehavior = options.scrollBehavior || 'smooth';
                        currentViewerIndex = Math.max(0, Math.min(index, viewerSlides.length - 1));
                        viewerSlides.forEach(function(slide, slideIndex) {
                            slide.classList.toggle('active', slideIndex === currentViewerIndex);
                        });
                        if (shouldSyncScroll && viewerStage && isMobileViewerMode()) {
                            const viewportWidth = getViewerViewportWidth();
                            viewerStage.scrollTo({
                                left: currentViewerIndex * viewportWidth,
                                behavior: scrollBehavior
                            });
                        }
                        const activeSlide = viewerSlides[currentViewerIndex];
                        const activeImage = activeSlide ? activeSlide.querySelector('img') : null;
                        const activeVideo = activeSlide ? activeSlide.querySelector('video') : null;
                        if (activeVideo) {
                            activeVideo.currentTime = 0;
                            if (viewerAutoplay) {
                                activeVideo.play().catch(function() {});
                            }
                        }
                        if (activeImage) {
                            activeImage.onerror = function() {
                                if (viewerSlides.length > 1) {
                                    renderViewerSlide(getNextViewerIndex());
                                }
                            };
                        }
                        if (activeVideo) {
                            activeVideo.onerror = function() {
                                if (viewerSlides.length > 1) {
                                    renderViewerSlide(getNextViewerIndex());
                                }
                            };
                            activeVideo.onended = function() {
                                if (viewerAutoplay && viewerSlides.length > 1) {
                                    renderViewerSlide(getNextViewerIndex());
                                }
                            };
                        }
                        syncViewerButtons();
                        scheduleViewerAutoplay();
                    }

                    function syncViewerIndexFromScroll() {
                        if (!viewerStage || !viewerSlides.length || !isMobileViewerMode() || !viewer.classList.contains('open')) return;
                        const viewportWidth = getViewerViewportWidth();
                        const nextIndex = Math.max(0, Math.min(
                            Math.round(viewerStage.scrollLeft / viewportWidth),
                            viewerSlides.length - 1
                        ));
                        if (nextIndex !== currentViewerIndex) {
                            renderViewerSlide(nextIndex, { syncScroll: false });
                        }
                        clearViewerScrollDebounceTimer();
                        viewerScrollDebounceTimer = setTimeout(function() {
                            scheduleViewerAutoplay();
                        }, 140);
                    }

                    function openFullscreenViewer(index) {
                        if (!viewerSlides.length) return;
                        const parsedIndex = Number(index);
                        if (!Number.isInteger(parsedIndex) || parsedIndex < 0 || parsedIndex >= viewerSlides.length) return;
                        viewerScrollTop = window.scrollY || window.pageYOffset || 0;
                        previousBodyOverflow = document.body.style.overflow;
                        previousBodyPosition = document.body.style.position;
                        previousBodyTop = document.body.style.top;
                        previousBodyWidth = document.body.style.width;
                        viewer.classList.add('open');
                        document.body.style.overflow = 'hidden';
                        document.body.style.position = 'fixed';
                        document.body.style.top = '-' + String(viewerScrollTop) + 'px';
                        document.body.style.width = '100%';
                        renderViewerSlide(parsedIndex);
                    }
                    function closeFullscreenViewer() {
                        viewer.classList.remove('open');
                        document.body.style.overflow = previousBodyOverflow;
                        document.body.style.position = previousBodyPosition;
                        document.body.style.top = previousBodyTop;
                        document.body.style.width = previousBodyWidth;
                        window.scrollTo(0, viewerScrollTop);
                        clearViewerAutoplayTimer();
                        clearViewerScrollDebounceTimer();
                    }
                    function showNextViewerPhoto(event) {
                        if (event) event.stopPropagation();
                        if (viewerSlides.length <= 1) return;
                        renderViewerSlide((currentViewerIndex + 1) % viewerSlides.length);
                    }
                    function showPreviousViewerPhoto(event) {
                        if (event) event.stopPropagation();
                        if (viewerSlides.length <= 1) return;
                        renderViewerSlide((currentViewerIndex - 1 + viewerSlides.length) % viewerSlides.length);
                    }
                    function toggleViewerAutoplay(event) {
                        if (event) event.stopPropagation();
                        setViewerAutoplayState(!viewerAutoplay);
                    }
                    function toggleViewerRandom(event) {
                        if (event) event.stopPropagation();
                        setViewerRandomState(!viewerRandom);
                    }
                    function handleViewerSwipeByDelta(deltaX, deltaY) {
                        if (viewerSlides.length <= 1) return;
                        if (Math.abs(deltaX) < viewerSwipeThreshold) return;
                        if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
                        if (deltaX < 0) {
                            showNextViewerPhoto();
                            return;
                        }
                        showPreviousViewerPhoto();
                    }
                    function onViewerTouchStart(event) {
                        if (!viewer.classList.contains('open')) return;
                        const touch = event.touches && event.touches[0];
                        if (!touch) return;
                        viewerTouchStartX = touch.clientX;
                        viewerTouchStartY = touch.clientY;
                        viewerTouchCurrentX = touch.clientX;
                        viewerTouchCurrentY = touch.clientY;
                        viewerTouchTracking = true;
                        viewerTouchHorizontalGesture = false;
                    }
                    function onViewerTouchMove(event) {
                        if (!viewerTouchTracking) return;
                        const touch = event.touches && event.touches[0];
                        if (!touch) return;
                        viewerTouchCurrentX = touch.clientX;
                        viewerTouchCurrentY = touch.clientY;
                        const deltaX = viewerTouchCurrentX - viewerTouchStartX;
                        const deltaY = viewerTouchCurrentY - viewerTouchStartY;
                        if (!viewerTouchHorizontalGesture && Math.abs(deltaX) >= viewerSwipeLockThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
                            viewerTouchHorizontalGesture = true;
                        }
                        if (viewerTouchHorizontalGesture) {
                            event.preventDefault();
                        }
                    }
                    function onViewerTouchEnd() {
                        if (!viewerTouchTracking) return;
                        handleViewerSwipeByDelta(viewerTouchCurrentX - viewerTouchStartX, viewerTouchCurrentY - viewerTouchStartY);
                        viewerTouchTracking = false;
                        viewerTouchHorizontalGesture = false;
                    }
                    function onViewerPointerDown(event) {
                        if (!viewer.classList.contains('open')) return;
                        if (event.pointerType === 'mouse') return;
                        viewerPointerStartX = event.clientX;
                        viewerPointerStartY = event.clientY;
                        viewerPointerTracking = true;
                    }
                    function onViewerPointerUp(event) {
                        if (!viewerPointerTracking) return;
                        viewerPointerTracking = false;
                        handleViewerSwipeByDelta(event.clientX - viewerPointerStartX, event.clientY - viewerPointerStartY);
                    }
                    if (galleryGrid) {
                        galleryGrid.addEventListener('click', function(event) {
                            const deleteButton = event.target.closest('.gallery-delete');
                            if (deleteButton) {
                                event.preventDefault();
                                event.stopPropagation();
                                window.opener.postMessage({
                                    type: 'DELETE_IMAGE',
                                    index: Number(deleteButton.dataset.deleteIndex),
                                    mediaType: deleteButton.dataset.deleteMediaType,
                                    id: '${editingId}'
                                }, '*');
                                return;
                            }

                            const card = event.target.closest('.gallery-card');
                            if (!card) return;
                            event.preventDefault();
                            openFullscreenViewer(card.dataset.galleryIndex);
                        });
                    }
                    viewer.addEventListener('click', function(event) {
                        if (event.target === viewer) {
                            closeFullscreenViewer();
                        }
                    });
                    if (viewerStage) {
                        viewerStage.addEventListener('touchstart', onViewerTouchStart, { passive: true });
                        viewerStage.addEventListener('touchmove', onViewerTouchMove, { passive: false });
                        viewerStage.addEventListener('touchend', onViewerTouchEnd, { passive: true });
                        viewerStage.addEventListener('touchcancel', onViewerTouchEnd, { passive: true });
                        if (window.PointerEvent && !('ontouchstart' in window)) {
                            viewerStage.addEventListener('pointerdown', onViewerPointerDown);
                            viewerStage.addEventListener('pointerup', onViewerPointerUp);
                            viewerStage.addEventListener('pointercancel', function() {
                                viewerPointerTracking = false;
                            });
                        }
                    }
                    window.addEventListener('keydown', function(event) {
                        if (!viewer.classList.contains('open')) return;

                        if (event.key === 'Escape') {
                            event.preventDefault();
                            closeFullscreenViewer();
                            return;
                        }

                        if (event.key === 'ArrowRight') {
                            event.preventDefault();
                            showNextViewerPhoto();
                        }

                        if (event.key === 'ArrowLeft') {
                            event.preventDefault();
                            showPreviousViewerPhoto();
                        }
                    });
                    setViewerAutoplayState(false);
                    setViewerRandomState(false);
                    renderViewerSlide(0);
                <\/script>
            </body>
            </html>
        `);
            targetWindow.document.close();
        };

        const App = () => {
            const [carpetaAbierta, setCarpetaAbierta] = React.useState(null);
            const galleryWindowRef = useRef(null);
            const mediaSanitizationStartedRef = useRef(false);
            const contextMenuRef = useRef(null);
            const [perfiles, setPerfiles] = useState([]);
                const neonColors = {
        "CANTANTE": { color: "#0ea5e9", sombra: "rgba(14,165,233,0.8)" },    // Celeste
        "NSFW":  { color: "#ef4444", sombra: "rgba(239,68,68,0.8)" },      // Rojo
        "ACTRIZ":{ color: "#22c55e", sombra: "rgba(34,197,94,0.8)" },        // Verde
        "MODELO": { color: "#f97316", sombra: "rgba(249,115,22,0.8)" },      // Naranja
        "BAILARINA": { color: "#a855f7", sombra: "rgba(168,85,247,0.8)" },    // Morado
        "INFLUENCER":{ color: "#ec4899", sombra: "rgba(236,72,153,0.8)" },      // Rosada
        "PERIODISTA": { color: "#facc15", sombra: "rgba(250,204,21,0.8)" },  // Amarillo
        "ATLETA":  { color: "#78350f", sombra: "rgba(120,53,15,0.8)" },         // Marron
        "OTRO":{ color: "#ffffff", sombra: "rgba(255,255,255,0.8)" }, // Blanco
        "DEFAULT": { color: "#334155", sombra: "transparent" }
                };
            const [minEdad, setMinEdad] = useState(18);
            const [maxEdad, setMaxEdad] = useState(60);

            const [categorias, setCategorias] = useState(INITIAL_CATEGORIES);
            const [activeTab, setActiveTab] = useState('EXPLORAR');
            const [characterSearchTerm, setCharacterSearchTerm] = useState('');
            const [selectedCharacterId, setSelectedCharacterId] = useState(null);
            const [selectedArena, setSelectedArena] = useState(null);
            const [selectedBattleScope, setSelectedBattleScope] = useState(null);
            const [selectedBattleGroupKey, setSelectedBattleGroupKey] = useState('');
            const [arenaBattleState, setArenaBattleState] = useState({});
            const [arenaGlobalState, setArenaGlobalState] = useState({});
            const [globalMedia, setGlobalMedia] = useState([]);
            const [showResetArenaPicker, setShowResetArenaPicker] = useState(false);
            const [resetArenaTarget, setResetArenaTarget] = useState(ARENAS[0] || '');
            const [showBattleResetPanel, setShowBattleResetPanel] = useState(false);
            const [isModalOpen, setIsModalOpen] = useState(false);
            const [isCatModalOpen, setIsCatModalOpen] = useState(false);
            const [editingId, setEditingId] = useState(null);
            const [contextMenuProfileId, setContextMenuProfileId] = useState(null);
            const [contextProfile, setContextProfile] = useState(null);
            const [isDeleteProfileModalOpen, setIsDeleteProfileModalOpen] = useState(false);
            const [profileActionError, setProfileActionError] = useState('');
            const [selectedCategory, setSelectedCategory] = React.useState(null);
            const [contextMenuOpen, setContextMenuOpen] = useState(false);
            const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
            const [sortBy, setSortBy] = useState('promedio');
            const [sortDirection, setSortDirection] = useState('desc');
            const [scoreBreakdownModal, setScoreBreakdownModal] = useState({ isOpen: false, profile: null, category: null });
            const [urlInput, setUrlInput] = useState('');
            const [galleryLabel, setGalleryLabel] = useState(GALLERY_LABELS[0]);
            const [galleryMediaType, setGalleryMediaType] = useState('image');
            const [sceneUrlInput, setSceneUrlInput] = useState('');
            const [sceneFileInput, setSceneFileInput] = useState('');
            const [sceneCategory, setSceneCategory] = useState('');
            const [sceneType, setSceneType] = useState('image');
            const [galleryFilterLabel, setGalleryFilterLabel] = useState('INICIAL');
            const [galleryViewMode, setGalleryViewMode] = useState('GENERAL');
            const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(null);
            const [selectedSceneIndex, setSelectedSceneIndex] = useState(null);
            const [selectedGalleryBucket, setSelectedGalleryBucket] = useState(null);
            const [selectedCharacterBucketIds, setSelectedCharacterBucketIds] = useState([]);
            const [selectedTagLabels, setSelectedTagLabels] = useState([]);
            const [isGalleryPlaying, setIsGalleryPlaying] = useState(false);
            const [isGalleryRandom, setIsGalleryRandom] = useState(false);
            const [isScenePlaying, setIsScenePlaying] = useState(false);
            const [isSceneRandom, setIsSceneRandom] = useState(false);
            const [galleryPlaybackSeconds, setGalleryPlaybackSeconds] = useState(5);
            const [isSidebarOpen, setIsSidebarOpen] = useState(true);
            const [isEditingGalleryLabel, setIsEditingGalleryLabel] = useState(false);
            const [galleryLabelDraft, setGalleryLabelDraft] = useState('');
            const [isBrokenGalleryModalOpen, setIsBrokenGalleryModalOpen] = useState(false);
            const [brokenGalleryMap, setBrokenGalleryMap] = useState({});
            const [brokenGalleryUrlDrafts, setBrokenGalleryUrlDrafts] = useState({});
            const [brokenGallerySavingMap, setBrokenGallerySavingMap] = useState({});
            const [brokenGalleryEditingMap, setBrokenGalleryEditingMap] = useState({});
            const [isCheckingBrokenGallery, setIsCheckingBrokenGallery] = useState(false);
            const galleryPlaybackTimeoutRef = useRef(null);
            const scenePlaybackTimeoutRef = useRef(null);

            const [filters, setFilters] = useState({
                nacionalidad: 'Todas',
                profesion: 'Todas',
                edad: 'Todas',
                ciudad: 'Todas',
                scoreAttr: 'Cualquiera',
                scoreOp: 'Superior a',
                scoreVal: ''
            });

const getInitialCatFormData = () => ({
    label: '',
    emoji: '📁',
    coverImg: '',
    reglas: {
        nacionalidades: [],
        profesiones: [],
        ciudades: [],
        edadMin: '',
        edadMax: '',
        caracteristica: 'Rostro',
        operador: 'Superior a',
        umbral: ''
    }
});
        const getEmptyProfileFormData = () => ({
                nombre: '', nacionalidad: '', ciudad: '', profesion: '', fechaNacimiento: '', estaturaCm: '', fotos: [],
                galeria: { fotos: [], gifs: [], videos: [] },
                batallaFotosPreferidas: getDefaultBattlePhotoPreferences(),
                puntuaciones: createZeroScores()
            });
            const [formData, setFormData] = useState(getEmptyProfileFormData);
            useEffect(() => {
                if (!selectedBattleScope) {
                    if (selectedBattleGroupKey) setSelectedBattleGroupKey('');
                    return;
                }
                if (selectedBattleScope === 'GENERAL' && selectedBattleGroupKey !== 'all') {
                    setSelectedBattleGroupKey('all');
                }
            }, [selectedBattleScope, selectedBattleGroupKey]);
            const mapProfileToFormData = (profile = {}) => {
                const baseFormData = getEmptyProfileFormData();
                const safeProfile = profile && typeof profile === 'object' ? profile : {};
                const normalizedScores = safeProfile?.puntuaciones && typeof safeProfile.puntuaciones === 'object'
                    ? { ...baseFormData.puntuaciones, ...safeProfile.puntuaciones }
                    : baseFormData.puntuaciones;

                return {
                    ...safeProfile,
                    ...baseFormData,
                    nombre: typeof safeProfile.nombre === 'string' ? safeProfile.nombre : '',
                    nacionalidad: typeof safeProfile.nacionalidad === 'string' ? safeProfile.nacionalidad : '',
                    ciudad: typeof safeProfile.ciudad === 'string' ? safeProfile.ciudad : '',
                    profesion: typeof safeProfile.profesion === 'string' ? safeProfile.profesion : '',
                    fechaNacimiento: typeof safeProfile.fechaNacimiento === 'string' ? safeProfile.fechaNacimiento : '',
                    estaturaCm: safeProfile.estaturaCm === undefined || safeProfile.estaturaCm === null ? '' : safeProfile.estaturaCm,
                    fotos: Array.isArray(safeProfile.fotos) ? safeProfile.fotos : [],
                    galeria: {
                        fotos: Array.isArray(safeProfile?.galeria?.fotos) ? safeProfile.galeria.fotos : [],
                        gifs: Array.isArray(safeProfile?.galeria?.gifs) ? safeProfile.galeria.gifs : [],
                        videos: Array.isArray(safeProfile?.galeria?.videos) ? safeProfile.galeria.videos : []
                    },
                    batallaFotosPreferidas: sanitizeBattlePhotoPreferences(safeProfile?.batallaFotosPreferidas),
                    puntuaciones: normalizedScores
                };
            };
            const openProfileEditor = (contextProfile = {}) => {
                setFormData(mapProfileToFormData(contextProfile));
                setEditingId(contextProfile.firebaseId || contextProfile.id || null);
                setIsModalOpen(true);
            };
            const profileCompletionRows = useMemo(() => {
                const rows = [
                    { key: 'nombre', label: 'Nombre', value: formData?.nombre },
                    { key: 'fotos.0', label: 'Foto principal', value: formData?.fotos?.[0] },
                    { key: 'profesion', label: 'Profesión', value: formData?.profesion },
                    { key: 'nacionalidad', label: 'Nacionalidad', value: formData?.nacionalidad },
                    { key: 'ciudad', label: 'Ciudad', value: formData?.ciudad },
                    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', value: formData?.fechaNacimiento },
                    { key: 'estaturaCm', label: 'Estatura', value: formData?.estaturaCm }
                ];

                const withStatus = rows.map((row) => {
                    const normalizedValue = typeof row.value === 'string' ? row.value.trim() : row.value;
                    const isComplete = !(normalizedValue === '' || normalizedValue === undefined || normalizedValue === null);
                    const previewValue = row.key === 'fotos.0'
                        ? (isComplete ? 'SI' : 'NO')
                        : (isComplete ? String(normalizedValue) : 'Sin completar');
                    return {
                        ...row,
                        isComplete,
                        preview: previewValue
                    };
                });

                return {
                    completed: withStatus.filter((row) => row.isComplete),
                    missing: withStatus.filter((row) => !row.isComplete)
                };
            }, [formData]);
            const addGalleryImage = async ({ profileId, url, tag = 'fotos', label = '', type = 'image' }) => {
                const normalizedUrl = (url || '').trim();
                const normalizedLabel = GALLERY_LABELS.includes(label) ? label : '';
                const normalizedType = detectGalleryItemType(normalizedUrl, type);
                if (!profileId || !normalizedUrl) return [];

                const galleryRef = db.ref(`perfiles/${profileId}/galeria/${tag}`);
                const snapshot = await galleryRef.once('value');
                const currentItems = snapshot.val() || [];
                const updatedItems = [...currentItems, { url: normalizedUrl, label: normalizedLabel, type: normalizedType }];

                await galleryRef.set(updatedItems);

                if (profileId === editingId) {
                    setFormData(prev => ({
                        ...prev,
                        galeria: {
                            ...(prev.galeria || { fotos: [], gifs: [], videos: [] }),
                            [tag]: updatedItems
                        }
                    }));
                }

                return updatedItems;
            };

            const submitGalleryImage = async ({ profileId = editingId, url = urlInput, label = galleryLabel, type = galleryMediaType, successMessage } = {}) => {
                if (!profileId || !(url || '').trim()) return;

                try {
                    await addGalleryImage({ profileId, url, tag: type === 'video' ? 'videos' : 'fotos', label, type });
                    setUrlInput('');
                    setGalleryLabel(GALLERY_LABELS[0]);
                    setGalleryMediaType('image');


                    if (successMessage) {
                        alert(successMessage);
                    }
                } catch (error) {
                    console.error('Error al guardar archivo en galería:', error);
                }
            };
            const updateGalleryItemLabel = async ({ profileId, sourceTag, sourceIndex, label }) => {
                if (!profileId || !sourceTag || !Number.isInteger(sourceIndex)) return;
                const normalizedLabel = GALLERY_LABELS.includes(label) ? label : '';
                const galleryRef = db.ref(`perfiles/${profileId}/galeria/${sourceTag}`);
                const snapshot = await galleryRef.once('value');
                const currentItems = Array.isArray(snapshot.val()) ? snapshot.val() : [];
                if (!currentItems[sourceIndex]) return;

                const updatedItems = [...currentItems];
                const normalizedItem = normalizeGalleryItem(updatedItems[sourceIndex], sourceTag === 'videos' ? 'video' : 'image');
                updatedItems[sourceIndex] = {
                    ...normalizedItem,
                    label: normalizedLabel
                };

                await galleryRef.set(updatedItems);

                if (profileId === editingId) {
                    setFormData(prev => ({
                        ...prev,
                        galeria: {
                            ...(prev.galeria || { fotos: [], gifs: [], videos: [] }),
                            [sourceTag]: updatedItems
                        }
                    }));
                }
            };
            const updateGalleryItemUrl = async ({ profileId, sourceTag, sourceIndex, url }) => {
                if (!profileId || !sourceTag || !Number.isInteger(sourceIndex)) return;
                const normalizedUrl = (url || '').trim();
                if (!normalizedUrl) return;

                const galleryRef = db.ref(`perfiles/${profileId}/galeria/${sourceTag}`);
                const snapshot = await galleryRef.once('value');
                const currentItems = Array.isArray(snapshot.val()) ? snapshot.val() : [];
                if (!currentItems[sourceIndex]) return;

                const updatedItems = [...currentItems];
                const currentType = sourceTag === 'videos' ? 'video' : 'image';
                const normalizedItem = normalizeGalleryItem(updatedItems[sourceIndex], currentType);
                updatedItems[sourceIndex] = {
                    ...normalizedItem,
                    url: normalizedUrl,
                    type: detectGalleryItemType(normalizedUrl, currentType)
                };
                await galleryRef.set(updatedItems);

                if (profileId === editingId) {
                    setFormData(prev => ({
                        ...prev,
                        galeria: {
                            ...(prev.galeria || { fotos: [], gifs: [], videos: [] }),
                            [sourceTag]: updatedItems
                        }
                    }));
                }
            };
            const removeGalleryItem = async ({ profileId, sourceTag, sourceIndex }) => {
                if (!profileId || !sourceTag || !Number.isInteger(sourceIndex)) return;
                const galleryRef = db.ref(`perfiles/${profileId}/galeria/${sourceTag}`);
                const snapshot = await galleryRef.once('value');
                const currentItems = Array.isArray(snapshot.val()) ? snapshot.val() : [];
                const removedItem = currentItems[sourceIndex];
                if (!removedItem) return;

                const remainingItems = currentItems.filter((_, index) => index !== sourceIndex);
                await galleryRef.set(remainingItems);

                const removedUrl = normalizeGalleryItem(removedItem, sourceTag === 'videos' ? 'video' : 'image').url;
                if (removedUrl) {
                    const prefsRef = db.ref(`perfiles/${profileId}/batallaFotosPreferidas`);
                    const prefsSnapshot = await prefsRef.once('value');
                    const currentPrefs = sanitizeBattlePhotoPreferences(prefsSnapshot.val());
                    const updatedPrefs = { ...currentPrefs };
                    let hasChanges = false;

                    Object.keys(updatedPrefs).forEach((slotId) => {
                        if (updatedPrefs[slotId] === removedUrl) {
                            updatedPrefs[slotId] = '';
                            hasChanges = true;
                        }
                    });
                    if (hasChanges) await prefsRef.set(updatedPrefs);
                }

                if (profileId === editingId) {
                    setFormData(prev => ({
                        ...prev,
                        galeria: {
                            ...(prev.galeria || { fotos: [], gifs: [], videos: [] }),
                            [sourceTag]: remainingItems
                        },
                        batallaFotosPreferidas: (() => {
                            const currentPrefs = sanitizeBattlePhotoPreferences(prev.batallaFotosPreferidas);
                            if (!removedUrl) return currentPrefs;
                            const updatedPrefs = { ...currentPrefs };
                            Object.keys(updatedPrefs).forEach((slotId) => {
                                if (updatedPrefs[slotId] === removedUrl) {
                                    updatedPrefs[slotId] = '';
                                }
                            });
                            return updatedPrefs;
                        })()
                    }));
                }
            };
            const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ''));
                reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
                reader.readAsDataURL(file);
            });
            const handleLocalProfilePhotoUpload = async (event) => {
                const selectedFile = event.target.files?.[0];
                if (!selectedFile) return;
                try {
                    const dataUrl = await readFileAsDataUrl(selectedFile);
                    setFormData(prev => ({ ...prev, fotos: [dataUrl] }));
                } catch (error) {
                    console.error('Error al cargar foto de perfil local:', error);
                } finally {
                    event.target.value = '';
                }
            };
            const handleLocalGalleryFileUpload = async (event) => {
                const selectedFile = event.target.files?.[0];
                if (!selectedFile) return;
                try {
                    const dataUrl = await readFileAsDataUrl(selectedFile);
                    const inferredType = selectedFile.type && selectedFile.type.startsWith('video/') ? 'video' : 'image';
                    setUrlInput(dataUrl);
                    setGalleryMediaType(inferredType);
                } catch (error) {
                    console.error('Error al cargar archivo local de galería:', error);
                } finally {
                    event.target.value = '';
                }
            };
            const handleLocalSceneFileUpload = async (event) => {
                const selectedFile = event.target.files?.[0];
                if (!selectedFile) return;
                try {
                    const dataUrl = await readFileAsDataUrl(selectedFile);
                    const mimeType = String(selectedFile.type || '').toLowerCase();
                    const inferredType = mimeType.includes('gif')
                        ? 'gif'
                        : mimeType.startsWith('video/')
                            ? 'video'
                            : 'image';
                    setSceneFileInput(dataUrl);
                    setSceneType(inferredType);
                } catch (error) {
                    console.error('Error al cargar archivo local de escena:', error);
                    alert('No se pudo leer el archivo seleccionado.');
                } finally {
                    event.target.value = '';
                }
            };
            const sceneCategoryOptions = useMemo(() => {
                const existingCategoryLabels = (categorias || [])
                    .map((category) => String(category?.label || '').trim())
                    .filter(Boolean);
                return [...new Set([...existingCategoryLabels, ...SCENE_FREE_CATEGORIES])];
            }, [categorias]);
            const submitScenePhoto = async () => {
                const normalizedUrlInput = String(sceneUrlInput || '').trim();
                const normalizedFileInput = String(sceneFileInput || '').trim();
                const finalUrl = normalizedUrlInput || normalizedFileInput;
                const normalizedCategory = String(sceneCategory || '').trim();
                const normalizedType = String(sceneType || '').trim();

                if (!finalUrl) {
                    alert('Ingresá una URL o cargá un archivo para la escena.');
                    return;
                }
                if (!normalizedCategory) {
                    alert('Seleccioná una categoría para la escena.');
                    return;
                }
                if (!normalizedType) {
                    alert('Seleccioná el tipo de escena.');
                    return;
                }

                try {
                    await db.ref('escenasFotos').push({
                        url: finalUrl,
                        categoria: normalizedCategory,
                        type: normalizedType,
                        createdAt: firebase.database.ServerValue.TIMESTAMP
                    });
                    setSceneUrlInput('');
                    setSceneFileInput('');
                    setSceneCategory('');
                    setSceneType('image');
                    alert('¡Escena guardada correctamente!');
                } catch (error) {
                    console.error('Error al guardar escena en Firebase:', error);
                    alert('No se pudo guardar la escena. Probá de nuevo.');
                }
            };
            const handleDelete = async (id, e) => {
                e.stopPropagation(); // Esto es para que no se abra la foto cuando hacés click en la cruz
                if(confirm('¿Estás seguro de que querés eliminar esto, corazón?')) {
                    try {
                        await db.collection('galeria').doc(id).delete();
                    } catch (error) {
                        console.error("Error al borrar de Firebase:", error);
                    }
                }
            };

            const [catFormData, setCatFormData] = useState(getInitialCatFormData());
            const resetCatForm = () => setCatFormData(getInitialCatFormData());

            useEffect(() => {
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }, [activeTab, isModalOpen, isCatModalOpen, perfiles, selectedCategory, filters, categorias]);

            useEffect(() => {
                if (galleryWindowRef.current && !galleryWindowRef.current.closed && editingId) {
                    renderGalleryWindow({
                        targetWindow: galleryWindowRef.current,
                        profileName: formData.nombre,
                        profession: formData.profesion,
                        photos: [
                            ...(formData.galeria?.fotos || []).map((item, index) => ({ ...normalizeGalleryItem(item, 'image'), sourceTag: 'fotos', sourceIndex: index })),
                            ...(formData.galeria?.videos || []).map((item, index) => ({ ...normalizeGalleryItem(item, 'video'), sourceTag: 'videos', sourceIndex: index }))
                        ],
                        editingId,
                        battlePhotoPrefs: formData.batallaFotosPreferidas
                    });
                }
            }, [editingId, formData.nombre, formData.profesion, formData.galeria?.fotos, formData.galeria?.videos, formData.batallaFotosPreferidas]);

            useEffect(() => {
                if (!mediaSanitizationStartedRef.current) {
                    mediaSanitizationStartedRef.current = true;
                    sanitizeAndMigrateHistoricalMedia()
                        .then((summary) => {
                            if (summary.insecureLogged || summary.perfilesUpdated || summary.escenasUpdated) {
                                console.info('Migración de medios HTTP completada:', summary);
                            }
                        })
                        .catch((error) => {
                            console.error('No se pudo completar la migración de medios HTTP:', error);
                        });
                }

                const handleMessage = async (event) => {
                    if (event.data.type === 'ADD_IMAGE') {
                        const { url, id, label, mediaType } = event.data;
                        const tag = mediaType === 'video' ? 'videos' : 'fotos';
                        const galleryRef = db.ref(`perfiles/${id}/galeria/${tag}`);
                        const snapshot = await galleryRef.once('value');
                        const currentPhotos = snapshot.val() || [];
                        const normalizedUrl = (url || '').trim();
                        if (!normalizedUrl) return;
                        const updatedPhotos = [...currentPhotos, { url: normalizedUrl, label: GALLERY_LABELS.includes(label) ? label : '', type: detectGalleryItemType(normalizedUrl, mediaType) }];

                        await galleryRef.set(updatedPhotos);
                        setFormData(prev => ({
                            ...prev,
                            galeria: { ...prev.galeria, [tag]: updatedPhotos }
                        }));
                    }

                    if (event.data.type === 'DELETE_IMAGE') {
                        const { index, id, mediaType } = event.data;
                        const tag = mediaType === 'video' ? 'videos' : 'fotos';
                        const galleryRef = db.ref(`perfiles/${id}/galeria/${tag}`);
                        const snapshot = await galleryRef.once('value');
                        const currentPhotos = snapshot.val() || [];
                        const removedPhoto = currentPhotos[index];
                        const nuevasFotos = currentPhotos.filter((_, i) => i !== index);

                        await galleryRef.set(nuevasFotos);
                        const removedUrl = normalizeGalleryItem(removedPhoto, mediaType).url;
                        if (removedUrl) {
                            const prefsRef = db.ref(`perfiles/${id}/batallaFotosPreferidas`);
                            const prefsSnapshot = await prefsRef.once('value');
                            const currentPrefs = sanitizeBattlePhotoPreferences(prefsSnapshot.val());
                            const updatedPrefs = { ...currentPrefs };
                            let hasChanges = false;
                            Object.keys(updatedPrefs).forEach((slotId) => {
                                if (updatedPrefs[slotId] === removedUrl) {
                                    updatedPrefs[slotId] = '';
                                    hasChanges = true;
                                }
                            });
                            if (hasChanges) {
                                await prefsRef.set(updatedPrefs);
                            }
                        }
                        setFormData(prev => ({
                            ...prev,
                            galeria: { ...prev.galeria, [tag]: nuevasFotos },
                            batallaFotosPreferidas: (() => {
                                const currentPrefs = sanitizeBattlePhotoPreferences(prev.batallaFotosPreferidas);
                                if (!removedUrl) return currentPrefs;
                                const updatedPrefs = { ...currentPrefs };
                                Object.keys(updatedPrefs).forEach((slotId) => {
                                    if (updatedPrefs[slotId] === removedUrl) {
                                        updatedPrefs[slotId] = '';
                                    }
                                });
                                return updatedPrefs;
                            })()
                        }));
                    }

                    if (event.data.type === 'SET_BATTLE_PHOTO_PREF') {
                        const { id, slotId, index, mediaType } = event.data;
                        const slotConfig = getBattleSlotById(slotId);
                        if (!id || !slotConfig || !Number.isInteger(index)) return;
                        const tag = mediaType === 'video' ? 'videos' : 'fotos';
                        const galleryRef = db.ref(`perfiles/${id}/galeria/${tag}`);
                        const snapshot = await galleryRef.once('value');
                        const currentItems = snapshot.val() || [];
                        const selectedItem = normalizeGalleryItem(currentItems[index], mediaType);
                        if (!selectedItem.url || selectedItem.type !== 'image') return;
                        if (!slotConfig.labels.includes(selectedItem.label)) return;

                        const prefsRef = db.ref(`perfiles/${id}/batallaFotosPreferidas/${slotId}`);
                        await prefsRef.set(selectedItem.url);
                        setFormData(prev => ({
                            ...prev,
                            batallaFotosPreferidas: {
                                ...sanitizeBattlePhotoPreferences(prev.batallaFotosPreferidas),
                                [slotId]: selectedItem.url
                            }
                        }));
                    }

                    if (event.data.type === 'CLEAR_BATTLE_PHOTO_PREF') {
                        const { id, slotId } = event.data;
                        const slotConfig = getBattleSlotById(slotId);
                        if (!id || !slotConfig) return;
                        const prefsRef = db.ref(`perfiles/${id}/batallaFotosPreferidas/${slotId}`);
                        await prefsRef.set('');
                        setFormData(prev => ({
                            ...prev,
                            batallaFotosPreferidas: {
                                ...sanitizeBattlePhotoPreferences(prev.batallaFotosPreferidas),
                                [slotId]: ''
                            }
                        }));
                    }
                };

                window.addEventListener('message', handleMessage);
                const perfilesRef = db.ref('perfiles');
                perfilesRef.on('value', (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const listaPerfiles = Object.keys(data).map(key => ({
                            ...mapProfileToFormData(data[key]),
                            firebaseId: key // Guardamos la llave de Firebase por si necesitamos editar
                        }));
                        setPerfiles(listaPerfiles);
                    } else {
                        setPerfiles([]);
                    }
                });

                // Escuchar Categorías en tiempo real desde Firebase
                const categoriasRef = db.ref('categorias');
                categoriasRef.on('value', (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const listaCats = Object.keys(data).map(key => ({
                            ...data[key],
                            firebaseId: key
                        }));
                        setCategorias(listaCats);
                    } else {
                        setCategorias(INITIAL_CATEGORIES);
                    }
                });

                const arenasRef = db.ref('arenaBattleState');
                arenasRef.on('value', (snapshot) => {
                    setArenaBattleState(snapshot.val() || {});
                });
                const arenaGlobalRef = db.ref('arenaGlobalState');
                arenaGlobalRef.on('value', (snapshot) => {
                    setArenaGlobalState(snapshot.val() || {});
                });
                const escenasFotosRef = db.ref('escenasFotos');
                escenasFotosRef.on('value', (snapshot) => {
                    const data = snapshot.val() || {};
                    const normalizedMedia = Object.entries(data)
                        .map(([itemId, item]) => normalizeGlobalMediaItem(itemId, item))
                        .filter((item) => item.url);
                    setGlobalMedia(normalizedMedia);
                });

                return () => {
                    window.removeEventListener('message', handleMessage);
                    perfilesRef.off();
                    categoriasRef.off();
                    arenasRef.off();
                    arenaGlobalRef.off();
                    escenasFotosRef.off();
                };
            }, []);

            const calcularEdad = (fecha) => {
                if (!fecha) return '?';
                const hoy = new Date();
                const cumple = new Date(fecha);
                let edad = hoy.getFullYear() - cumple.getFullYear();
                if (hoy.getMonth() < cumple.getMonth() || (hoy.getMonth() === cumple.getMonth() && hoy.getDate() < cumple.getDate())) edad--;
                return edad;
            };

            const getProfileScores = (profile = {}) => {
                return { ...createZeroScores(), ...(profile?.puntuaciones || {}) };
            };
            const getRostroScore = (profile = {}) => {
                const scores = getProfileScores(profile);
                return (scores.Rostro + scores.Ojos + scores.Boca + scores.Cabello) / 4;
            };
            const getCuerpoScore = (profile = {}) => {
                const scores = getProfileScores(profile);
                return (scores.Cuerpo + scores.Cola + scores.Pechos + scores.Cintura + scores.Piernas + scores.Estatura) / 6;
            };
            const getActitudScore = (profile = {}) => {
                const scores = getProfileScores(profile);
                return (scores.Sensualidad + scores.Carisma + scores.Elegancia + scores.Dulzura + scores.Talento) / 5;
            };
            const calcularPromedio = (p = {}) => {
                // El Score Total es el promedio de las 3 categorías principales
                const scoreTotal = (getRostroScore(p) + getCuerpoScore(p) + getActitudScore(p)) / 3;
                return scoreTotal.toFixed(0);
            };

            const obtenerCategoriasDePerfil = (p) => {
                const cats = [];
                const nac = (p.nacionalidad || '').toLowerCase();
                const prof = (p.profesion || '').toLowerCase();
                const ciu = (p.ciudad || '').toLowerCase();
                const edad = calcularEdad(p.fechaNacimiento);

                categorias.forEach(c => {
                    const r = c.reglas;
                    let matches = true;

                    // Filtros de texto (nacionalidad, profesión, ciudad)
                    if (r.nacionalidades?.length > 0 && !r.nacionalidades.some(n => nac === n.toLowerCase())) matches = false;
                    if (r.profesiones?.length > 0 && !r.profesiones.some(p => prof === p.toLowerCase())) matches = false;
                    if (r.ciudades?.length > 0 && !r.ciudades.some(ciu_regla => ciu === ciu_regla.toLowerCase())) matches = false;

                    // Filtros de edad
                    if (r.edadMin && (edad === '?' || edad < parseInt(r.edadMin))) matches = false;
                    if (r.edadMax && (edad === '?' || edad > parseInt(r.edadMax))) matches = false;

                    // Filtro de puntuación (ej: Rostro > 8)
                    if (r.caracteristica && r.umbral) {
                        const score = getProfileScores(p)[r.caracteristica] || 0;
                        const umbral = parseInt(r.umbral);
                        if (r.operador === 'Superior a' && score <= umbral) matches = false;
                        if (r.operador === 'Inferior a' && score >= umbral) matches = false;
                    }

                    // USAMOS firebaseId PORQUE ES EL QUE VIENE DE LA BASE DE DATOS
                    if (matches) cats.push(c.firebaseId);
                });
                return cats;
            };

            const uniqueNacionalidades = useMemo(() => ['Todas', ...new Set(perfiles.map(p => p.nacionalidad).filter(Boolean))], [perfiles]);
            const uniqueProfesiones = useMemo(() => ['Todas', ...new Set(perfiles.map(p => p.profesion).filter(Boolean))], [perfiles]);
            const uniqueCiudades = useMemo(() => ['Todas', ...new Set(perfiles.map(p => p.ciudad).filter(Boolean))], [perfiles]);
            const profileCategoryMap = useMemo(() => {
                return (perfiles || []).reduce((acc, profile) => {
                    if (!profile?.firebaseId) return acc;
                    acc[profile.firebaseId] = obtenerCategoriasDePerfil(profile);
                    return acc;
                }, {});
            }, [perfiles, categorias]);
            const allGalleryPhotos = useMemo(() => {
                const profileGalleryPhotos = (perfiles || []).flatMap((perfil) => {
                    const galleryItems = [
                        ...(Array.isArray(perfil?.galeria?.fotos)
                            ? perfil.galeria.fotos.map((item, sourceIndex) => ({
                                ...normalizeGalleryItem(item, 'image'),
                                sourceTag: 'fotos',
                                sourceIndex
                            }))
                            : []),
                        ...(Array.isArray(perfil?.galeria?.gifs)
                            ? perfil.galeria.gifs.map((item, sourceIndex) => ({
                                ...normalizeGalleryItem(item, 'image'),
                                sourceTag: 'gifs',
                                sourceIndex
                            }))
                            : []),
                        ...(Array.isArray(perfil?.galeria?.videos)
                            ? perfil.galeria.videos.map((item, sourceIndex) => ({
                                ...normalizeGalleryItem(item, 'video'),
                                sourceTag: 'videos',
                                sourceIndex
                            }))
                            : [])
                    ];

                    return galleryItems
                        .map((item, index) => {
                            const normalizedItem = normalizeGalleryItem(item);
                            if (!normalizedItem.url) return null;

                            return {
                                id: `${perfil.firebaseId || perfil.nombre || 'perfil'}-${index}-${normalizedItem.url}`,
                                url: normalizedItem.url,
                                label: normalizedItem.label,
                                type: normalizedItem.type,
                                isGif: normalizedItem.type === 'image' && isGifUrl(normalizedItem.url),
                                nombre: perfil.nombre || 'Sin nombre',
                                profesion: perfil.profesion || 'Perfil',
                                nacionalidad: perfil.nacionalidad || '',
                                fotoPerfil: perfil.fotos?.[0] || normalizedItem.url,
                                profileId: perfil.firebaseId,
                                sourceTag: item.sourceTag || (normalizedItem.type === 'video' ? 'videos' : 'fotos'),
                                sourceIndex: Number.isInteger(item.sourceIndex) ? item.sourceIndex : index
                            };
                        })
                        .filter(Boolean);
                });
                const sharedGlobalMediaPhotos = (globalMedia || [])
                    .map((item, index) => {
                        if (!item?.url) return null;
                        const type = detectGalleryItemType(item.url, item.type || '');
                        const embedInfo = type === 'video' ? (item.embedInfo || getVideoEmbedInfo(item.url)) : null;
                        return {
                            id: `escenasFotos-${item.id || index}`,
                            url: item.url,
                            label: '',
                            type,
                            isGif: type === 'image' && isGifUrl(item.url),
                            nombre: item.category ? `Escena · ${item.category}` : 'Escena global',
                            profesion: item.source === 'file' ? 'Escena (archivo)' : 'Escena (url)',
                            nacionalidad: '',
                            fotoPerfil: item.url,
                            profileId: null,
                            sourceTag: 'escenasFotos',
                            sourceIndex: index,
                            createdAt: item.createdAt || 0,
                            embedInfo
                        };
                    })
                    .filter(Boolean);

                return [...profileGalleryPhotos, ...sharedGlobalMediaPhotos];
            }, [perfiles, globalMedia]);
            const galleryBuckets = useMemo(() => {
                if (galleryViewMode === 'GENERAL') {
                    return [{
                        id: 'GENERAL',
                        nombre: 'General',
                        profesion: 'Archivo global',
                        nacionalidad: '',
                        fotoPerfil: allGalleryPhotos[0]?.url || '',
                        photos: allGalleryPhotos
                    }];
                }

                if (galleryViewMode === 'PERSONAJE') {
                    const groupedByProfile = allGalleryPhotos.reduce((acc, photo) => {
                        const key = photo.profileId || photo.nombre;
                        if (!key) return acc;
                        if (!acc[key]) {
                            acc[key] = {
                                id: `PERSONAJE-${key}`,
                                profileId: photo.profileId || null,
                                nombre: photo.nombre || 'Sin nombre',
                                profesion: photo.profesion || 'Perfil',
                                nacionalidad: photo.nacionalidad || '',
                                fotoPerfil: photo.fotoPerfil || photo.url,
                                photos: []
                            };
                        }
                        acc[key].photos.push(photo);
                        return acc;
                    }, {});

                    return Object.values(groupedByProfile)
                        .filter(bucket => bucket.photos.length > 0)
                        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
                }

                if (galleryViewMode === 'ETIQUETA') {
                    return GALLERY_LABELS
                        .map((label) => {
                            const labelPhotos = allGalleryPhotos.filter(photo => photo.label === label);
                            return {
                                id: `ETIQUETA-${label}`,
                                nombre: `Etiqueta ${label}`,
                                profesion: 'Archivo por etiqueta',
                                nacionalidad: '',
                                fotoPerfil: labelPhotos[0]?.url || '',
                                photos: labelPhotos
                            };
                        })
                        .filter(bucket => bucket.photos.length > 0);
                }

                return (categorias || [])
                    .map((categoria) => {
                        const categoryPhotos = allGalleryPhotos.filter((photo) => {
                            if (!photo.profileId) return false;
                            return (profileCategoryMap[photo.profileId] || []).includes(categoria.firebaseId);
                        });

                        return {
                            id: `CARPETA-${categoria.firebaseId}`,
                            nombre: categoria.label || 'Carpeta sin nombre',
                            profesion: 'Categoría',
                            nacionalidad: '',
                            fotoPerfil: categoria.coverImg || categoryPhotos[0]?.fotoPerfil || categoryPhotos[0]?.url || '',
                            photos: categoryPhotos
                        };
                    })
                    .filter(bucket => bucket.photos.length > 0)
                    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
            }, [allGalleryPhotos, categorias, galleryViewMode, profileCategoryMap]);
            const activeGalleryBucket = useMemo(() => {
                if (galleryViewMode === 'GENERAL') return galleryBuckets[0] || null;
                if (!selectedGalleryBucket) return null;
                return galleryBuckets.find(bucket => bucket.id === selectedGalleryBucket.id) || null;
            }, [galleryBuckets, selectedGalleryBucket, galleryViewMode]);
            const selectedCharacterBuckets = useMemo(() => {
                if (galleryViewMode !== 'PERSONAJE') return [];
                return galleryBuckets.filter((bucket) => selectedCharacterBucketIds.includes(bucket.id));
            }, [galleryBuckets, galleryViewMode, selectedCharacterBucketIds]);
            const sourceGalleryPhotos = useMemo(() => {
                if (galleryViewMode === 'PERSONAJE') {
                    return selectedCharacterBuckets.flatMap((bucket) => bucket.photos || []);
                }
                if (galleryViewMode === 'ETIQUETA') {
                    if (!selectedTagLabels.length) return [];
                    return allGalleryPhotos.filter((photo) => selectedTagLabels.includes(photo.label));
                }
                return activeGalleryBucket?.photos || allGalleryPhotos;
            }, [galleryViewMode, selectedCharacterBuckets, activeGalleryBucket, allGalleryPhotos, selectedTagLabels]);
            const galleryStats = useMemo(() => {
                return GALLERY_LABELS.reduce((acc, label) => {
                    acc[label] = sourceGalleryPhotos.filter(photo => photo.label === label).length;
                    return acc;
                }, {});
            }, [sourceGalleryPhotos]);
            const filteredGalleryPhotos = useMemo(() => {
                return sourceGalleryPhotos.filter(photo => (
                    galleryViewMode === 'ETIQUETA'
                        ? true
                        : galleryFilterLabel === 'INICIAL'
                            ? photo.label !== 'X'
                            : galleryFilterLabel === '100'
                                ? true
                                : photo.label === galleryFilterLabel
                ));
            }, [sourceGalleryPhotos, galleryFilterLabel, galleryViewMode]);
            const currentGalleryModeLabel = GALLERY_VIEW_MODE_LABELS[galleryViewMode] || galleryViewMode;
            const isGalleryBucketMode = galleryViewMode !== 'GENERAL' && galleryViewMode !== 'ETIQUETA';
            const availableCharacterBuckets = useMemo(() => {
                if (galleryViewMode !== 'PERSONAJE') return [];
                return galleryBuckets.filter((bucket) => !selectedCharacterBucketIds.includes(bucket.id));
            }, [galleryBuckets, galleryViewMode, selectedCharacterBucketIds]);
            const selectedGalleryPhoto = selectedGalleryIndex === null
                ? null
                : filteredGalleryPhotos[clampIndex(selectedGalleryIndex, filteredGalleryPhotos.length)] || null;
            const sceneMediaPhotos = useMemo(() => {
                const rawMedia = Array.isArray(globalMedia)
                    ? globalMedia
                    : globalMedia && typeof globalMedia === 'object'
                        ? Object.values(globalMedia)
                        : [];

                return rawMedia
                    .map((item, index) => {
                        const candidate = item && typeof item === 'object' ? item : { url: item };
                        const normalizedCandidate = candidate?.media && typeof candidate.media === 'object'
                            ? { ...candidate.media, label: candidate.label || candidate.media.label || '', type: candidate.type || candidate.media.type || '' }
                            : candidate;
                        const normalizedItem = normalizeGalleryItem(normalizedCandidate, candidate.type || normalizedCandidate.type || '');
                        if (!normalizedItem.url) return null;
                        return {
                            id: candidate.id || candidate.firebaseId || `scene-${index}-${normalizedItem.url}`,
                            url: normalizedItem.url,
                            label: normalizedItem.label || '',
                            type: normalizedItem.type,
                            isGif: normalizedItem.type === 'image' && isGifUrl(normalizedItem.url),
                            nombre: candidate.nombre || candidate.title || candidate.sceneName || candidate.autor || 'Escena',
                            profesion: candidate.profesion || candidate.category || 'Escenas/Fotos',
                            nacionalidad: candidate.nacionalidad || '',
                            fotoPerfil: normalizedItem.url
                        };
                    })
                    .filter(Boolean);
            }, [globalMedia]);
            const selectedScenePhoto = selectedSceneIndex === null
                ? null
                : sceneMediaPhotos[clampIndex(selectedSceneIndex, sceneMediaPhotos.length)] || null;
            const brokenGalleryPhotos = useMemo(() => {
                return allGalleryPhotos.filter((photo) => photo.type === 'image' && brokenGalleryMap[photo.id]);
            }, [allGalleryPhotos, brokenGalleryMap]);
            const brokenGalleryGroups = useMemo(() => {
                const grouped = brokenGalleryPhotos.reduce((acc, photo) => {
                    const key = photo.profileId || photo.nombre || 'sin-perfil';
                    if (!acc[key]) {
                        acc[key] = {
                            id: key,
                            nombre: photo.nombre || 'Sin nombre',
                            profesion: photo.profesion || 'Perfil',
                            nacionalidad: photo.nacionalidad || '',
                            fotos: []
                        };
                    }
                    acc[key].fotos.push(photo);
                    return acc;
                }, {});

                return Object.values(grouped)
                    .map((group) => ({
                        ...group,
                        fotos: group.fotos.sort((a, b) => (a.label || '').localeCompare(b.label || '', 'es', { sensitivity: 'base' }))
                    }))
                    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
            }, [brokenGalleryPhotos]);

            useEffect(() => {
                if (!selectedGalleryPhoto) {
                    setIsEditingGalleryLabel(false);
                    setGalleryLabelDraft('');
                    return;
                }
                setIsEditingGalleryLabel(false);
                setGalleryLabelDraft(selectedGalleryPhoto.label || '');
            }, [selectedGalleryPhoto]);

            useEffect(() => {
                if (activeTab !== 'GALERIA') {
                    setSelectedGalleryBucket(null);
                    setSelectedGalleryIndex(null);
                }
                if (activeTab !== 'ESCENAS_FOTOS') {
                    setSelectedSceneIndex(null);
                }
            }, [activeTab]);

            useEffect(() => {
                setSelectedGalleryBucket(null);
                setSelectedGalleryIndex(null);
                setSelectedCharacterBucketIds([]);
                setSelectedTagLabels([]);
            }, [galleryViewMode]);

            useEffect(() => {
                if (selectedGalleryIndex === null) return;

                if (!filteredGalleryPhotos.length) {
                    setSelectedGalleryIndex(null);
                    return;
                }

                if (selectedGalleryIndex >= filteredGalleryPhotos.length) {
                    setSelectedGalleryIndex(0);
                }
            }, [filteredGalleryPhotos, selectedGalleryIndex]);

            useEffect(() => {
                if (selectedGalleryIndex === null) return;

                const handleGalleryKeydown = (event) => {
                    if (event.key === 'Escape') {
                        setSelectedGalleryIndex(null);
                        return;
                    }

                    if (!filteredGalleryPhotos.length) return;

                    if (event.key === 'ArrowRight') {
                        setSelectedGalleryIndex((current) => clampIndex((current ?? 0) + 1, filteredGalleryPhotos.length));
                    }

                    if (event.key === 'ArrowLeft') {
                        setSelectedGalleryIndex((current) => clampIndex((current ?? 0) - 1, filteredGalleryPhotos.length));
                    }
                };

                window.addEventListener('keydown', handleGalleryKeydown);
                return () => window.removeEventListener('keydown', handleGalleryKeydown);
            }, [filteredGalleryPhotos.length, selectedGalleryIndex]);

            useEffect(() => {
                if (selectedGalleryIndex === null) {
                    setIsGalleryPlaying(false);
                    setIsGalleryRandom(false);
                }
            }, [selectedGalleryIndex]);
            useEffect(() => {
                if (selectedSceneIndex === null) {
                    setIsScenePlaying(false);
                    setIsSceneRandom(false);
                }
            }, [selectedSceneIndex]);
            useEffect(() => {
                if (selectedSceneIndex === null) return;

                if (!sceneMediaPhotos.length) {
                    setSelectedSceneIndex(null);
                    return;
                }

                if (selectedSceneIndex >= sceneMediaPhotos.length) {
                    setSelectedSceneIndex(0);
                }
            }, [sceneMediaPhotos, selectedSceneIndex]);
            useEffect(() => {
                if (selectedSceneIndex === null) return;

                const handleSceneKeydown = (event) => {
                    if (event.key === 'Escape') {
                        setSelectedSceneIndex(null);
                        return;
                    }

                    if (!sceneMediaPhotos.length) return;

                    if (event.key === 'ArrowRight') {
                        setSelectedSceneIndex((current) => clampIndex((current ?? 0) + 1, sceneMediaPhotos.length));
                    }

                    if (event.key === 'ArrowLeft') {
                        setSelectedSceneIndex((current) => clampIndex((current ?? 0) - 1, sceneMediaPhotos.length));
                    }
                };

                window.addEventListener('keydown', handleSceneKeydown);
                return () => window.removeEventListener('keydown', handleSceneKeydown);
            }, [sceneMediaPhotos.length, selectedSceneIndex]);
            useEffect(() => {
                if (!contextMenuOpen) return;

                const handleOutsideClick = (event) => {
                    if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                        setContextMenuOpen(false);
                    }
                };

                const handleEscape = (event) => {
                    if (event.key === 'Escape') {
                        setContextMenuOpen(false);
                    }
                };

                document.addEventListener('mousedown', handleOutsideClick);
                window.addEventListener('keydown', handleEscape);

                return () => {
                    document.removeEventListener('mousedown', handleOutsideClick);
                    window.removeEventListener('keydown', handleEscape);
                };
            }, [contextMenuOpen]);
            useEffect(() => {
                if (!isBrokenGalleryModalOpen) return;
                let isCancelled = false;
                const imagePhotos = allGalleryPhotos.filter((photo) => photo.type === 'image' && photo.url);

                if (!imagePhotos.length) {
                    setBrokenGalleryMap({});
                    setIsCheckingBrokenGallery(false);
                    return;
                }

                const run = async () => {
                    setIsCheckingBrokenGallery(true);
                    const concurrency = 8;
                    const results = [];

                    for (let index = 0; index < imagePhotos.length; index += concurrency) {
                        const batch = imagePhotos.slice(index, index + concurrency);
                        const batchResults = await Promise.all(batch.map(async (photo) => ({
                            id: photo.id,
                            isBroken: await checkImageUrlIsBroken(photo.url)
                        })));

                        results.push(...batchResults);
                        if (isCancelled) return;
                    }

                    if (isCancelled) return;

                    const nextMap = results.reduce((acc, entry) => {
                        acc[entry.id] = entry.isBroken;
                        return acc;
                    }, {});
                    setBrokenGalleryMap(nextMap);
                    if (!isCancelled) setIsCheckingBrokenGallery(false);
                };

                run();
                return () => {
                    isCancelled = true;
                };
            }, [isBrokenGalleryModalOpen, allGalleryPhotos]);
            useEffect(() => {
                if (!isBrokenGalleryModalOpen) return;
                const nextDrafts = brokenGalleryPhotos.reduce((acc, photo) => {
                    acc[photo.id] = photo.url;
                    return acc;
                }, {});
                setBrokenGalleryUrlDrafts(nextDrafts);
                setBrokenGalleryEditingMap({});
            }, [isBrokenGalleryModalOpen, brokenGalleryPhotos]);

            useEffect(() => {
                if (galleryPlaybackTimeoutRef.current) {
                    clearTimeout(galleryPlaybackTimeoutRef.current);
                    galleryPlaybackTimeoutRef.current = null;
                }

                if (!isGalleryPlaying || !selectedGalleryPhoto) return;
                if (selectedGalleryPhoto.type === 'video') return;

                const timeoutDuration = galleryPlaybackSeconds * 1000;
                galleryPlaybackTimeoutRef.current = setTimeout(() => {
                    setSelectedGalleryIndex((current) => getNextPlayableIndex(current, filteredGalleryPhotos, isGalleryRandom));
                }, timeoutDuration);

                return () => {
                    if (galleryPlaybackTimeoutRef.current) {
                        clearTimeout(galleryPlaybackTimeoutRef.current);
                        galleryPlaybackTimeoutRef.current = null;
                    }
                };
            }, [isGalleryPlaying, selectedGalleryPhoto, filteredGalleryPhotos, isGalleryRandom, galleryPlaybackSeconds]);
            useEffect(() => {
                if (scenePlaybackTimeoutRef.current) {
                    clearTimeout(scenePlaybackTimeoutRef.current);
                    scenePlaybackTimeoutRef.current = null;
                }

                if (!isScenePlaying || !selectedScenePhoto) return;
                if (selectedScenePhoto.type === 'video') return;

                const timeoutDuration = galleryPlaybackSeconds * 1000;
                scenePlaybackTimeoutRef.current = setTimeout(() => {
                    setSelectedSceneIndex((current) => getNextPlayableIndex(current, sceneMediaPhotos, isSceneRandom));
                }, timeoutDuration);

                return () => {
                    if (scenePlaybackTimeoutRef.current) {
                        clearTimeout(scenePlaybackTimeoutRef.current);
                        scenePlaybackTimeoutRef.current = null;
                    }
                };
            }, [isScenePlaying, selectedScenePhoto, sceneMediaPhotos, isSceneRandom, galleryPlaybackSeconds]);

            const openGalleryViewer = (index, autoplay = false) => {
                setSelectedGalleryIndex(index);
                setIsGalleryPlaying(autoplay);
            };
            const openSceneViewer = (index, autoplay = false) => {
                setSelectedSceneIndex(index);
                setIsScenePlaying(autoplay);
            };
            const addCharacterToGallerySelection = (bucketId) => {
                if (!bucketId) return;
                setSelectedCharacterBucketIds((current) => current.includes(bucketId) ? current : [...current, bucketId]);
                setSelectedGalleryIndex(null);
            };
            const removeCharacterFromGallerySelection = (bucketId) => {
                if (!bucketId) return;
                setSelectedCharacterBucketIds((current) => current.filter((id) => id !== bucketId));
                setSelectedGalleryIndex(null);
            };
            const toggleEtiquetaSelection = (label) => {
                if (!label) return;
                setSelectedTagLabels((current) => current.includes(label)
                    ? current.filter((selected) => selected !== label)
                    : [...current, label]
                );
                setSelectedGalleryIndex(null);
            };
            const closeGalleryViewer = () => {
                setIsGalleryPlaying(false);
                setSelectedGalleryIndex(null);
            };
            const closeSceneViewer = () => {
                setIsScenePlaying(false);
                setSelectedSceneIndex(null);
            };
            const showNextGalleryPhoto = () => setSelectedGalleryIndex((current) => getNextPlayableIndex(current, filteredGalleryPhotos, isGalleryRandom));
            const showPreviousGalleryPhoto = () => setSelectedGalleryIndex((current) => clampIndex((current ?? 0) - 1, filteredGalleryPhotos.length));
            const showNextScenePhoto = () => setSelectedSceneIndex((current) => getNextPlayableIndex(current, sceneMediaPhotos, isSceneRandom));
            const showPreviousScenePhoto = () => setSelectedSceneIndex((current) => clampIndex((current ?? 0) - 1, sceneMediaPhotos.length));
            const saveSelectedGalleryLabel = async () => {
                if (!selectedGalleryPhoto?.profileId || !selectedGalleryPhoto?.sourceTag || !Number.isInteger(selectedGalleryPhoto?.sourceIndex)) return;
                try {
                    await updateGalleryItemLabel({
                        profileId: selectedGalleryPhoto.profileId,
                        sourceTag: selectedGalleryPhoto.sourceTag,
                        sourceIndex: selectedGalleryPhoto.sourceIndex,
                        label: galleryLabelDraft
                    });
                    setIsEditingGalleryLabel(false);
                } catch (error) {
                    console.error('Error al actualizar etiqueta de la multimedia:', error);
                }
            };
            const handleBrokenDraftChange = (photoId, nextUrl) => {
                setBrokenGalleryUrlDrafts((current) => ({ ...current, [photoId]: nextUrl }));
            };
            const setBrokenPhotoEditing = (photoId, isEditing) => {
                if (!photoId) return;
                setBrokenGalleryEditingMap((current) => ({ ...current, [photoId]: Boolean(isEditing) }));
            };
            const openBrokenGalleryPhotoUrl = (photo) => {
                const targetUrl = (brokenGalleryUrlDrafts[photo?.id] || photo?.url || '').trim();
                if (!targetUrl) return;
                window.open(targetUrl, '_blank', 'noopener,noreferrer');
            };
            const saveBrokenGalleryPhotoUrl = async (photo) => {
                if (!photo) return;
                const nextUrl = (brokenGalleryUrlDrafts[photo.id] || '').trim();
                if (!nextUrl) return;

                setBrokenGallerySavingMap((current) => ({ ...current, [photo.id]: true }));
                try {
                    if (nextUrl !== photo.url) {
                        await updateGalleryItemUrl({
                            profileId: photo.profileId,
                            sourceTag: photo.sourceTag,
                            sourceIndex: photo.sourceIndex,
                            url: nextUrl
                        });
                    }
                    const isBroken = await checkImageUrlIsBroken(nextUrl);
                    setBrokenGalleryMap((current) => ({ ...current, [photo.id]: isBroken }));
                    if (!isBroken) {
                        setBrokenPhotoEditing(photo.id, false);
                    }
                } catch (error) {
                    console.error('Error al actualizar URL rota:', error);
                } finally {
                    setBrokenGallerySavingMap((current) => ({ ...current, [photo.id]: false }));
                }
            };
            const deleteBrokenGalleryPhoto = async (photo) => {
                if (!photo) return;
                const confirmed = window.confirm('¿Eliminar esta foto rota de la galería?');
                if (!confirmed) return;

                setBrokenGallerySavingMap((current) => ({ ...current, [photo.id]: true }));
                try {
                    await removeGalleryItem({
                        profileId: photo.profileId,
                        sourceTag: photo.sourceTag,
                        sourceIndex: photo.sourceIndex
                    });
                } catch (error) {
                    console.error('Error al eliminar foto rota:', error);
                } finally {
                    setBrokenGallerySavingMap((current) => ({ ...current, [photo.id]: false }));
                }
            };
            const galleryContextLabel = useMemo(() => {
                if (galleryViewMode === 'PERSONAJE') {
                    return selectedCharacterBuckets.length
                        ? `${selectedCharacterBuckets.length} personaje${selectedCharacterBuckets.length > 1 ? 's' : ''} seleccionado${selectedCharacterBuckets.length > 1 ? 's' : ''}`
                        : 'Sin personajes seleccionados';
                }
                if (activeGalleryBucket && isGalleryBucketMode) return activeGalleryBucket.nombre;
                return currentGalleryModeLabel;
            }, [galleryViewMode, selectedCharacterBuckets, activeGalleryBucket, isGalleryBucketMode, currentGalleryModeLabel]);

const saveProfile = (e) => {
                e.preventDefault();
                const profileData = { ...formData };

                if (editingId) {
                    // Si estamos editando, buscamos el lugar exacto y lo actualizamos
                    db.ref(`perfiles/${editingId}`).set(profileData)
                        .then(() => {
                            setIsModalOpen(false);
                            setEditingId(null);
                        })
                        .catch(err => console.error("Error al excitar la base de datos:", err));
                } else {
                    // Si es nuevo, lo empujamos con fuerza a la colección
                    db.ref('perfiles').push(profileData)
                        .then(() => {
                            setIsModalOpen(false);
                            setFormData(getEmptyProfileFormData());
                        })
                        .catch(err => console.error("No pudo entrar el perfil:", err));
                }
            };
            const saveCategory = async (e) => {
                e.preventDefault();

                const { firebaseId, ...categoryData } = catFormData;
                const payload = { ...categoryData, type: 'custom' };

                try {
                    if (firebaseId) {
                        await db.ref(`categorias/${firebaseId}`).update(payload);
                    } else {
                        await db.ref('categorias').push(payload);
                    }

                    setIsCatModalOpen(false);
                    resetCatForm();
                } catch (error) {
                    console.error("La categoría no quiso guardarse:", error);
                }
            };
            const deleteCategory = async (categoryId) => {
                if (!categoryId) return;

                try {
                    await db.ref(`categorias/${categoryId}`).remove();

                    setCategorias(prev => prev.filter(c => c.firebaseId !== categoryId));
                    setSelectedCategory(prev => prev === categoryId ? null : prev);
                } catch (error) {
                    console.error("No se pudo borrar la categoría:", error);
                    alert("No se pudo borrar la carpeta. Probá de nuevo.");
                }
            };

            const requestDeleteProfile = (profile) => {
                if (!profile?.firebaseId) return;
                setProfileActionError('');
                setContextProfile(profile);
                setIsDeleteProfileModalOpen(true);
            };

            const deleteProfile = () => {
                if (!editingId) return;
                const profileToDelete = perfiles.find((profile) => profile.firebaseId === editingId);
                if (!profileToDelete) return;
                requestDeleteProfile(profileToDelete);
            };

            const closeDeleteProfileModal = () => {
                setIsDeleteProfileModalOpen(false);
                setContextMenuProfileId(null);
                setContextProfile(null);
            };

            const deleteProfileById = async (profileId) => {
                if (!profileId) return;
                await db.ref(`perfiles/${profileId}`).remove();
                setPerfiles(prev => prev.filter(p => p.firebaseId !== profileId));
            };

            const confirmDeleteFromContext = async () => {
                if (!contextProfile?.firebaseId) return;

                try {
                    await deleteProfileById(contextProfile.firebaseId);
                    setProfileActionError('');
                    setIsModalOpen(false);
                    if (editingId === contextProfile.firebaseId) {
                        setEditingId(null);
                    }
                    closeDeleteProfileModal();
                } catch (error) {
                    console.error("No se pudo borrar el perfil:", error);
                    setProfileActionError('No se pudo borrar el perfil en Firebase. Probá de nuevo.');
                }
            };

            const closeContextMenu = () => {
                setContextMenuOpen(false);
                setContextProfile(null);
            };

            const handleContextMenuOpen = (event, profile) => {
                event.preventDefault();
                setContextMenuOpen(true);
                setContextMenuPosition({ x: event.clientX, y: event.clientY });
                setContextProfile(profile);
            };

            const handleContextEdit = () => {
                if (!contextProfile) return;
                setFormData(mapProfileToFormData(contextProfile));
                setEditingId(contextProfile.firebaseId);
                setIsModalOpen(true);
                closeContextMenu();
            };

            const handleContextDelete = async () => {
                if (!contextProfile?.firebaseId) return;
                const confirmed = confirm('¿Borrar perfil? Esta acción también lo elimina de Firebase.');
                if (!confirmed) {
                    closeContextMenu();
                    return;
                }

                try {
                    await db.ref(`perfiles/${contextProfile.firebaseId}`).remove();
                    setPerfiles(prev => prev.filter(p => p.firebaseId !== contextProfile.firebaseId));
                    closeContextMenu();
                } catch (error) {
                    console.error("No se pudo borrar el perfil:", error);
                    alert("No se pudo borrar el perfil. Probá de nuevo.");
                    closeContextMenu();
                }
            };
            const getProfileHeightLabel = (profile) => {
                const rawHeight = profile?.estaturaCm;
                if (rawHeight === undefined || rawHeight === null || rawHeight === '') {
                    return 'Sin dato';
                }

                const numericHeight = Number(rawHeight);
                if (Number.isNaN(numericHeight) || numericHeight <= 0) {
                    return 'Sin dato';
                }

                return `${Math.round(numericHeight)} cm`;
            };

            const normalizeGroupingValue = (value = '') => String(value || '').trim().toLowerCase();
            const formatGroupingLabel = (value = '') => String(value || '').trim();
            const getArenaOrderedProfileIds = (profiles = []) => (
                [...(profiles || [])]
                    .filter((profile) => profile?.firebaseId && (profile?.nombre || '').trim())
                    .sort((a, b) => (a.nombre || '').localeCompare((b.nombre || ''), 'es', { sensitivity: 'base' }))
                    .map((profile) => profile.firebaseId)
            );
            const getBattleScopeOptions = (profiles = [], scopeId = 'GENERAL') => {
                const mode = String(scopeId || 'GENERAL').trim().toUpperCase();
                const orderedProfiles = [...(profiles || [])]
                    .filter((profile) => profile?.firebaseId && (profile?.nombre || '').trim())
                    .sort((a, b) => (a.nombre || '').localeCompare((b.nombre || ''), 'es', { sensitivity: 'base' }));

                if (mode === 'GENERAL') {
                    return [{ key: 'all', label: 'Todas', typeLabel: 'General', ids: orderedProfiles.map((profile) => profile.firebaseId) }];
                }

                if (mode === 'EDADES') {
                    const ageBuckets = {
                        '18-28': { key: '18-28', label: '18–28', typeLabel: 'Edad', ids: [] },
                        '29-39': { key: '29-39', label: '29–39', typeLabel: 'Edad', ids: [] },
                        '40+': { key: '40+', label: '40–50+', typeLabel: 'Edad', ids: [] }
                    };
                    orderedProfiles.forEach((profile) => {
                        const age = calcularEdad(profile.fechaNacimiento);
                        if (!Number.isFinite(age) || age < 18) return;
                        if (age <= 28) ageBuckets['18-28'].ids.push(profile.firebaseId);
                        else if (age <= 39) ageBuckets['29-39'].ids.push(profile.firebaseId);
                        else ageBuckets['40+'].ids.push(profile.firebaseId);
                    });
                    return Object.values(ageBuckets);
                }

                const field = mode === 'NACIONALIDADES' ? 'nacionalidad' : 'profesion';
                const typeLabel = mode === 'NACIONALIDADES' ? 'Nacionalidad' : 'Profesión';
                const groupedMap = orderedProfiles.reduce((acc, profile) => {
                    const normalizedValue = normalizeGroupingValue(profile?.[field]);
                    if (!normalizedValue) return acc;
                    if (!acc[normalizedValue]) {
                        acc[normalizedValue] = {
                            key: normalizedValue,
                            label: formatGroupingLabel(profile?.[field]) || normalizedValue,
                            typeLabel,
                            ids: []
                        };
                    }
                    acc[normalizedValue].ids.push(profile.firebaseId);
                    return acc;
                }, {});
                return Object.values(groupedMap)
                    .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));
            };
            const buildArenaParticipants = (profiles = [], mode = 'GENERAL', selectedGroupKey = '') => {
                const baseProfiles = [...(profiles || [])]
                    .filter((profile) => profile?.firebaseId && (profile?.nombre || '').trim())
                    .sort((a, b) => (a.nombre || '').localeCompare((b.nombre || ''), 'es', { sensitivity: 'base' }));

                if (mode === 'GENERAL') {
                    const ids = baseProfiles.map((profile) => profile.firebaseId);
                    return {
                        groupedIds: ids.length > 1
                            ? [{ key: 'general', label: 'General', typeLabel: 'General', ids }]
                            : [],
                        orderedIds: ids
                    };
                }

                const groupOptions = getBattleScopeOptions(baseProfiles, mode);
                const normalizedSelectedGroupKey = normalizeGroupingValue(selectedGroupKey);
                const groupedIds = groupOptions
                    .filter((group) => {
                        if (!normalizedSelectedGroupKey || normalizedSelectedGroupKey === 'all') return true;
                        return normalizeGroupingValue(group.key) === normalizedSelectedGroupKey;
                    })
                    .filter((group) => group.ids.length >= 2);

                return {
                    groupedIds,
                    orderedIds: groupedIds.flatMap((group) => group.ids)
                };
            };
            const getPairKey = (profileAId, profileBId) => [profileAId, profileBId].sort().join('__');
            const normalizeMatchupRecord = (rawRecord) => {
                if (!rawRecord || typeof rawRecord !== 'object') return null;

                const winnerId = String(rawRecord.winnerId || '').trim();
                const loserId = String(rawRecord.loserId || '').trim();
                if (!winnerId || !loserId || winnerId === loserId) return null;

                return {
                    winnerId,
                    loserId,
                    reason: rawRecord.reason === 'transitive' ? 'transitive' : 'direct',
                    playedAt: Number.isFinite(rawRecord.playedAt) ? rawRecord.playedAt : null
                };
            };
            const isMatchupResolved = (playedMatchups = {}, key = '') => !!normalizeMatchupRecord(playedMatchups?.[key]);
            const buildArenaDerivedState = (rawDirectMatchups = {}, orderedIds = []) => {
                const allowedIds = new Set((orderedIds || []).filter(Boolean));
                const nextDirectMatchups = {};
                const nextMatchups = {};
                const victoryGraphSets = {};

                Object.entries(rawDirectMatchups || {}).forEach(([rawKey, rawRecord]) => {
                    const normalizedRecord = normalizeMatchupRecord(rawRecord);
                    if (!normalizedRecord) return;

                    const { winnerId, loserId } = normalizedRecord;
                    if (allowedIds.size && (!allowedIds.has(winnerId) || !allowedIds.has(loserId))) return;

                    const pairKey = getPairKey(winnerId, loserId);
                    const directRecord = {
                        winnerId,
                        loserId,
                        reason: 'direct',
                        playedAt: normalizedRecord.playedAt ?? Date.now()
                    };

                    nextDirectMatchups[pairKey] = directRecord;
                    nextMatchups[pairKey] = directRecord;

                    if (!victoryGraphSets[winnerId]) victoryGraphSets[winnerId] = new Set();
                    victoryGraphSets[winnerId].add(loserId);
                });

                const graphNodes = new Set([
                    ...Object.keys(victoryGraphSets),
                    ...Object.values(victoryGraphSets).flatMap((set) => [...set])
                ]);

                graphNodes.forEach((originId) => {
                    const queue = [...(victoryGraphSets[originId] || [])];
                    const visited = new Set();

                    while (queue.length) {
                        const nodeId = queue.shift();
                        if (!nodeId || visited.has(nodeId) || nodeId === originId) continue;
                        visited.add(nodeId);

                        const pairKey = getPairKey(originId, nodeId);
                        if (!nextMatchups[pairKey]) {
                            nextMatchups[pairKey] = {
                                winnerId: originId,
                                loserId: nodeId,
                                reason: 'transitive',
                                playedAt: null
                            };
                        }

                        (victoryGraphSets[nodeId] || []).forEach((nextId) => {
                            if (!visited.has(nextId)) queue.push(nextId);
                        });
                    }
                });

                const victoryGraph = Object.fromEntries(
                    Object.entries(victoryGraphSets).map(([winnerId, losers]) => [winnerId, [...losers]])
                );
                const stats = rebuildArenaStatsFromMatchups(nextMatchups);

                return {
                    directMatchups: nextDirectMatchups,
                    matchups: nextMatchups,
                    victoryGraph,
                    stats
                };
            };
            const normalizeArenaGlobalState = (arenaName, rawArenaGlobalState = {}) => {
                const globalKey = getArenaGlobalKey(arenaName);
                if (!globalKey) return null;
                const orderedIds = getArenaOrderedProfileIds(perfiles);
                const derivedState = buildArenaDerivedState(
                    rawArenaGlobalState?.directMatchups || rawArenaGlobalState?.matchups || {},
                    orderedIds
                );
                return {
                    arenaName: globalKey,
                    orderedIds,
                    ...derivedState
                };
            };
            const findNextPendingPairInGroup = (groupIds = [], playedMatchups = {}) => {
                for (let i = 0; i < groupIds.length - 1; i++) {
                    for (let j = i + 1; j < groupIds.length; j++) {
                        const key = getPairKey(groupIds[i], groupIds[j]);
                        if (!isMatchupResolved(playedMatchups, key)) return [groupIds[i], groupIds[j]];
                    }
                }
                return null;
            };
            const findNextPendingPairByGroups = (groupedIds = [], playedMatchups = {}, globalMatchups = {}) => {
                const resolvedMatchups = { ...(playedMatchups || {}), ...(globalMatchups || {}) };
                for (const group of groupedIds) {
                    const nextPair = findNextPendingPairInGroup(group?.ids || [], resolvedMatchups);
                    if (nextPair) return nextPair;
                }
                return null;
            };
            const getGroupForPair = (groupedIds = [], profileAId, profileBId = '') => {
                if (!profileAId) return null;
                return groupedIds.find((group) => {
                    const ids = group?.ids || [];
                    if (!ids.includes(profileAId)) return false;
                    return !profileBId || ids.includes(profileBId);
                }) || null;
            };

            const rebuildArenaStatsFromMatchups = (matchups = {}) => {
                return Object.keys(matchups || {}).reduce((acc, key) => {
                    const matchupValue = normalizeMatchupRecord(matchups[key]);
                    if (!matchupValue) return acc;
                    const { winnerId, loserId } = matchupValue;
                    const prevWinner = acc[winnerId] || { wins: 0, battles: 0 };
                    const prevLoser = acc[loserId] || { wins: 0, battles: 0 };
                    return {
                        ...acc,
                        [winnerId]: {
                            wins: prevWinner.wins + 1,
                            battles: prevWinner.battles + 1
                        },
                        [loserId]: {
                            wins: prevLoser.wins,
                            battles: prevLoser.battles + 1
                        }
                    };
                }, {});
            };
            const isArenaStateKeyForArena = (arenaStateKey = '', arenaName = '') => {
                const normalizedArena = String(arenaName || '').trim();
                if (!arenaStateKey || !normalizedArena) return false;
                return arenaStateKey.endsWith(`::${normalizedArena}`);
            };
            const mergeDirectMatchupRecord = (previousRecord, nextRecord) => {
                const normalizedNext = normalizeMatchupRecord(nextRecord);
                if (!normalizedNext || normalizedNext.reason !== 'direct') return previousRecord || null;
                const normalizedPrevious = normalizeMatchupRecord(previousRecord);
                if (!normalizedPrevious || normalizedPrevious.reason !== 'direct') return normalizedNext;
                const prevPlayedAt = normalizedPrevious.playedAt ?? 0;
                const nextPlayedAt = normalizedNext.playedAt ?? 0;
                return nextPlayedAt >= prevPlayedAt ? normalizedNext : normalizedPrevious;
            };
            const getGlobalArenaDerivedState = (arenaName, sourceArenaBattleState = arenaBattleState) => {
                const normalizedArena = String(arenaName || '').trim();
                if (!normalizedArena) {
                    return buildArenaDerivedState({}, []);
                }

                const mergedDirectMatchups = {};
                Object.entries(sourceArenaBattleState || {}).forEach(([arenaStateKey, state]) => {
                    if (!isArenaStateKeyForArena(arenaStateKey, normalizedArena)) return;
                    const directMatchups = state?.directMatchups || {};
                    Object.entries(directMatchups).forEach(([pairKey, rawRecord]) => {
                        mergedDirectMatchups[pairKey] = mergeDirectMatchupRecord(mergedDirectMatchups[pairKey], rawRecord);
                    });
                });

                const allProfileIds = [...(perfiles || [])]
                    .map((profile) => profile?.firebaseId)
                    .filter(Boolean)
                    .sort((a, b) => String(a).localeCompare(String(b), 'es', { sensitivity: 'base' }));

                return buildArenaDerivedState(mergedDirectMatchups, allProfileIds);
            };
            const getArenaStats = (arenaName, profileId) => {
                const globalStats = getGlobalArenaDerivedState(arenaName).stats || {};
                const stats = globalStats[profileId] || { wins: 0, battles: 0 };
                const score = stats.battles ? Math.round((stats.wins / stats.battles) * 100) : 0;
                return { ...stats, score };
            };
            const buildArenaScoreMapFromGlobalStats = (arenaName, sourceArenaBattleState = arenaBattleState) => {
                const globalStats = getGlobalArenaDerivedState(arenaName, sourceArenaBattleState).stats || {};
                return [...(perfiles || [])]
                    .filter((profile) => profile?.firebaseId)
                    .reduce((acc, profile) => {
                        const profileStats = globalStats[profile.firebaseId] || { wins: 0, battles: 0 };
                        acc[profile.firebaseId] = profileStats.battles
                            ? Math.round((profileStats.wins / profileStats.battles) * 100)
                            : 0;
                        return acc;
                    }, {});
            };

            const findNextPendingPair = (ids = [], playedMatchups = {}) => {
                for (let i = 0; i < ids.length - 1; i++) {
                    for (let j = i + 1; j < ids.length; j++) {
                        const key = getPairKey(ids[i], ids[j]);
                        if (!isMatchupResolved(playedMatchups, key)) {
                            return [ids[i], ids[j]];
                        }
                    }
                }
                return null;
            };

            const normalizeArenaState = (arenaName, arenaState, globalStateForArena = null) => {
                if (!arenaState) return null;
                const mode = ARENA_PARTICIPANT_MODES.includes(arenaState.mode) ? arenaState.mode : 'GENERAL';
                const groupKey = String(arenaState.groupKey || 'all').trim().toLowerCase() || 'all';
                const participants = buildArenaParticipants(perfiles, mode, groupKey);
                const groupedIds = participants.groupedIds || [];
                const orderedIds = participants.orderedIds || [];
                const normalizedGlobal = normalizeArenaGlobalState(arenaName, globalStateForArena || arenaGlobalState?.[getArenaGlobalKey(arenaName)] || {});
                const directMatchups = normalizedGlobal?.directMatchups || {};
                const globalMatchups = normalizedGlobal?.matchups || {};
                const victoryGraph = normalizedGlobal?.victoryGraph || {};
                const stats = normalizedGlobal?.stats || {};
                const currentChampionId = arenaState.championId;
                const currentChallengerId = arenaState.challengerId;
                const currentGroup = getGroupForPair(groupedIds, currentChampionId, currentChallengerId);
                const currentPairIsValid = (
                    !!currentChampionId &&
                    !!currentChallengerId &&
                    currentChampionId !== currentChallengerId &&
                    !!currentGroup &&
                    !isMatchupResolved(globalMatchups, getPairKey(currentChampionId, currentChallengerId))
                );
                const nextPendingPair = groupedIds.length
                    ? findNextPendingPairByGroups(groupedIds, arenaState.matchups || {}, globalMatchups)
                    : null;
                const nextPair = currentPairIsValid
                    ? [currentChampionId, currentChallengerId]
                    : nextPendingPair;
                const isFinished = !nextPendingPair;
                const activeGroup = getGroupForPair(groupedIds, nextPair?.[0], nextPair?.[1]);

                return {
                    ...arenaState,
                    mode,
                    groupKey,
                    groupedIds,
                    orderedIds,
                    stats,
                    directMatchups,
                    matchups: globalMatchups,
                    victoryGraph,
                    championId: nextPair ? nextPair[0] : null,
                    challengerId: nextPair ? nextPair[1] : null,
                    activeGroupKey: activeGroup?.key || null,
                    activeGroupLabel: activeGroup ? `${activeGroup.typeLabel}: ${activeGroup.label}` : '',
                    isFinished
                };
            };

            useEffect(() => {
                if (!perfiles.length) return;

                const repairedStates = {};
                const updates = [];

                Object.entries(arenaBattleState || {}).forEach(([arenaKey, state]) => {
                    const { arenaName } = parseArenaBattleKey(arenaKey);
                    const normalized = normalizeArenaState(arenaName, state, arenaGlobalState?.[getArenaGlobalKey(arenaName)]);
                    if (!normalized) return;

                    const hasChanged = JSON.stringify(state) !== JSON.stringify(normalized);
                    if (!hasChanged) return;

                    repairedStates[arenaKey] = normalized;
                    updates.push(
                        db.ref(`arenaBattleState/${arenaKey}`).set(normalized)
                            .catch(error => console.error('No se pudo normalizar el estado del arena:', error))
                    );
                });

                if (!Object.keys(repairedStates).length) return;

                setArenaBattleState(prev => ({
                    ...prev,
                    ...repairedStates
                }));

                Promise.all(updates).catch(() => {});
            }, [arenaBattleState, arenaGlobalState, perfiles]);

            useEffect(() => {
                if (!perfiles.length) return;

                const legacyDirectByArena = {};
                Object.entries(arenaBattleState || {}).forEach(([arenaKey, state]) => {
                    const { arenaName } = parseArenaBattleKey(arenaKey);
                    const globalKey = getArenaGlobalKey(arenaName);
                    if (!globalKey) return;
                    if (!legacyDirectByArena[globalKey]) legacyDirectByArena[globalKey] = {};
                    Object.entries(state?.directMatchups || {}).forEach(([pairKey, rawRecord]) => {
                        const normalizedRecord = normalizeMatchupRecord(rawRecord);
                        if (!normalizedRecord) return;
                        legacyDirectByArena[globalKey][pairKey] = {
                            winnerId: normalizedRecord.winnerId,
                            loserId: normalizedRecord.loserId,
                            reason: 'direct',
                            playedAt: normalizedRecord.playedAt ?? Date.now()
                        };
                    });
                });

                const updates = [];
                const localUpdates = {};
                Object.entries(legacyDirectByArena).forEach(([arenaName, mergedDirectMatchups]) => {
                    const globalKey = getArenaGlobalKey(arenaName);
                    if (!globalKey || arenaGlobalState?.[globalKey]) return;
                    const normalizedGlobal = normalizeArenaGlobalState(arenaName, { directMatchups: mergedDirectMatchups });
                    if (!normalizedGlobal) return;
                    localUpdates[globalKey] = normalizedGlobal;
                    updates.push(
                        db.ref(`arenaGlobalState/${globalKey}`).set(normalizedGlobal)
                            .catch(error => console.error('No se pudo migrar arenaGlobalState:', error))
                    );
                });

                if (!Object.keys(localUpdates).length) return;
                setArenaGlobalState((prev) => ({ ...prev, ...localUpdates }));
                Promise.all(updates).catch(() => {});
            }, [arenaBattleState, arenaGlobalState, perfiles]);

            const initArenaBattle = (arenaName, scopeId = selectedBattleScope, groupKey = selectedBattleGroupKey) => {
                const orderedProfiles = [...perfiles]
                    .filter(p => p?.firebaseId && (p?.nombre || '').trim())
                    .sort((a, b) => (a.nombre || '').localeCompare((b.nombre || ''), 'es', { sensitivity: 'base' }));

                if (orderedProfiles.length < 2) return;

                const mode = String(scopeId || 'GENERAL').trim().toUpperCase();
                const participants = buildArenaParticipants(orderedProfiles, mode, groupKey);
                const groupedIds = participants.groupedIds || [];
                const orderedIds = participants.orderedIds || [];
                const globalKey = getArenaGlobalKey(arenaName);
                const normalizedGlobal = normalizeArenaGlobalState(arenaName, arenaGlobalState?.[globalKey] || {});
                const globalMatchups = normalizedGlobal?.matchups || {};
                const initialPair = findNextPendingPairByGroups(groupedIds, {}, globalMatchups);
                if (!initialPair) return;
                const activeGroup = getGroupForPair(groupedIds, initialPair[0], initialPair[1]);

                const nextArenaState = {
                    mode,
                    groupKey: String(groupKey || '').trim().toLowerCase() || 'all',
                    groupedIds,
                    orderedIds,
                    stats: normalizedGlobal?.stats || {},
                    directMatchups: normalizedGlobal?.directMatchups || {},
                    matchups: globalMatchups,
                    victoryGraph: normalizedGlobal?.victoryGraph || {},
                    championId: initialPair[0],
                    challengerId: initialPair[1],
                    activeGroupKey: activeGroup?.key || null,
                    activeGroupLabel: activeGroup ? `${activeGroup.typeLabel}: ${activeGroup.label}` : '',
                    isFinished: false
                };
                const arenaKey = getArenaBattleKey(arenaName, scopeId, groupKey);
                if (!arenaKey) return;

                setArenaBattleState(prev => ({
                    ...prev,
                    [arenaKey]: nextArenaState
                }));
                if (!arenaGlobalState?.[globalKey]) {
                    setArenaGlobalState((prev) => ({
                        ...prev,
                        [globalKey]: normalizedGlobal
                    }));
                    db.ref(`arenaGlobalState/${globalKey}`).set(normalizedGlobal)
                        .catch(error => console.error('No se pudo guardar arenaGlobalState inicial:', error));
                }

                db.ref(`arenaBattleState/${arenaKey}`).set(nextArenaState)
                    .catch(error => console.error('No se pudo guardar el estado del arena:', error));
            };

            const updateProfileArenaScore = async (profileId, arenaName, value) => {
                if (!profileId) return;
                try {
                    await db.ref(`perfiles/${profileId}/puntuaciones/${arenaName}`).set(value);
                } catch (error) {
                    console.error('No se pudo actualizar score del arena:', error);
                }
            };

            const registerBattleWinner = (arenaName, winnerId, scopeId = selectedBattleScope, groupKey = selectedBattleGroupKey) => {
                const arenaKey = getArenaBattleKey(arenaName, scopeId, groupKey);
                const state = arenaBattleState[arenaKey];
                if (!state || state.isFinished) return;
                const globalKey = getArenaGlobalKey(arenaName);
                const currentGlobalState = normalizeArenaGlobalState(arenaName, arenaGlobalState?.[globalKey] || {});

                const groupedIds = Array.isArray(state.groupedIds) && state.groupedIds.length
                    ? state.groupedIds
                    : buildArenaParticipants(perfiles, state.mode || 'GENERAL', state.groupKey || 'all').groupedIds;
                const { championId, challengerId } = state;
                if (winnerId !== championId && winnerId !== challengerId) return;
                const loserId = winnerId === championId ? challengerId : championId;
                if (!winnerId || !loserId) return;

                const pairKey = getPairKey(winnerId, loserId);
                const updatedDirectMatchups = {
                    ...(currentGlobalState?.directMatchups || {}),
                    [pairKey]: {
                        winnerId,
                        loserId,
                        reason: 'direct',
                        playedAt: Date.now()
                    }
                };

                const derivedState = buildArenaDerivedState(updatedDirectMatchups, getArenaOrderedProfileIds(perfiles));
                const updatedMatchups = derivedState.matchups;
                const updatedStats = derivedState.stats || {};

                const winnerGroup = getGroupForPair(groupedIds, winnerId, loserId);
                const findNextOpponentForWinner = (ids, currentWinnerId, playedMatchups) => {
                    if (!currentWinnerId) return null;

                    for (const contenderId of ids) {
                        if (!contenderId || contenderId === currentWinnerId) continue;
                        const key = getPairKey(currentWinnerId, contenderId);
                        if (!isMatchupResolved(playedMatchups, key)) {
                            return contenderId;
                        }
                    }

                    return null;
                };
                const winnerNextOpponentId = findNextOpponentForWinner(winnerGroup?.ids || [], winnerId, updatedMatchups);
                const nextPair = winnerNextOpponentId
                    ? [winnerId, winnerNextOpponentId]
                    : findNextPendingPairByGroups(groupedIds, state.matchups || {}, updatedMatchups);
                const activeGroup = getGroupForPair(groupedIds, nextPair?.[0], nextPair?.[1]);
                const nextGlobalState = {
                    arenaName: globalKey,
                    orderedIds: getArenaOrderedProfileIds(perfiles),
                    directMatchups: derivedState.directMatchups,
                    matchups: updatedMatchups,
                    victoryGraph: derivedState.victoryGraph,
                    stats: updatedStats
                };

                const nextArenaState = {
                    ...state,
                    groupedIds,
                    directMatchups: nextGlobalState.directMatchups,
                    stats: updatedStats,
                    matchups: updatedMatchups,
                    victoryGraph: derivedState.victoryGraph,
                    championId: nextPair ? nextPair[0] : null,
                    challengerId: nextPair ? nextPair[1] : null,
                    activeGroupKey: activeGroup?.key || null,
                    activeGroupLabel: activeGroup ? `${activeGroup.typeLabel}: ${activeGroup.label}` : '',
                    isFinished: !nextPair
                };
                const nextArenaBattleState = {
                    ...(arenaBattleState || {}),
                    [arenaKey]: nextArenaState
                };
                const globalScoreMap = buildArenaScoreMapFromGlobalStats(arenaName, nextArenaBattleState);

                setPerfiles(prev => prev.map(profile => {
                    if (!profile?.firebaseId || !Object.prototype.hasOwnProperty.call(globalScoreMap, profile.firebaseId)) return profile;
                    const nextScore = globalScoreMap[profile.firebaseId];
                    return {
                        ...profile,
                        puntuaciones: { ...(profile.puntuaciones || {}), [arenaName]: nextScore }
                    };
                }));

                Object.entries(globalScoreMap).forEach(([profileId, nextScore]) => {
                    updateProfileArenaScore(profileId, arenaName, nextScore);
                });

                setArenaBattleState(prev => ({
                    ...prev,
                    [arenaKey]: nextArenaState
                }));
                setArenaGlobalState(prev => ({
                    ...prev,
                    [globalKey]: nextGlobalState
                }));

                Promise.all([
                    db.ref(`arenaGlobalState/${globalKey}`).set(nextGlobalState),
                    db.ref(`arenaBattleState/${arenaKey}`).set(nextArenaState)
                ])
                    .catch(error => console.error('No se pudo guardar avance de batallas:', error));
            };

            const resetAllScores = async () => {
                const confirmed = window.confirm('Esto va a poner TODAS las calificaciones en 0. ¿Continuar?');
                if (!confirmed) return;

                try {
                    await Promise.all((perfiles || []).map(profile => {
                        if (!profile?.firebaseId) return Promise.resolve();
                        return db.ref(`perfiles/${profile.firebaseId}/puntuaciones`).set(createZeroScores());
                    }));

                    setPerfiles(prev => prev.map(profile => ({
                        ...profile,
                        puntuaciones: createZeroScores()
                    })));
                    setArenaBattleState({});
                    setArenaGlobalState({});
                    await db.ref('arenaBattleState').remove();
                    await db.ref('arenaGlobalState').remove();
                    alert('Calificaciones reiniciadas en 0 para todos los items.');
                } catch (error) {
                    console.error('No se pudieron resetear las calificaciones:', error);
                    alert('No se pudo completar el reseteo.');
                }
            };

            const resetArenaScores = async (arenaName, scopeId = selectedBattleScope, groupKey = selectedBattleGroupKey) => {
                if (!arenaName) {
                    alert('Seleccioná un item para resetear.');
                    return;
                }

                const confirmed = window.confirm(`Esto va a poner en 0 el item "${arenaName}" para todos los perfiles. ¿Continuar?`);
                if (!confirmed) return;

                try {
                    const nextArenaState = { ...(arenaBattleState || {}) };
                    const keysToDelete = Object.keys(nextArenaState).filter((key) => isArenaStateKeyForArena(key, arenaName));
                    keysToDelete.forEach((key) => delete nextArenaState[key]);

                    await Promise.all(keysToDelete.map((key) => db.ref(`arenaBattleState/${key}`).remove()));

                    setArenaBattleState(nextArenaState);

                    await Promise.all((perfiles || []).map((profile) => {
                        if (!profile?.firebaseId) return Promise.resolve();
                        return db.ref(`perfiles/${profile.firebaseId}/puntuaciones/${arenaName}`).set(0);
                    }));

                    setPerfiles((prev) => prev.map((profile) => ({
                        ...profile,
                        puntuaciones: {
                            ...(profile.puntuaciones || {}),
                            [arenaName]: 0
                        }
                    })));

                    const arenaKey = getArenaBattleKey(arenaName, scopeId, groupKey);
                    setArenaBattleState((prev) => {
                        if (!prev?.[arenaKey]) return prev;
                        const next = { ...prev };
                        delete next[arenaKey];
                        return next;
                    });
                    setArenaGlobalState((prev) => {
                        const globalKey = getArenaGlobalKey(arenaName);
                        if (!prev?.[globalKey]) return prev;
                        const next = { ...prev };
                        delete next[globalKey];
                        return next;
                    });

                    await db.ref(`arenaBattleState/${arenaKey}`).remove();
                    await db.ref(`arenaGlobalState/${getArenaGlobalKey(arenaName)}`).remove();
                    alert(`Se reseteó "${arenaName}" (${getBattleScopeLabel(scopeId)}) y se limpió su estado de batallas.`);
                } catch (error) {
                    console.error('No se pudo resetear el item:', error);
                    alert('No se pudo resetear ese item.');
                }
            };

            const resetSpecificBattle = async (arenaName, profileAId, profileBId, scopeId = selectedBattleScope, groupKey = selectedBattleGroupKey) => {
                const arenaKey = getArenaBattleKey(arenaName, scopeId, groupKey);
                const arenaState = arenaBattleState?.[arenaKey];
                const globalKey = getArenaGlobalKey(arenaName);
                const currentGlobalState = normalizeArenaGlobalState(arenaName, arenaGlobalState?.[globalKey] || {});
                if (!arenaState) {
                    alert('Esa arena no tiene estado cargado.');
                    return;
                }

                const currentMatchups = currentGlobalState?.matchups || {};
                const currentDirectMatchups = currentGlobalState?.directMatchups || {};
                const playedKeys = Object.keys(currentMatchups).filter((key) => !!currentMatchups[key]);
                if (!playedKeys.length) {
                    alert('No hay cruces jugados para resetear en esta arena.');
                    return;
                }

                const pairKey = getPairKey(profileAId, profileBId);
                if (!currentMatchups[pairKey]) {
                    alert('Ese cruce no existe o no fue jugado todavía.');
                    return;
                }
                if (!currentDirectMatchups[pairKey]) {
                    alert('Ese cruce se resolvió por transitividad. Deshacé primero la batalla directa correspondiente.');
                    return;
                }

                const confirmed = window.confirm('¿Seguro que querés deshacer esta batalla?');
                if (!confirmed) return;

                try {
                    const updatedDirectMatchups = { ...currentDirectMatchups };
                    delete updatedDirectMatchups[pairKey];

                    const rebuiltDerivedState = buildArenaDerivedState(updatedDirectMatchups, getArenaOrderedProfileIds(perfiles));
                    const nextGlobalState = {
                        arenaName: globalKey,
                        orderedIds: getArenaOrderedProfileIds(perfiles),
                        directMatchups: rebuiltDerivedState.directMatchups,
                        matchups: rebuiltDerivedState.matchups,
                        victoryGraph: rebuiltDerivedState.victoryGraph,
                        stats: rebuiltDerivedState.stats
                    };
                    const candidateState = {
                        ...arenaState,
                        directMatchups: nextGlobalState.directMatchups,
                        matchups: nextGlobalState.matchups,
                        victoryGraph: nextGlobalState.victoryGraph,
                        stats: nextGlobalState.stats
                    };
                    const normalizedState = normalizeArenaState(arenaName, candidateState, nextGlobalState);

                    if (!normalizedState) {
                        alert('No se pudo recomponer el estado del arena.');
                        return;
                    }

                    setArenaBattleState((prev) => ({
                        ...prev,
                        [arenaKey]: normalizedState
                    }));
                    setArenaGlobalState((prev) => ({
                        ...prev,
                        [globalKey]: nextGlobalState
                    }));

                    await Promise.all([
                        db.ref(`arenaGlobalState/${globalKey}`).set(nextGlobalState),
                        db.ref(`arenaBattleState/${arenaKey}`).set(normalizedState)
                    ]);

                    const nextArenaBattleState = {
                        ...(arenaBattleState || {}),
                        [arenaKey]: normalizedState
                    };
                    const globalScoreMap = buildArenaScoreMapFromGlobalStats(arenaName, nextArenaBattleState);
                    await Promise.all(Object.entries(globalScoreMap).map(async ([profileId, nextScore]) => {
                        await db.ref(`perfiles/${profileId}/puntuaciones/${arenaName}`).set(nextScore);
                    }));

                    setPerfiles((prev) => prev.map((profile) => {
                        if (!profile?.firebaseId || !Object.prototype.hasOwnProperty.call(globalScoreMap, profile.firebaseId)) return profile;
                        const nextScore = globalScoreMap[profile.firebaseId];
                        return {
                            ...profile,
                            puntuaciones: {
                                ...(profile.puntuaciones || {}),
                                [arenaName]: nextScore
                            }
                        };
                    }));

                    alert('Batalla reseteada correctamente.');
                } catch (error) {
                    console.error('No se pudo resetear la batalla:', error);
                    alert('No se pudo resetear esa batalla.');
                }
            };

            const filteredProfiles = useMemo(() => {
                const base = perfiles;

                if (activeTab === 'RANKING') {
                    return base.filter(p => {
                        const edad = calcularEdad(p.fechaNacimiento);
                        const matchNac = filters.nacionalidad === 'Todas' || p.nacionalidad === filters.nacionalidad;
                        const matchProf = filters.profesion === 'Todas' || p.profesion === filters.profesion;
                        const matchCiudad = filters.ciudad === 'Todas' || p.ciudad === filters.ciudad;

                        const matchEdad = edad >= minEdad && edad <= maxEdad;


                        let matchScore = true;
                        if (filters.scoreAttr !== 'Cualquiera') {
                            // Si elige Score Total usamos el promedio, si no, el atributo específico
                            const valPerfil = filters.scoreAttr === 'promedio'
                                ? parseFloat(calcularPromedio(p))
                                : getProfileScores(p)[filters.scoreAttr] || 0;

                            if (filters.scoreVal !== '') {
                                const valFiltro = parseInt(filters.scoreVal);
                                if (filters.scoreOp === 'Superior a') matchScore = valPerfil >= valFiltro;
                                else if (filters.scoreOp === 'Inferior a') matchScore = valPerfil <= valFiltro;
                                else if (filters.scoreOp === 'Igual a') matchScore = valPerfil === valFiltro;
                            }
                        }

                        return matchNac && matchProf && matchEdad && matchCiudad && matchScore;
                    }).sort((a, b) => parseFloat(calcularPromedio(b)) - parseFloat(calcularPromedio(a)));
                }

                if (activeTab === 'CATEGORIAS' && selectedCategory) {
                    return base.filter(p => obtenerCategoriasDePerfil(p).includes(selectedCategory));
                }

                return base;
            }, [perfiles, activeTab, selectedCategory, filters]);
            const battleScopeOptions = useMemo(() => {
                if (!selectedBattleScope) return [];
                return getBattleScopeOptions(perfiles, selectedBattleScope);
            }, [perfiles, selectedBattleScope]);
            const requiresBattleGroupSelection = selectedBattleScope && selectedBattleScope !== 'GENERAL';
            const getSortValue = (profile, key) => {
                if (key === 'promedio') return Number(calcularPromedio(profile)) || 0;
                if (key === 'nombre') return (profile.nombre || '').toLowerCase();
                if (key === 'nacionalidad') return (profile.nacionalidad || '').toLowerCase();
                if (key === 'edad') {
                    const edad = calcularEdad(profile.fechaNacimiento);
                    return typeof edad === 'number' ? edad : -1;
                }
                if (key === 'Rostro') {
                    return getRostroScore(profile) || 0;
                }
                if (key === 'Cuerpo') {
                    return getCuerpoScore(profile) || 0;
                }
                if (key === 'Actitud') {
                    return getActitudScore(profile) || 0;
                }
                return Number(profile.puntuaciones?.[key] || 0);
            };

            const toggleSort = (key, defaultDirection = 'asc') => {
                if (sortBy === key) {
                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                    return;
                }
                setSortBy(key);
                setSortDirection(defaultDirection);
            };

            const SCORE_GROUP_TO_ARENAS = {
                Rostro: ['Rostro', 'Ojos', 'Boca', 'Cabello'],
                Cuerpo: ['Cuerpo', 'Cola', 'Pechos', 'Cintura', 'Piernas', 'Estatura'],
                Actitud: ['Sensualidad', 'Carisma', 'Elegancia', 'Dulzura', 'Talento']
            };

            const getScoreBreakdownByCategory = (profileId, categoryKey) => {
                const arenaNames = SCORE_GROUP_TO_ARENAS[categoryKey] || [];
                const winIds = new Set();
                const lossIds = new Set();
                const arenaEntries = Object.entries(arenaBattleState || {});

                arenaNames.forEach((arenaName) => {
                    const arenaMatchups = arenaGlobalState?.[getArenaGlobalKey(arenaName)]?.matchups || {};
                    Object.values(arenaMatchups).forEach((match) => {
                        if (!match || typeof match !== 'object') return;
                        if (match.winnerId === profileId && match.loserId) {
                            winIds.add(match.loserId);
                        }
                        if (match.loserId === profileId && match.winnerId) {
                            lossIds.add(match.winnerId);
                        }
                    });
                });

                const profileNameById = new Map(
                    (perfiles || [])
                        .filter((profile) => profile?.firebaseId)
                        .map((profile) => [profile.firebaseId, profile.nombre || 'Sin nombre'])
                );

                const getSortedNames = (idsSet) => (
                    [...idsSet]
                        .map((id) => profileNameById.get(id))
                        .filter(Boolean)
                        .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
                );

                return {
                    wins: getSortedNames(winIds),
                    losses: getSortedNames(lossIds)
                };
            };

            const sortedProfiles = [...filteredProfiles].sort((a, b) => {
                const aValue = getSortValue(a, sortBy);
                const bValue = getSortValue(b, sortBy);

                let result = 0;
                if (typeof aValue === 'string' || typeof bValue === 'string') {
                    result = String(aValue).localeCompare(String(bValue), 'es', { sensitivity: 'base' });
                } else {
                    result = aValue - bValue;
                }

                if (result === 0) {
                    return (a.nombre || '').localeCompare((b.nombre || ''), 'es', { sensitivity: 'base' });
                }

                return sortDirection === 'asc' ? result : -result;
            });
            const filteredCharacterProfiles = useMemo(() => {
                const normalizedSearchTerm = normalizeSearchValue(characterSearchTerm);
                return (perfiles || []).filter((profile) => {
                    const normalizedName = normalizeSearchValue(profile?.nombre || '');
                    if (!normalizedSearchTerm) return Boolean(normalizedName);
                    return normalizedName.includes(normalizedSearchTerm);
                });
            }, [perfiles, characterSearchTerm]);
            const selectedCharacterProfile = useMemo(() => (
                (perfiles || []).find((profile) => profile?.firebaseId === selectedCharacterId) || null
            ), [perfiles, selectedCharacterId]);
            const selectedCharacterRankingPosition = useMemo(() => {
                if (!selectedCharacterProfile?.firebaseId) return null;
                const rankingIndex = sortedProfiles.findIndex((profile) => profile?.firebaseId === selectedCharacterProfile.firebaseId);
                return rankingIndex >= 0 ? rankingIndex + 1 : null;
            }, [sortedProfiles, selectedCharacterProfile]);

            useEffect(() => {
                if (!filteredCharacterProfiles.length) {
                    if (selectedCharacterId !== null) setSelectedCharacterId(null);
                    return;
                }
                if (!selectedCharacterId || !filteredCharacterProfiles.some((profile) => profile?.firebaseId === selectedCharacterId)) {
                    setSelectedCharacterId(filteredCharacterProfiles[0].firebaseId);
                }
            }, [filteredCharacterProfiles, selectedCharacterId]);
            return (
                <div className="app-space-theme flex h-screen overflow-hidden bg-[#020617] stone-wall-surface relative">
                    {isSidebarOpen && (
                    <aside className="hud-frame hud-frame--panel w-72 theme-surface-card stone-wall-surface border-r theme-border-secondary flex flex-col p-8 z-20 shadow-xl overflow-y-auto relative">
                        <div className="corner-ember-glow corner-ember-glow--left corner-ember-glow--top" aria-hidden="true"></div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-4 right-4 btn-metal btn-metal--silver rounded-full p-2 text-slate-900"
                            aria-label="Replegar menú lateral"
                            title="Replegar menú lateral"
                        >
                            <LucideIcon name="panel-left-close" size={16} />
                        </button>
                        <div className="mb-12 text-center flex-shrink-0">
                            <h1 className="neon-sign neon-sign--cyan text-5xl font-black text-[var(--metal-gold)] italic tracking-tighter leading-none">G2</h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">Elite Database</p>
                        </div>
                        <nav className="flex-1 space-y-2 mb-8">
                            {[
                                { id: 'EXPLORAR', icon: 'layout-grid', label: 'Explorar' },
                                { id: 'PERSONAJE', icon: 'user-round-search', label: 'Personaje' },
                                { id: 'RANKING', icon: 'trending-up', label: 'Ranking' },
                                { id: 'BATALLAS', icon: 'swords', label: 'Batallas' },
                                { id: 'CATEGORIAS', icon: 'folder-heart', label: 'Categorías' },
                                { id: 'GALERIA', icon: 'images', label: 'Galería' },
                                { id: 'ESCENAS_FOTOS', icon: 'gallery-horizontal', label: 'Escenas/Fotos' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setSelectedCategory(null);
                                        setSelectedGalleryBucket(null);
                                        setSelectedGalleryIndex(null);
                                        setSelectedCharacterBucketIds([]);
                                        setSelectedTagLabels([]);
                                        setGalleryFilterLabel('INICIAL');
                                    }}
                                    className={`btn-metal sidebar-nav-btn w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] text-sm transition-all ${activeTab === item.id ? 'is-active text-[#ecfeff]' : 'text-slate-900'}`}
                                >
                                    <LucideIcon name={item.icon} size={18} />
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {activeTab === 'RANKING' && (
                            <div className="hud-frame hud-frame--panel space-y-6 mb-8 p-6 theme-surface-soft rounded-2xl gothic-frame gothic-frame--secondary animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h4 className="text-[10px] font-black text-[var(--metal-gold)] uppercase tracking-widest flex items-center gap-2">
                                    <LucideIcon name="filter" size={12} /> Filtros de Ranking
                                </h4>

                                <div className="space-y-3">
                                    <select className="w-full theme-surface-card border theme-border-secondary p-3 rounded-2xl text-[11px] font-bold outline-none text-slate-300 filter-select" value={filters.nacionalidad} onChange={e => setFilters({...filters, nacionalidad: e.target.value})}>
                                        <option value="Todas">Nacionalidad: Todas</option>
                                        {uniqueNacionalidades.filter(n => n !== 'Todas').map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>

                                    <select className="w-full theme-surface-card border theme-border-secondary p-3 rounded-2xl text-[11px] font-bold outline-none text-slate-300 filter-select" value={filters.profesion} onChange={e => setFilters({...filters, profesion: e.target.value})}>
                                        <option value="Todas">Profesión: Todas</option>
                                        {uniqueProfesiones.filter(p => p !== 'Todas').map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>

                                    <select className="w-full theme-surface-card border theme-border-secondary p-3 rounded-2xl text-[11px] font-bold outline-none text-slate-300 filter-select" value={filters.ciudad} onChange={e => setFilters({...filters, ciudad: e.target.value})}>
                                        <option value="Todas">Ciudad: Todas</option>
                                        {uniqueCiudades.filter(c => c !== 'Todas').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>

                                    <select className="w-full theme-surface-card border theme-border-secondary p-3 rounded-2xl text-[11px] font-bold outline-none text-slate-300 filter-select" value={filters.edad} onChange={e => setFilters({...filters, edad: e.target.value})}>
                                        <option value="Todas">Edad: Todas</option>
                                        <option value="Menores de 30">Menores de 30</option>
                                        <option value="Mayores de 30">Mayores de 30</option>
                                    </select>

                                    <div className="pt-2 border-t theme-border-secondary mt-4">
                                        <p className="text-[9px] font-black text-slate-500 mb-2 uppercase tracking-tighter">Filtro por Atributo</p>
                                        <select className="w-full theme-surface-card border theme-border-secondary p-3 rounded-2xl text-[11px] font-bold outline-none text-slate-300 mb-2" value={filters.scoreAttr} onChange={e => setFilters({...filters, scoreAttr: e.target.value})}>
                                            <option>Cualquiera</option>
                                            {CARACTERISTICAS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        {filters.scoreAttr !== 'Cualquiera' && (
                                            <div className="flex gap-2">
                                                <select className="flex-1 theme-surface-card border theme-border-secondary p-2 rounded-xl text-[10px] font-bold outline-none text-slate-300" value={filters.scoreOp} onChange={e => setFilters({...filters, scoreOp: e.target.value})}>
                                                    <option>Superior a</option>
                                                    <option>Inferior a</option>
                                                    <option>Igual a</option>
                                                </select>
                                                <input type="number" placeholder="0-10" className="w-16 theme-surface-card border theme-border-secondary p-2 rounded-xl text-[10px] font-bold outline-none text-[var(--metal-gold)]" value={filters.scoreVal} onChange={e => setFilters({...filters, scoreVal: e.target.value})} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setFilters({nacionalidad:'Todas', profesion:'Todas', edad:'Todas', ciudad:'Todas', scoreAttr:'Cualquiera', scoreOp:'Superior a', scoreVal:''})} className="w-full text-[9px] font-black text-slate-600 hover:text-[var(--metal-gold)] uppercase tracking-tighter transition-colors">Limpiar Filtros</button>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData(getEmptyProfileFormData());
                                setIsModalOpen(true);
                            }}
                            className="btn-metal btn-metal--gold py-5 rounded-[2.2rem] text-[11px] flex items-center justify-center gap-2 flex-shrink-0"
                        >
                            <LucideIcon name="plus" size={16} /> Nuevo Perfil
                        </button>
                    </aside>
                    )}

                    <main className="flex-1 flex flex-col overflow-hidden bg-[#020617] stone-wall-surface relative">
                        <header className="hud-frame hud-frame--header h-24 panel-frosted stone-wall-surface border-b theme-border-secondary flex items-center px-12 justify-between z-10 flex-shrink-0 relative">
                            <div className="corner-ember-glow corner-ember-glow--left corner-ember-glow--top" aria-hidden="true"></div>
                            <div className="corner-ember-glow corner-ember-glow--right corner-ember-glow--top" aria-hidden="true"></div>
                            <div className="flex items-center gap-4 w-full max-w-xl">
                                <button
                                    onClick={() => setIsSidebarOpen(prev => !prev)}
                                    className="btn-metal btn-metal--silver rounded-full p-3 text-slate-900 flex-shrink-0"
                                    aria-label={isSidebarOpen ? 'Replegar menú lateral' : 'Desplegar menú lateral'}
                                    title={isSidebarOpen ? 'Replegar menú lateral' : 'Desplegar menú lateral'}
                                >
                                    <LucideIcon name={isSidebarOpen ? 'panel-left-close' : 'panel-left-open'} size={18} />
                                </button>
                            </div>
                        </header>

                        <div className="hud-section flex-1 overflow-y-auto p-12 relative z-10 stone-wall-surface">
                            <div className="corner-ember-glow corner-ember-glow--left corner-ember-glow--top" aria-hidden="true"></div>
                            <div className="corner-ember-glow corner-ember-glow--right corner-ember-glow--top" aria-hidden="true"></div>

   {/* 1. VISTA EXPLORAR (CARPETAS POR PROFESIÓN) */}
                    {activeTab === 'EXPLORAR' && !selectedCategory && (
                        <div className="space-y-10 animate-in fade-in duration-500">
                            <div>
                                <h2 className="neon-sign neon-sign--cyan text-4xl font-black italic text-white uppercase tracking-tighter">Explorar</h2>
                                <p className="text-xs font-bold text-[var(--metal-gold)] uppercase tracking-widest mt-1">Organización automática por profesión</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {[...new Set(
                                    (perfiles || [])
                                        .map(p => String(p?.profesion || '').trim())
                                        .filter(Boolean)
                                )].map(prof => {
                                    const count = (perfiles || []).filter(p => String(p?.profesion || '').trim() === prof).length;
                                    const visualStyle = getProfessionCardVisual(prof);

                                    return (
                                        <div
                                            key={prof}
                                            onClick={() => setSelectedCategory(prof)}
                                            className="profession-folder-card rounded-2xl p-8 text-center cursor-pointer transition-all group relative overflow-hidden active:scale-95"
                                            style={{
                                                '--folder-color': visualStyle.baseColor,
                                                '--folder-glow': visualStyle.glowColor
                                            }}
                                        >
                                            <div className="profession-folder-card__icon w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-6">
                                                {getEmoji(prof)}
                                            </div>
                                            <h3 className="text-2xl font-black text-white mb-2 truncate uppercase tracking-tighter italic">{prof}</h3>
                                            <div
                                                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border"
                                                style={{
                                                    borderColor: 'color-mix(in srgb, var(--folder-color) 65%, rgba(2,6,23,0.8) 35%)',
                                                    background: 'color-mix(in srgb, var(--folder-color) 14%, rgba(2,6,23,0.68) 86%)',
                                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16), 0 0 14px color-mix(in srgb, var(--folder-glow) 35%, transparent)'
                                                }}
                                            >
                                                <span className="text-[10px] font-black uppercase text-[var(--metal-gold)] tracking-widest">{count} {count === 1 ? 'Perfil' : 'Perfiles'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'PERSONAJE' && !selectedCategory && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div>
                                <h2 className="neon-sign neon-sign--cyan text-4xl font-black italic text-white uppercase tracking-tighter">Personaje</h2>
                                <p className="text-xs font-bold text-[var(--metal-gold)] uppercase tracking-widest mt-1">
                                    Buscador y ficha rápida de cada perfil
                                </p>
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-8">
                                <section className="theme-surface-card gothic-frame gothic-frame--secondary rounded-2xl p-5 space-y-4 h-fit">
                                    <label htmlFor="characterSearchInput" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Buscar personaje</label>
                                    <div className="relative">
                                        <LucideIcon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            id="characterSearchInput"
                                            type="text"
                                            value={characterSearchTerm}
                                            onChange={(event) => setCharacterSearchTerm(event.target.value)}
                                            placeholder="Nombre del personaje..."
                                            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-400"
                                        />
                                    </div>
                                    <div className="max-h-[520px] overflow-y-auto space-y-2 pr-1">
                                        {filteredCharacterProfiles.length ? filteredCharacterProfiles.map((profile) => {
                                            const isActive = selectedCharacterId === profile.firebaseId;
                                            return (
                                                <button
                                                    key={profile.firebaseId}
                                                    type="button"
                                                    onClick={() => setSelectedCharacterId(profile.firebaseId)}
                                                    className={`w-full text-left rounded-xl border px-3 py-3 transition-all ${isActive ? 'border-cyan-300 bg-cyan-500/12 shadow-[0_0_14px_rgba(34,211,238,0.2)]' : 'border-slate-700 bg-slate-900/55 hover:border-slate-500'}`}
                                                >
                                                    <p className="font-bold text-sm text-slate-100 truncate">{profile.nombre || 'Sin nombre'}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--metal-gold)] mt-1">{profile.profesion || 'Sin profesión'}</p>
                                                </button>
                                            );
                                        }) : (
                                            <p className="text-xs text-slate-400 py-3">No hay resultados para esa búsqueda.</p>
                                        )}
                                    </div>
                                </section>

                                <section className="theme-surface-card gothic-frame gothic-frame--ornate rounded-2xl p-6 md:p-8">
                                    {selectedCharacterProfile ? (
                                        <div className="space-y-7">
                                            <div className="flex flex-col lg:flex-row gap-6">
                                                <img
                                                    src={getSafeImageSrc(selectedCharacterProfile.fotos?.[0], 'https://via.placeholder.com/400x500')}
                                                    alt={selectedCharacterProfile.nombre || 'Perfil'}
                                                    className="w-full lg:w-72 h-80 rounded-2xl object-cover border border-slate-700/70 bg-slate-950/70"
                                                    onError={applyCryingEmojiFallback}
                                                />
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <h3 className="text-3xl font-black italic text-white tracking-tight">{selectedCharacterProfile.nombre || 'Sin nombre'}</h3>
                                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--metal-gold)] mt-1">{selectedCharacterProfile.profesion || 'Sin profesión'}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        <div className="theme-surface-soft rounded-xl border theme-border-secondary px-3 py-2">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Ranking</p>
                                                            <p className="text-lg font-black text-white">{selectedCharacterRankingPosition ? `#${selectedCharacterRankingPosition}` : '—'}</p>
                                                        </div>
                                                        <div className="theme-surface-soft rounded-xl border theme-border-secondary px-3 py-2">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Edad</p>
                                                            <p className="text-lg font-black text-white">{calcularEdad(selectedCharacterProfile.fechaNacimiento) || '—'}</p>
                                                        </div>
                                                        <div className="theme-surface-soft rounded-xl border theme-border-secondary px-3 py-2">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Altura</p>
                                                            <p className="text-lg font-black text-white">{getProfileHeightLabel(selectedCharacterProfile) || '—'}</p>
                                                        </div>
                                                        <div className="theme-surface-soft rounded-xl border theme-border-secondary px-3 py-2">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">G2 Score</p>
                                                            <p className="text-lg font-black text-[var(--metal-gold)]">{calcularPromedio(selectedCharacterProfile)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                        <div className="rounded-xl border border-slate-700 bg-slate-950/55 px-3 py-3">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rostro</p>
                                                            <p className="text-xl font-black text-white">{getRostroScore(selectedCharacterProfile).toFixed(0)}</p>
                                                        </div>
                                                        <div className="rounded-xl border border-slate-700 bg-slate-950/55 px-3 py-3">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cuerpo</p>
                                                            <p className="text-xl font-black text-white">{getCuerpoScore(selectedCharacterProfile).toFixed(0)}</p>
                                                        </div>
                                                        <div className="rounded-xl border border-slate-700 bg-slate-950/55 px-3 py-3">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Actitud</p>
                                                            <p className="text-xl font-black text-white">{getActitudScore(selectedCharacterProfile).toFixed(0)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => openProfileEditor(selectedCharacterProfile)}
                                                        className="btn-metal btn-metal--gold px-5 py-3 rounded-2xl text-xs inline-flex items-center gap-2"
                                                    >
                                                        <LucideIcon name="square-pen" size={14} /> Editar personaje
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {(() => {
                                                    const matchups = getMatchupNamesForProfile(selectedCharacterProfile.firebaseId);
                                                    return (
                                                        <>
                                                            <div className="theme-surface-soft rounded-2xl border theme-border-secondary p-4">
                                                                <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">A quién le ganó</h4>
                                                                <p className="text-xs text-slate-400 mt-2">
                                                                    {matchups.wins.length ? matchups.wins.join(' · ') : 'Sin victorias registradas.'}
                                                                </p>
                                                            </div>
                                                            <div className="theme-surface-soft rounded-2xl border theme-border-secondary p-4">
                                                                <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-300">Contra quién perdió</h4>
                                                                <p className="text-xs text-slate-400 mt-2">
                                                                    {matchups.losses.length ? matchups.losses.join(' · ') : 'Sin derrotas registradas.'}
                                                                </p>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center">
                                            <p className="text-sm text-slate-300">No hay personaje seleccionado.</p>
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>
                    )}

    {/* 2. VISTA DE PERFILES (CUANDO ENTRAS A UNA CARPETA) */}
    {selectedCategory && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div
                className="hud-frame hud-frame--panel profession-banner flex items-center justify-between p-6 rounded-2xl gothic-frame gothic-frame--ornate gothic-frame--grand"
                style={{
                    '--banner-color': (activeTab === 'CATEGORIAS'
                        ? 'rgba(148, 163, 184, 0.8)'
                        : getProfessionCardVisual(selectedCategory).baseColor)
                }}
            >
                <button
                    onClick={() => setSelectedCategory(null)}
                    className="group flex items-center gap-3 text-[var(--metal-gold)] font-black text-xs uppercase tracking-widest"
                >
                    <div className="back-btn-silver p-2 rounded-xl group-hover:text-white transition-all">
                        <i data-lucide="arrow-left" className="w-4 h-4"></i>
                    </div>
                    Volver
                </button>
                <h2 className="neon-sign neon-sign--magenta font-title text-6xl font-black italic text-white tracking-[0.08em] leading-none">
    {/* Si estamos en la pestaña de categorías, buscamos el nombre lindo. Si no, mostramos la profesión directamente */}
    {activeTab === 'CATEGORIAS'
        ? (categorias.find(c => c.firebaseId === selectedCategory)?.label || "Archivo del Reino")
        : selectedCategory
    }
</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
    {(perfiles || []).filter(p => {
        if (!p) return false;
        // Si estamos en la pestaña de Categorías Inteligentes:
        if (activeTab === 'CATEGORIAS') {
            const misCategorias = obtenerCategoriasDePerfil(p);
            return misCategorias.includes(selectedCategory);
        }
        // Si estamos en Explorar (por profesión):
        return String(p.profesion || '').trim().toLowerCase() === String(selectedCategory).trim().toLowerCase();
    }).map(p => {
                    const profKey = p.profesion?.toUpperCase() || 'DEFAULT';
                    const neonClass = (typeof neonColors !== 'undefined' && neonColors[profKey]) ? neonColors[profKey] : { color: '#06b6d4', sombra: 'rgba(6,182,212,0.5)' };
                    return (
                        <div
                            key={p.firebaseId || Math.random()}
                            onClick={() => {
                                setContextMenuProfileId(null);
                                openProfileEditor(p);
                            }}
                            onContextMenu={(event) => handleContextMenuOpen(event, p)}
                            className="profile-card group relative rounded-2xl overflow-hidden cursor-pointer"
                            style={{
                                '--card-neon-color': neonClass.color,
                                '--card-neon-glow': neonClass.sombra
                            }}
                        >
                            <div className="aspect-[4/5] bg-slate-950 relative overflow-hidden">
                                <img
                                    src={getSafeImageSrc((p.fotos && p.fotos.length > 0) ? p.fotos[0] : '', 'https://via.placeholder.com/400x500')}
                                    className="w-full h-full object-cover transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                    onError={applyCryingEmojiFallback}
                                />

                                <div className="absolute top-3 left-3 z-20">
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setProfileActionError('');
                                            setContextProfile(p);
                                            setContextMenuProfileId((prev) => prev === p.firebaseId ? null : p.firebaseId);
                                        }}
                                        className="card-menu-btn rounded-full bg-slate-900/88 backdrop-blur-md border border-white/10 text-slate-200 hover:text-white hover:border-[var(--metal-gold)] transition-all flex items-center justify-center"
                                        aria-label="Abrir menú contextual del perfil"
                                    >
                                        <LucideIcon name="more-vertical" size={12} />
                                    </button>

                                    {contextMenuProfileId === p.firebaseId && (
                                        <div className="absolute top-12 left-0 min-w-[170px] rounded-xl border theme-border-secondary bg-slate-950/95 shadow-2xl p-2 space-y-1" onClick={(event) => event.stopPropagation()}>
                                            <button
                                                type="button"
                                                className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.12em] text-slate-200 hover:bg-slate-800 transition-all"
                                                onClick={() => {
                                                    setContextMenuProfileId(null);
                                                    openProfileEditor(p);
                                                }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.12em] text-red-300 hover:bg-red-500/20 transition-all"
                                                onClick={() => {
                                                    requestDeleteProfile(p);
                                                    setContextMenuProfileId(null);
                                                }}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="card-score-badge absolute top-2 right-2 w-14 h-14 backdrop-blur-md rounded-full flex flex-col items-center justify-center border">
                                    <span className="text-[9px] font-black text-[var(--metal-gold)] leading-none">G2</span>
                                    <span className="text-lg font-black text-white">
                                        {typeof calcularPromedio === 'function' ? calcularPromedio(p) : '8.5'}
                                    </span>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="text-bubble card-footer-profession w-full backdrop-blur-md p-4 rounded-2xl border">
                                        <h3 className="text-lg font-black text-white italic tracking-tighter leading-none flex items-center gap-2">
                                            {p.nombre}
                                            <span className="text-[var(--metal-gold)] text-sm not-italic">
                                                ({typeof calcularEdad === 'function' ? calcularEdad(p.fechaNacimiento) : '??'})
                                            </span>
                                        </h3>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-[var(--metal-gold)] text-[7px] font-black uppercase tracking-widest">{p.profesion}</span>
                                            <p className="text-[7px] font-bold text-slate-400 uppercase">{p.nacionalidad}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {contextMenuOpen && contextProfile && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-[120] min-w-[11rem] rounded-xl border border-cyan-400/40 bg-slate-950/95 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.55)] p-2"
                    style={{
                        top: `${contextMenuPosition.y}px`,
                        left: `${contextMenuPosition.x}px`
                    }}
                >
                    <button
                        type="button"
                        onClick={handleContextEdit}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/20 transition-colors"
                    >
                        Editar
                    </button>
                    <button
                        type="button"
                        onClick={handleContextDelete}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-rose-300 hover:bg-rose-500/20 transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            )}
        </div>
    )}

    {/* 3. VISTA GALERÍA GLOBAL */}
    {activeTab === 'GALERIA' && !selectedCategory && (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
                <div>
                    <h2 className="neon-sign neon-sign--magenta text-4xl font-black italic text-white uppercase tracking-tighter">Galería</h2>
                    <p className="text-xs font-bold text-[var(--metal-gold)] uppercase tracking-widest mt-1">
                        {`Vista por ${currentGalleryModeLabel} · ${galleryContextLabel}`}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {GALLERY_VIEW_MODES.map((mode) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => setGalleryViewMode(mode)}
                            className={`btn-metal px-4 py-2 rounded-full text-[10px] tracking-[0.08em] transition-all ${galleryViewMode === mode ? 'btn-metal--gold text-[#fffaf0]' : 'btn-metal--silver text-slate-900'}`}
                        >
                            {GALLERY_VIEW_MODE_LABELS[mode]}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setIsBrokenGalleryModalOpen(true)}
                        className="btn-metal btn-metal--danger px-4 py-2 rounded-full text-[10px] tracking-[0.08em] inline-flex items-center gap-2"
                        title="Ver y corregir fotos rotas"
                    >
                        <span className="text-sm leading-none">💔</span>
                        Rotas ({isCheckingBrokenGallery ? '...' : brokenGalleryPhotos.length})
                    </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="theme-surface-soft gothic-frame gothic-frame--secondary rounded-[1.8rem] px-5 py-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Total</p>
                        <p className="text-2xl font-black italic text-white mt-1">{sourceGalleryPhotos.length}</p>
                    </div>
                    <div className="theme-surface-soft gothic-frame gothic-frame--secondary rounded-[1.8rem] px-5 py-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Visibles</p>
                        <p className="text-2xl font-black italic text-[var(--metal-gold)] mt-1">{filteredGalleryPhotos.length}</p>
                    </div>
                    <div className="theme-surface-soft gothic-frame gothic-frame--secondary rounded-[1.8rem] px-5 py-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Etiquetas</p>
                        <p className="text-2xl font-black italic text-white mt-1">{GALLERY_LABELS.length}</p>
                    </div>
                    <div className="theme-surface-soft gothic-frame gothic-frame--secondary rounded-[1.8rem] px-5 py-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Perfiles</p>
                        <p className="text-2xl font-black italic text-white mt-1">{new Set(allGalleryPhotos.map(photo => photo.profileId)).size}</p>
                    </div>
                </div>
            </div>

            {galleryViewMode !== 'PERSONAJE' && isGalleryBucketMode && !activeGalleryBucket ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {galleryBuckets.map(bucket => (
                        <button
                            key={bucket.id}
                            type="button"
                            onClick={() => {
                                setSelectedGalleryBucket(bucket);
                                setSelectedGalleryIndex(null);
                            }}
                            className="group text-left theme-surface-card border theme-border-secondary rounded-[2.4rem] overflow-hidden hover:border-[color:color-mix(in_srgb,var(--metal-gold)_40%,transparent)] hover:shadow-[0_0_30px_rgba(34,211,238,0.12)] transition-all duration-500"
                        >
                            <div className="aspect-[4/5] bg-slate-950 relative overflow-hidden">
                                {bucket.fotoPerfil ? (
                                    <img
                                        src={getSafeImageSrc(bucket.fotoPerfil, 'https://via.placeholder.com/400x500')}
                                        alt={`Portada ${bucket.nombre}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                        onError={applyCryingEmojiFallback}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                        <LucideIcon name="image-off" size={34} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-5">
                                    <p className="text-xl font-black italic text-white tracking-tighter leading-none">{bucket.nombre}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--metal-gold)] mt-2">{bucket.profesion || 'Perfil'}</p>
                                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border theme-border-secondary bg-slate-950/85 text-[9px] font-black uppercase tracking-[0.2em] text-slate-200">
                                        {bucket.photos.length} archivos
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <>
                    {galleryViewMode !== 'PERSONAJE' && isGalleryBucketMode && (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedGalleryBucket(null);
                                    setSelectedGalleryIndex(null);
                                }}
                                className="btn-metal btn-metal--silver inline-flex items-center gap-2 px-5 py-3 rounded-full text-[10px] text-slate-900"
                            >
                                <LucideIcon name="arrow-left" size={14} />
                                Volver al índice
                            </button>
                        </div>
                    )}

                    {galleryViewMode === 'PERSONAJE' && (
                        <div className="space-y-4">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                <label htmlFor="galleryCharacterSelector" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Selector de personajes</label>
                                <select
                                    id="galleryCharacterSelector"
                                    className="filter-select max-w-lg"
                                    value=""
                                    onChange={(event) => addCharacterToGallerySelection(event.target.value)}
                                >
                                    <option value="" disabled>{availableCharacterBuckets.length ? 'Seleccionar personaje…' : 'No hay más personajes disponibles'}</option>
                                    {availableCharacterBuckets.map((bucket) => (
                                        <option key={bucket.id} value={bucket.id}>
                                            {bucket.nombre} · {bucket.photos.length} archivos
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedCharacterBuckets.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedCharacterBuckets.map((bucket) => (
                                        <button
                                            key={bucket.id}
                                            type="button"
                                            onClick={() => removeCharacterFromGallerySelection(bucket.id)}
                                            className="btn-metal btn-metal--silver inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] text-slate-900"
                                            title="Quitar personaje de la galería visible"
                                        >
                                            {bucket.nombre}
                                            <LucideIcon name="x" size={12} />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400">Seleccioná uno o más personajes para mostrar su multimedia en la galería.</p>
                            )}
                        </div>
                    )}

                    {galleryViewMode === 'ETIQUETA' && (
                        <div className="hud-frame hud-frame--panel flex flex-wrap gap-3 rounded-2xl p-4">
                            {GALLERY_LABELS.map(label => (
                                <button
                                    key={label}
                                    onClick={() => toggleEtiquetaSelection(label)}
                                    className="btn-neon font-title px-4 py-2 rounded-full text-[10px] tracking-[0.08em] transition-all"
                                    style={getGalleryFilterButtonStyle(label, selectedTagLabels.includes(label))}
                                >
                                    {label} · {allGalleryPhotos.filter(photo => photo.label === label).length}
                                </button>
                            ))}
                        </div>
                    )}

                    {galleryViewMode === 'PERSONAJE' && (
                        <div className="hud-frame hud-frame--panel flex flex-wrap gap-3 rounded-2xl p-4">
                            <button
                                onClick={() => setGalleryFilterLabel('INICIAL')}
                                className="btn-neon px-4 py-2 rounded-full text-[10px] transition-all"
                                style={getGalleryFilterButtonStyle('INICIAL', galleryFilterLabel === 'INICIAL')}
                            >
                                Inicial
                            </button>
                            {GALLERY_LABELS.map(label => {
                                const isActive = galleryFilterLabel === label;
                                return (
                                    <button
                                        key={label}
                                        onClick={() => setGalleryFilterLabel(label)}
                                        className="btn-neon font-title px-4 py-2 rounded-full text-[10px] tracking-[0.08em] transition-all"
                                        style={getGalleryFilterButtonStyle(label, isActive)}
                                    >
                                        {label} · {galleryStats[label] || 0}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setGalleryFilterLabel('100')}
                                className="btn-neon px-4 py-2 rounded-full text-[10px] transition-all"
                                style={getGalleryFilterButtonStyle('100', galleryFilterLabel === '100')}
                            >
                                100%
                            </button>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => openGalleryViewer(0, true)}
                            disabled={!filteredGalleryPhotos.length}
                            className="btn-metal btn-metal--gold inline-flex items-center gap-2 px-5 py-3 rounded-full text-[10px] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <LucideIcon name="play" size={14} />
                            Play {activeGalleryBucket?.nombre || currentGalleryModeLabel}
                        </button>
                        <div className="inline-flex items-center gap-2 rounded-full border theme-border-secondary bg-slate-950/80 px-3 py-2">
                            <label htmlFor="galleryPlaybackSeconds" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-300">
                                Duración
                            </label>
                            <select
                                id="galleryPlaybackSeconds"
                                className="filter-select"
                                value={galleryPlaybackSeconds}
                                onChange={(event) => setGalleryPlaybackSeconds(Number(event.target.value))}
                            >
                                {[3, 5, 7, 10].map((seconds) => (
                                    <option key={seconds} value={seconds}>{seconds} segundos</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {filteredGalleryPhotos.length === 0 ? (
                        <div className="py-24 border border-dashed theme-border-secondary rounded-2xl text-center bg-slate-950/30">
                            <div className="w-20 h-20 rounded-full bg-slate-900 border theme-border-secondary flex items-center justify-center mx-auto mb-6">
                                <LucideIcon name="image-off" size={28} className="text-slate-600" />
                            </div>
                            <h3 className="font-title text-xl font-black italic text-white tracking-[0.06em]">No hay archivos para mostrar</h3>
                            <p className="font-title text-xs font-medium text-slate-500 tracking-[0.06em] mt-3">
                                {galleryViewMode === 'ETIQUETA' && selectedTagLabels.length === 0
                                    ? 'Seleccioná una o más etiquetas para ver multimedia.'
                                    : 'Probá con otra etiqueta o quitá el filtro por etiqueta.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                            {filteredGalleryPhotos.map((photo, index) => {
                                const labelStyle = getGalleryLabelStyle(photo.label);

                                return (
                                    <button
                                        key={photo.id}
                                        type="button"
                                        onClick={() => openGalleryViewer(index)}
                                        className="group text-left theme-surface-card border theme-border-secondary rounded-[2.4rem] overflow-hidden hover:border-[color:color-mix(in_srgb,var(--metal-gold)_40%,transparent)] hover:shadow-[0_0_30px_rgba(34,211,238,0.12)] transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-[var(--glow-gold)] focus:ring-offset-2 focus:ring-offset-[#020617]"
                                    >
                                        <div className="aspect-[4/5] relative overflow-hidden bg-slate-950">
                                            {photo.type === 'video' ? (() => {
                                                const embedInfo = getVideoEmbedInfo(photo.url);
                                                if (embedInfo) {
                                                    return (
                                                        <div className="w-full h-full bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.3),_rgba(15,23,42,0.95))] flex flex-col items-center justify-center gap-4 p-6 text-center">
                                                            <div className="w-16 h-16 rounded-full border border-[var(--metal-gold)]/40 bg-slate-950/70 flex items-center justify-center text-[color:color-mix(in_srgb,var(--metal-gold)_72%,white)] text-2xl">▶</div>
                                                            <div>
                                                                <p className="font-title text-sm font-semibold tracking-[0.1em] text-white">Video</p>
                                                                <p className="font-title text-[10px] font-medium tracking-[0.08em] text-slate-400 mt-2">{embedInfo.provider}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return <video src={photo.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" muted playsInline preload="metadata" />;
                                            })() : <img src={getSafeImageSrc(photo.url, CRYING_EMOJI_FALLBACK)} alt={`${photo.nombre} - ${photo.label || 'galería'}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={applyCryingEmojiFallback} />}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-cyan-950/40 via-transparent to-transparent" />
                                            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent">
                                                <div className="flex items-end justify-between gap-3">
                                                    <div>
                                                        <p className="text-lg font-black italic text-white tracking-tighter leading-none">{photo.nombre}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--metal-gold)] mt-2">{photo.profesion}</p>
                                                        {photo.nacionalidad && (
                                                            <p className="font-title text-[9px] font-medium tracking-[0.06em] text-slate-400 mt-1">{photo.nacionalidad}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="px-3 py-1 rounded-full border theme-border-secondary bg-slate-950/85 text-[9px] font-black uppercase tracking-[0.3em] text-slate-200">
                                                            {photo.type === 'video' ? 'VIDEO' : (photo.isGif ? 'GIF' : 'IMG')}
                                                        </div>
                                                        <div
                                                            className="min-w-[46px] h-[46px] rounded-2xl border flex items-center justify-center text-sm font-black uppercase shadow-xl"
                                                            style={{
                                                                background: labelStyle.bg,
                                                                borderColor: labelStyle.border,
                                                                color: labelStyle.text,
                                                                boxShadow: `0 0 16px ${labelStyle.glow}`
                                                            }}
                                                        >
                                                            {photo.label || '—'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'ESCENAS_FOTOS' && !selectedCategory && (
                <div className="space-y-10 animate-in fade-in duration-500">
                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
                        <div>
                            <h2 className="neon-sign neon-sign--magenta text-4xl font-black italic text-white uppercase tracking-tighter">Escenas/Fotos</h2>
                            <p className="text-xs font-bold text-[var(--metal-gold)] uppercase tracking-widest mt-1">
                                Archivo global de escenas ({sceneMediaPhotos.length} elementos)
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => openSceneViewer(0, true)}
                                disabled={!sceneMediaPhotos.length}
                                className="btn-metal btn-metal--gold inline-flex items-center gap-2 px-5 py-3 rounded-full text-[10px] disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <LucideIcon name="play" size={14} />
                                Play Escenas
                            </button>
                            <div className="inline-flex items-center gap-2 rounded-full border theme-border-secondary bg-slate-950/80 px-3 py-2">
                                <label htmlFor="scenePlaybackSeconds" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-300">
                                    Duración
                                </label>
                                <select
                                    id="scenePlaybackSeconds"
                                    className="filter-select"
                                    value={galleryPlaybackSeconds}
                                    onChange={(event) => setGalleryPlaybackSeconds(Number(event.target.value))}
                                >
                                    {[3, 5, 7, 10].map((seconds) => (
                                        <option key={seconds} value={seconds}>{seconds} segundos</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {!sceneMediaPhotos.length ? (
                        <div className="py-24 border border-dashed theme-border-secondary rounded-2xl text-center bg-slate-950/30">
                            <div className="w-20 h-20 rounded-full bg-slate-900 border theme-border-secondary flex items-center justify-center mx-auto mb-6">
                                <LucideIcon name="image-off" size={28} className="text-slate-600" />
                            </div>
                            <h3 className="font-title text-xl font-black italic text-white tracking-[0.06em]">No hay escenas para mostrar</h3>
                            <p className="font-title text-xs font-medium text-slate-500 tracking-[0.06em] mt-3">
                                Cargá elementos en <code>globalMedia</code> para visualizar esta sección.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                            {sceneMediaPhotos.map((photo, index) => {
                                const labelStyle = getGalleryLabelStyle(photo.label);
                                return (
                                    <button
                                        key={photo.id}
                                        type="button"
                                        onClick={() => openSceneViewer(index)}
                                        className="group text-left theme-surface-card border theme-border-secondary rounded-[2.4rem] overflow-hidden hover:border-[color:color-mix(in_srgb,var(--metal-gold)_40%,transparent)] hover:shadow-[0_0_30px_rgba(34,211,238,0.12)] transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-[var(--glow-gold)] focus:ring-offset-2 focus:ring-offset-[#020617]"
                                    >
                                        <div className="aspect-[4/5] relative overflow-hidden bg-slate-950">
                                            {photo.type === 'video' ? (() => {
                                                const embedInfo = getVideoEmbedInfo(photo.url);
                                                if (embedInfo) {
                                                    return (
                                                        <div className="w-full h-full bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.3),_rgba(15,23,42,0.95))] flex flex-col items-center justify-center gap-4 p-6 text-center">
                                                            <div className="w-16 h-16 rounded-full border border-[var(--metal-gold)]/40 bg-slate-950/70 flex items-center justify-center text-[color:color-mix(in_srgb,var(--metal-gold)_72%,white)] text-2xl">▶</div>
                                                            <div>
                                                                <p className="font-title text-sm font-semibold tracking-[0.1em] text-white">Video</p>
                                                                <p className="font-title text-[10px] font-medium tracking-[0.08em] text-slate-400 mt-2">{embedInfo.provider}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return <video src={photo.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" muted playsInline preload="metadata" />;
                                            })() : <img src={getSafeImageSrc(photo.url, CRYING_EMOJI_FALLBACK)} alt={`${photo.nombre} - ${photo.label || 'escena'}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={applyCryingEmojiFallback} />}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-cyan-950/40 via-transparent to-transparent" />
                                            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent">
                                                <div className="flex items-end justify-between gap-3">
                                                    <div>
                                                        <p className="text-lg font-black italic text-white tracking-tighter leading-none">{photo.nombre}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--metal-gold)] mt-2">{photo.profesion}</p>
                                                        {photo.nacionalidad && (
                                                            <p className="font-title text-[9px] font-medium tracking-[0.06em] text-slate-400 mt-1">{photo.nacionalidad}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="px-3 py-1 rounded-full border theme-border-secondary bg-slate-950/85 text-[9px] font-black uppercase tracking-[0.3em] text-slate-200">
                                                            {photo.type === 'video' ? 'VIDEO' : (photo.isGif ? 'GIF' : 'IMG')}
                                                        </div>
                                                        <div
                                                            className="min-w-[46px] h-[46px] rounded-2xl border flex items-center justify-center text-sm font-black uppercase shadow-xl"
                                                            style={{
                                                                background: labelStyle.bg,
                                                                borderColor: labelStyle.border,
                                                                color: labelStyle.text,
                                                                boxShadow: `0 0 16px ${labelStyle.glow}`
                                                            }}
                                                        >
                                                            {photo.label || '—'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {selectedGalleryPhoto && (
                <div className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8" onClick={closeGalleryViewer}>
                    <button
                        type="button"
                        onClick={closeGalleryViewer}
                        className="btn-metal btn-metal--danger absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 rounded-full flex items-center justify-center"
                        aria-label="Cerrar visor"
                    >
                        <span className="text-[26px] leading-none font-black">✕</span>
                    </button>

                    <div className="w-full max-w-6xl max-h-full flex flex-col gap-4" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between gap-4 px-1 sm:px-2">
                            <div>
                                <p className="text-2xl sm:text-3xl font-black italic text-white tracking-tighter">{selectedGalleryPhoto.nombre}</p>
                                <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[var(--metal-gold)] mt-2">{selectedGalleryPhoto.profesion}{selectedGalleryPhoto.nacionalidad ? ` · ${selectedGalleryPhoto.nacionalidad}` : ''}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {filteredGalleryPhotos.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setIsGalleryPlaying((prev) => !prev)}
                                            className="btn-metal btn-metal--gold px-4 py-2 rounded-full text-[10px]"
                                        >
                                            {isGalleryPlaying ? 'Pause' : 'Play'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsGalleryRandom((prev) => !prev)}
                                            className={`btn-metal px-4 py-2 rounded-full text-[10px] transition-all ${isGalleryRandom ? 'btn-metal--gold is-active text-[#fffaf0]' : 'btn-metal--silver text-slate-900'}`}
                                        >
                                            Aleatorio {isGalleryRandom ? 'ON' : 'OFF'}
                                        </button>
                                    </>
                                )}
                                <div className="px-3 py-2 rounded-full border theme-border-secondary bg-slate-950/85 text-[10px] font-black uppercase tracking-[0.3em] text-slate-200">
                                    {selectedGalleryPhoto.type === 'video' ? 'VIDEO' : (selectedGalleryPhoto.isGif ? 'GIF' : 'IMG')}
                                </div>
                                <div
                                    className="min-w-[52px] h-[52px] rounded-2xl border flex items-center justify-center text-base font-black uppercase shadow-xl"
                                    style={{
                                        background: getGalleryLabelStyle(selectedGalleryPhoto.label).bg,
                                        borderColor: getGalleryLabelStyle(selectedGalleryPhoto.label).border,
                                        color: getGalleryLabelStyle(selectedGalleryPhoto.label).text,
                                        boxShadow: `0 0 20px ${getGalleryLabelStyle(selectedGalleryPhoto.label).glow}`
                                    }}
                                >
                                    {selectedGalleryPhoto.label || '—'}
                                </div>
                            </div>
                        </div>

                        <div className="relative flex-1 min-h-0 rounded-[2rem] overflow-hidden border theme-border-secondary bg-black/50">
                            {selectedGalleryPhoto.type === 'video' ? (() => {
                                const embedInfo = getVideoEmbedInfo(selectedGalleryPhoto.url);
                                if (embedInfo) {
                                    return (
                                        <iframe
                                            src={embedInfo.src}
                                            title={`${selectedGalleryPhoto.nombre} video`}
                                            className="w-full h-[calc(100vh-14rem)] bg-black"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    );
                                }
                                return (
                                    <video
                                        src={selectedGalleryPhoto.url}
                                        controls
                                        playsInline
                                        autoPlay={isGalleryPlaying}
                                        onEnded={() => {
                                            if (isGalleryPlaying && filteredGalleryPhotos.length > 1) {
                                                showNextGalleryPhoto();
                                            }
                                        }}
                                        onError={() => {
                                            if (filteredGalleryPhotos.length > 1) {
                                                showNextGalleryPhoto();
                                            }
                                        }}
                                        className="w-full h-[calc(100vh-14rem)] object-contain bg-black"
                                    />
                                );
                            })() : (
                                <img
    src={getSafeImageSrc(selectedGalleryPhoto.url, CRYING_EMOJI_FALLBACK)}
    alt={`${selectedGalleryPhoto.nombre} - ${selectedGalleryPhoto.label || 'galería'}`}
    className="w-full h-[calc(100vh-14rem)] object-contain bg-black"
    onError={(e) => {
        // 1. Aplicamos el fallback visual por si acaso
        applyCryingEmojiFallback(e);
        
        // 2. Pasamos a la siguiente foto si hay más de una
        if (filteredGalleryPhotos.length > 1) {
            showNextGalleryPhoto();
        }
    }}
/>
                            )}

                            {filteredGalleryPhotos.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(event) => { event.stopPropagation(); showPreviousGalleryPhoto(); }}
                                        className="absolute left-4 bottom-4 sm:left-6 sm:bottom-6 w-10 h-10 rounded-full border theme-border-secondary bg-slate-900/90 text-white flex items-center justify-center hover:border-[var(--metal-gold)] hover:text-[color:color-mix(in_srgb,var(--metal-gold)_72%,white)] transition-all shadow-lg shadow-black/40"
                                        aria-label="Foto anterior"
                                    >
                                        <span className="text-[20px] leading-none font-black">←</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(event) => { event.stopPropagation(); showNextGalleryPhoto(); }}
                                        className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 w-10 h-10 rounded-full border theme-border-secondary bg-slate-900/90 text-white flex items-center justify-center hover:border-[var(--metal-gold)] hover:text-[color:color-mix(in_srgb,var(--metal-gold)_72%,white)] transition-all shadow-lg shadow-black/40"
                                        aria-label="Foto siguiente"
                                    >
                                        <span className="text-[20px] leading-none font-black">→</span>
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 sm:px-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
                                {selectedGalleryIndex + 1} de {filteredGalleryPhotos.length} archivos visibles
                            </p>
                            <div className="flex items-center justify-start sm:justify-end gap-2">
                                {isEditingGalleryLabel ? (
                                    <>
                                        <select
                                            value={galleryLabelDraft}
                                            onChange={(event) => setGalleryLabelDraft(event.target.value)}
                                            className="bg-slate-900 border theme-border-secondary rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white focus:outline-none focus:border-[var(--metal-gold)]"
                                        >
                                            <option value="">Sin etiqueta</option>
                                            {GALLERY_LABELS.map((label) => (
                                                <option key={label} value={label}>{label}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={saveSelectedGalleryLabel}
                                            className="px-2 py-1 rounded-lg border theme-border-secondary bg-slate-900 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--metal-gold)] hover:border-[var(--metal-gold)] transition-all"
                                        >
                                            Guardar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setGalleryLabelDraft(selectedGalleryPhoto?.label || '');
                                                setIsEditingGalleryLabel(false);
                                            }}
                                            className="px-2 py-1 rounded-lg border theme-border-secondary bg-slate-900 text-[10px] font-black uppercase tracking-[0.14em] text-slate-300 hover:text-white transition-all"
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingGalleryLabel(true)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border theme-border-secondary bg-slate-900 text-[10px] font-black uppercase tracking-[0.16em] text-slate-300 hover:border-[var(--metal-gold)] hover:text-[var(--metal-gold)] transition-all"
                                        aria-label="Editar etiqueta de la multimedia"
                                    >
                                        <span className="text-xs leading-none">✏️</span>
                                        <span>{selectedGalleryPhoto?.label || 'Sin etiqueta'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedScenePhoto && (
                <div className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8" onClick={closeSceneViewer}>
                    <button
                        type="button"
                        onClick={closeSceneViewer}
                        className="btn-metal btn-metal--danger absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 rounded-full flex items-center justify-center"
                        aria-label="Cerrar visor de escena"
                    >
                        <span className="text-[26px] leading-none font-black">✕</span>
                    </button>

                    <div className="w-full max-w-6xl max-h-full flex flex-col gap-4" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between gap-4 px-1 sm:px-2">
                            <div>
                                <p className="text-2xl sm:text-3xl font-black italic text-white tracking-tighter">{selectedScenePhoto.nombre}</p>
                                <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[var(--metal-gold)] mt-2">{selectedScenePhoto.profesion}{selectedScenePhoto.nacionalidad ? ` · ${selectedScenePhoto.nacionalidad}` : ''}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {sceneMediaPhotos.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setIsScenePlaying((prev) => !prev)}
                                            className="btn-metal btn-metal--gold px-4 py-2 rounded-full text-[10px]"
                                        >
                                            {isScenePlaying ? 'Pause' : 'Play'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsSceneRandom((prev) => !prev)}
                                            className={`btn-metal px-4 py-2 rounded-full text-[10px] transition-all ${isSceneRandom ? 'btn-metal--gold is-active text-[#fffaf0]' : 'btn-metal--silver text-slate-900'}`}
                                        >
                                            Aleatorio {isSceneRandom ? 'ON' : 'OFF'}
                                        </button>
                                    </>
                                )}
                                <div className="px-3 py-2 rounded-full border theme-border-secondary bg-slate-950/85 text-[10px] font-black uppercase tracking-[0.3em] text-slate-200">
                                    {selectedScenePhoto.type === 'video' ? 'VIDEO' : (selectedScenePhoto.isGif ? 'GIF' : 'IMG')}
                                </div>
                                <div
                                    className="min-w-[52px] h-[52px] rounded-2xl border flex items-center justify-center text-base font-black uppercase shadow-xl"
                                    style={{
                                        background: getGalleryLabelStyle(selectedScenePhoto.label).bg,
                                        borderColor: getGalleryLabelStyle(selectedScenePhoto.label).border,
                                        color: getGalleryLabelStyle(selectedScenePhoto.label).text,
                                        boxShadow: `0 0 20px ${getGalleryLabelStyle(selectedScenePhoto.label).glow}`
                                    }}
                                >
                                    {selectedScenePhoto.label || '—'}
                                </div>
                            </div>
                        </div>
                        <div className="relative flex-1 min-h-0 rounded-[2rem] overflow-hidden border theme-border-secondary bg-black/50">
                            {selectedScenePhoto.type === 'video' ? (() => {
                                const embedInfo = getVideoEmbedInfo(selectedScenePhoto.url);
                                if (embedInfo) {
                                    return (
                                        <iframe
                                            src={embedInfo.src}
                                            title={`${selectedScenePhoto.nombre} video`}
                                            className="w-full h-[calc(100vh-14rem)] bg-black"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    );
                                }
                                return (
                                    <video
                                        src={selectedScenePhoto.url}
                                        controls
                                        playsInline
                                        autoPlay={isScenePlaying}
                                        onEnded={() => {
                                            if (isScenePlaying && sceneMediaPhotos.length > 1) {
                                                showNextScenePhoto();
                                            }
                                        }}
                                        onError={() => {
                                            if (sceneMediaPhotos.length > 1) {
                                                showNextScenePhoto();
                                            }
                                        }}
                                        className="w-full h-[calc(100vh-14rem)] object-contain bg-black"
                                    />
                                );
                            })() : (
                                <img
                                    src={getSafeImageSrc(selectedScenePhoto.url, CRYING_EMOJI_FALLBACK)}
                                    alt={`${selectedScenePhoto.nombre} - ${selectedScenePhoto.label || 'escena'}`}
                                    className="w-full h-[calc(100vh-14rem)] object-contain bg-black"
                                    onError={(e) => {
                                        applyCryingEmojiFallback(e);
                                        if (sceneMediaPhotos.length > 1) {
                                            showNextScenePhoto();
                                        }
                                    }}
                                />
                            )}
                            {sceneMediaPhotos.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(event) => { event.stopPropagation(); showPreviousScenePhoto(); }}
                                        className="absolute left-4 bottom-4 sm:left-6 sm:bottom-6 w-10 h-10 rounded-full border theme-border-secondary bg-slate-900/90 text-white flex items-center justify-center hover:border-[var(--metal-gold)] hover:text-[color:color-mix(in_srgb,var(--metal-gold)_72%,white)] transition-all shadow-lg shadow-black/40"
                                        aria-label="Escena anterior"
                                    >
                                        <span className="text-[20px] leading-none font-black">←</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(event) => { event.stopPropagation(); showNextScenePhoto(); }}
                                        className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 w-10 h-10 rounded-full border theme-border-secondary bg-slate-900/90 text-white flex items-center justify-center hover:border-[var(--metal-gold)] hover:text-[color:color-mix(in_srgb,var(--metal-gold)_72%,white)] transition-all shadow-lg shadow-black/40"
                                        aria-label="Escena siguiente"
                                    >
                                        <span className="text-[20px] leading-none font-black">→</span>
                                    </button>
                                </>
                            )}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400 px-1 sm:px-2">
                            {selectedSceneIndex + 1} de {sceneMediaPhotos.length} archivos visibles
                        </p>
                    </div>
                </div>
            )}

            {isBrokenGalleryModalOpen && (
                <div className="fixed inset-0 z-[130] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6" onClick={() => setIsBrokenGalleryModalOpen(false)}>
                    <div className="w-full max-w-[min(1200px,100%)] max-h-full theme-surface-card border theme-border-secondary rounded-[2rem] p-4 sm:p-6 overflow-hidden" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <p className="text-2xl font-black italic text-white tracking-tighter">Fotos rotas</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--metal-gold)] mt-2">
                                    {isCheckingBrokenGallery
                                        ? 'Analizando enlaces...'
                                        : `${brokenGalleryPhotos.length} enlace${brokenGalleryPhotos.length === 1 ? '' : 's'} sin vista`}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBrokenGalleryModalOpen(false)}
                                className="btn-metal btn-metal--danger w-11 h-11 rounded-full flex items-center justify-center"
                                aria-label="Cerrar revisión de fotos rotas"
                            >
                                <span className="text-xl font-black leading-none">✕</span>
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-6">
                            {!brokenGalleryGroups.length ? (
                                <div className="theme-surface-soft rounded-2xl border theme-border-secondary p-6 text-center">
                                    <p className="text-sm font-semibold text-white">No se detectaron fotos rotas ahora mismo.</p>
                                </div>
                            ) : brokenGalleryGroups.map((group) => (
                                <section key={group.id} className="theme-surface-soft rounded-2xl border theme-border-secondary p-4 sm:p-5">
                                    <div className="mb-4">
                                        <p className="text-lg font-black italic text-white tracking-tight">{group.nombre}</p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mt-1">
                                            {group.profesion}{group.nacionalidad ? ` · ${group.nacionalidad}` : ''}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {group.fotos.map((photo) => {
                                            const isSaving = !!brokenGallerySavingMap[photo.id];
                                            const isEditing = !!brokenGalleryEditingMap[photo.id];
                                            const draftUrl = brokenGalleryUrlDrafts[photo.id] ?? photo.url;
                                            return (
                                                <article key={photo.id} className="grid grid-cols-1 xl:grid-cols-[76px_minmax(0,1fr)_auto] gap-3 p-3 rounded-xl border theme-border-secondary bg-slate-950/40">
                                                    <div className="w-[76px] h-[76px] rounded-lg overflow-hidden border theme-border-secondary bg-slate-900 flex items-center justify-center">
                                                        <img src={CRYING_EMOJI_FALLBACK} alt="Vista previa rota" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="space-y-2 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-[10px] px-2 py-1 rounded-full border theme-border-secondary bg-slate-900/85 font-black uppercase tracking-[0.16em] text-slate-200">
                                                                Etiqueta: {photo.label || 'Sin etiqueta'}
                                                            </span>
                                                            <span className="text-[10px] px-2 py-1 rounded-full border theme-border-secondary bg-slate-900/85 font-black uppercase tracking-[0.16em] text-slate-400">
                                                                {photo.sourceTag}
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="url"
                                                            value={draftUrl}
                                                            onChange={(event) => handleBrokenDraftChange(photo.id, event.target.value)}
                                                            placeholder="https://..."
                                                            readOnly={!isEditing}
                                                            className={`w-full min-w-0 bg-slate-900 border theme-border-secondary rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--metal-gold)] ${!isEditing ? 'opacity-80 cursor-default' : ''}`}
                                                        />
                                                    </div>
                                                    <div className="flex flex-wrap xl:flex-col gap-2 xl:justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => openBrokenGalleryPhotoUrl(photo)}
                                                            className="btn-metal btn-metal--silver px-3 py-2 rounded-xl text-[10px]"
                                                        >
                                                            Ir al enlace
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setBrokenPhotoEditing(photo.id, true)}
                                                            disabled={isSaving}
                                                            className="btn-metal px-3 py-2 rounded-xl text-[10px] disabled:opacity-60"
                                                        >
                                                            Editar enlace
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => saveBrokenGalleryPhotoUrl(photo)}
                                                            disabled={isSaving}
                                                            className="btn-metal btn-metal--gold px-3 py-2 rounded-xl text-[10px] disabled:opacity-60"
                                                        >
                                                            Guardar enlace
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteBrokenGalleryPhoto(photo)}
                                                            disabled={isSaving}
                                                            className="btn-metal btn-metal--danger px-3 py-2 rounded-xl text-[10px] disabled:opacity-60"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )}

    {activeTab === 'ESCENAS_FOTOS' && !selectedCategory && (
        <div className="theme-surface-card gothic-frame gothic-frame--ornate rounded-[2rem] p-8 md:p-10 animate-in fade-in duration-500">
            <h2 className="neon-sign neon-sign--magenta text-4xl font-black italic text-white uppercase tracking-tighter">Escenas/Fotos</h2>
            <p className="text-xs font-bold text-[var(--metal-gold)] uppercase tracking-widest mt-2">
                Nuevo bloque preparado para escenas multimedia sin afectar los tabs existentes.
            </p>
            <div className="mt-8">
                <button type="button" className="btn-metal btn-metal--silver px-6 py-3 rounded-2xl text-xs text-slate-900">
                    Configurar contenido
                </button>
            </div>
        </div>
    )}

    {/* 3. VISTA BATALLAS */}
    {activeTab === 'BATALLAS' && !selectedCategory && !selectedArena && (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={resetAllScores}
                        className="solid-metal-ui px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.18em] transition-all"
                    >
                        Resetear calificaciones
                    </button>
                        <button
                            onClick={() => setShowResetArenaPicker(prev => !prev)}
                            className="solid-metal-ui px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.18em] transition-all"
                        >
                        Resetear item
                    </button>
                </div>
                {showResetArenaPicker && (
                    <div className="theme-surface-card border theme-border-secondary rounded-2xl p-4 flex flex-wrap items-center gap-3">
                        <select
                            value={resetArenaTarget}
                            onChange={(e) => setResetArenaTarget(e.target.value)}
                            className="bg-slate-900 border theme-border-secondary rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white"
                        >
                            {ARENAS.map((arenaName) => (
                                <option key={arenaName} value={arenaName}>{arenaName}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => resetArenaScores(resetArenaTarget, selectedBattleScope, selectedBattleGroupKey)}
                            className="solid-metal-ui px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.16em] transition-all"
                            disabled={!selectedBattleScope}
                        >
                            Confirmar reset item
                        </button>
                    </div>
                )}
                <div>
                    <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Arenas</h2>
                    <p className="text-xs font-bold text-[var(--metal-gold)] uppercase tracking-widest mt-1">
                        {!selectedBattleScope
                            ? 'Paso 1: elegí un modo de enfrentamiento'
                            : requiresBattleGroupSelection && !selectedBattleGroupKey
                                ? `Paso 2: elegí una opción de ${getBattleScopeLabel(selectedBattleScope)}`
                                : `Paso 3: elegí uno de los 15 ítems · Modo: ${getBattleScopeLabel(selectedBattleScope)}`}
                    </p>
                </div>
            </div>

            {!selectedBattleScope && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {BATTLE_SCOPES.map((scope) => (
                        <button
                            key={scope.id}
                            onClick={() => {
                                setSelectedBattleScope(scope.id);
                                setSelectedBattleGroupKey(scope.id === 'GENERAL' ? 'all' : '');
                                setSelectedArena(null);
                            }}
                            className="solid-metal-ui battle-mode-card border rounded-2xl p-6 text-left transition-all"
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Modo</p>
                            <h3 className="font-black italic text-white mt-2">{scope.label}</h3>
                            <p className="text-xs text-slate-300 mt-2">{scope.description}</p>
                        </button>
                    ))}
                </div>
            )}

            {selectedBattleScope && (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
                            Modo: {getBattleScopeLabel(selectedBattleScope)}
                        </p>
                        <button
                            onClick={() => {
                                setSelectedBattleScope(null);
                                setSelectedBattleGroupKey('');
                                setSelectedArena(null);
                            }}
                            className="solid-metal-ui inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.16em] transition-all"
                        >
                            Cambiar modo
                        </button>
                    </div>
                    {requiresBattleGroupSelection && (
                        <div className="theme-surface-card border theme-border-secondary rounded-2xl p-4 space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                                Elegí una opción de {getBattleScopeLabel(selectedBattleScope)}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {battleScopeOptions.map((option) => (
                                    <button
                                        key={option.key}
                                        onClick={() => {
                                            setSelectedBattleGroupKey(option.key);
                                            setSelectedArena(null);
                                        }}
                                        className={`solid-metal-ui px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.14em] transition-all ${
                                            selectedBattleGroupKey === option.key
                                                ? 'border-[var(--metal-gold)] text-white'
                                                : 'theme-border-secondary text-slate-200'
                                        }`}
                                    >
                                        {option.label} <span className="text-slate-400">({option.ids.length})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {requiresBattleGroupSelection && !selectedBattleGroupKey && (
                        <p className="text-xs text-slate-400">Seleccioná una opción para habilitar las batallas.</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {ARENAS.map((arenaName) => (
                    <button
                        key={arenaName}
                        disabled={requiresBattleGroupSelection && !selectedBattleGroupKey}
                        onClick={() => {
                            setSelectedArena(arenaName);
                            const arenaKey = getArenaBattleKey(arenaName, selectedBattleScope, selectedBattleGroupKey);
                            if (!arenaBattleState[arenaKey]) initArenaBattle(arenaName, selectedBattleScope, selectedBattleGroupKey);
                        }}
                        className="solid-metal-ui battle-mode-card border rounded-2xl p-6 text-left transition-all disabled:opacity-45 disabled:cursor-not-allowed"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Item</p>
                        <h3 className="font-black italic text-white mt-2">{arenaName}</h3>
                    </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )}

    {activeTab === 'BATALLAS' && selectedArena && (() => {
        const arenaKey = getArenaBattleKey(selectedArena, selectedBattleScope, selectedBattleGroupKey);
        const arenaState = arenaBattleState[arenaKey];
        const champion = perfiles.find(p => p.firebaseId === arenaState?.championId);
        const challenger = perfiles.find(p => p.firebaseId === arenaState?.challengerId);
        const championStats = champion ? getArenaStats(selectedArena, champion.firebaseId) : null;
        const challengerStats = challenger ? getArenaStats(selectedArena, challenger.firebaseId) : null;

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-slate-900/95 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border theme-border-secondary space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setSelectedArena(null)}
                            className="group solid-metal-ui inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.16em] transition-all"
                        >
                            <i data-lucide="arrow-left" className="w-4 h-4"></i>
                            Volver a arenas
                        </button>
                        <button
                            onClick={() => {
                                setSelectedArena(null);
                                setSelectedBattleScope(null);
                                setSelectedBattleGroupKey('');
                            }}
                            className="group solid-metal-ui inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.16em] transition-all"
                        >
                            <i data-lucide="refresh-ccw" className="w-4 h-4"></i>
                            Cambiar modo
                        </button>
                        <button
                            onClick={() => setShowBattleResetPanel(prev => !prev)}
                            className="solid-metal-ui inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.16em] transition-all"
                        >
                            Resetear una batalla
                        </button>
                    </div>
                    {showBattleResetPanel && (
                        <div className="theme-surface-card border border-red-400/30 rounded-2xl p-4 mt-3">
                            {(() => {
                                const playedKeys = Object.keys(arenaState?.matchups || {}).filter((key) => !!arenaState?.matchups?.[key]);
                                if (!arenaState || !playedKeys.length) {
                                    return <p className="text-xs text-red-200 font-bold uppercase tracking-[0.12em]">No hay cruces jugados para resetear.</p>;
                                }

                                return (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-200">Elegí el cruce a deshacer:</p>
                                        {playedKeys.map((pairKey) => {
                                            const [profileAId, profileBId] = pairKey.split('__');
                                            const profileA = perfiles.find((profile) => profile.firebaseId === profileAId);
                                            const profileB = perfiles.find((profile) => profile.firebaseId === profileBId);
                                            const labelA = profileA?.nombre || profileAId;
                                            const labelB = profileB?.nombre || profileBId;

                                            return (
                                                <button
                                                    key={pairKey}
                                                    onClick={() => resetSpecificBattle(selectedArena, profileAId, profileBId, selectedBattleScope, selectedBattleGroupKey)}
                                                    className="metal-btn-3d w-full text-left px-3 py-2 rounded-xl border theme-border-secondary bg-slate-900/60 hover:border-red-300/70 transition-all"
                                                >
                                                    <span className="text-xs text-white font-semibold">{labelA} vs {labelB}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-black italic text-white tracking-[0.08em] break-words leading-tight">
                            {selectedArena}
                        </h2>
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
                            Arena activa · Modo: {getBattleScopeLabel(selectedBattleScope)}
                        </p>
                        {arenaState?.activeGroupLabel && (
                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[var(--metal-gold)] mt-2">
                                {arenaState.activeGroupLabel}
                            </p>
                        )}
                    </div>
                </div>

                {!arenaState && (
                    <div className="theme-surface-card border theme-border-secondary rounded-2xl p-8 text-center">
                        <p className="text-sm text-slate-300">Presioná para iniciar esta arena.</p>
                        <button
                            onClick={() => initArenaBattle(selectedArena, selectedBattleScope, selectedBattleGroupKey)}
                            className="metal-btn-3d mt-4 bg-[var(--metal-bronze)] text-white px-5 py-3 rounded-xl font-black uppercase text-xs tracking-[0.2em]"
                        >
                            Iniciar batallas
                        </button>
                    </div>
                )}

                {arenaState && arenaState.isFinished && (
                    <div className="theme-surface-card border theme-border-secondary rounded-2xl p-8 text-center">
                        <h3 className="text-2xl font-black italic text-white">Arena completada</h3>
                        <p className="text-slate-400 mt-2">No quedan combates nuevos para este item.</p>
                    </div>
                )}

                {arenaState && champion && challenger && !arenaState.isFinished && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        <button
                            onClick={() => registerBattleWinner(selectedArena, champion.firebaseId, selectedBattleScope, selectedBattleGroupKey)}
                            className="theme-surface-card metal-card-3d battle-participant-card border theme-border-secondary rounded-2xl p-8 transition-all text-left"
                            style={{ '--battle-profession-color': getProfessionCardVisual(champion.profesion).baseColor }}
                        >
                            <img
                                src={getBattlePhotoForArena(champion, selectedArena)}
                                alt={champion.nombre}
                                className="w-full h-64 object-contain rounded-xl border border-slate-700/60 mb-5 bg-slate-950/70 p-2"
                                onError={applyCryingEmojiFallback}
                            />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Versus</p>
                            <h3 className="text-2xl sm:text-3xl font-black italic text-white mt-2">{champion.nombre}</h3>
                            {selectedArena === 'Estatura' && (
                                <p className="text-xs text-slate-200 mt-2">Altura: {getProfileHeightLabel(champion)}</p>
                            )}
                            <p className="text-xs text-[var(--metal-gold)] mt-3">Victorias: {championStats?.wins || 0} · Batallas: {championStats?.battles || 0}</p>
                            <p className="text-xs text-white/80 mt-1">Puntaje final: {championStats?.score || 0}</p>
                        </button>

                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="font-title text-4xl text-[var(--metal-gold)] font-black">VS</div>
                            {selectedArena === 'Estatura' && (
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300 mt-3">
                                    Compará altura en cm
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => registerBattleWinner(selectedArena, challenger.firebaseId, selectedBattleScope, selectedBattleGroupKey)}
                            className="theme-surface-card metal-card-3d battle-participant-card border theme-border-secondary rounded-2xl p-8 transition-all text-left"
                            style={{ '--battle-profession-color': getProfessionCardVisual(challenger.profesion).baseColor }}
                        >
                            <img
                                src={getBattlePhotoForArena(challenger, selectedArena)}
                                alt={challenger.nombre}
                                className="w-full h-64 object-contain rounded-xl border border-slate-700/60 mb-5 bg-slate-950/70 p-2"
                                onError={applyCryingEmojiFallback}
                            />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Versus</p>
                            <h3 className="text-2xl sm:text-3xl font-black italic text-white mt-2">{challenger.nombre}</h3>
                            {selectedArena === 'Estatura' && (
                                <p className="text-xs text-slate-200 mt-2">Altura: {getProfileHeightLabel(challenger)}</p>
                            )}
                            <p className="text-xs text-[var(--metal-gold)] mt-3">Victorias: {challengerStats?.wins || 0} · Batallas: {challengerStats?.battles || 0}</p>
                            <p className="text-xs text-white/80 mt-1">Puntaje final: {challengerStats?.score || 0}</p>
                        </button>
                    </div>
                )}
            </div>
        );
    })()}

    {/* 4. VISTA RANKING (SOLO TABLA) */}
    {activeTab === 'RANKING' && !selectedCategory && (
        <div className="theme-surface-card rounded-2xl gothic-frame gothic-frame--ornate animate-in zoom-in-95 duration-500">
            <table className="w-full text-left border-collapse">
                <thead className="theme-surface-soft">
                    <tr>
                        <th className="px-4 py-6 text-[9px] font-black uppercase tracking-widest text-center rock-carved-text">#</th>
                        <th className="px-4 py-6 text-[9px] font-black uppercase tracking-widest rock-carved-text">
                            <button
                                type="button"
                                onClick={() => toggleSort('nombre', 'asc')}
                                className="inline-flex items-center gap-1 hover:text-[var(--metal-gold)] transition-colors"
                            >
                                Perfil {sortBy === 'nombre' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </button>
                        </th>
                        <th className="px-4 py-6 text-[9px] font-black uppercase tracking-widest text-center rock-carved-text">
                            <button
                                type="button"
                                onClick={() => toggleSort('Rostro', 'desc')}
                                className="inline-flex items-center justify-center gap-1 hover:text-[var(--metal-gold)] transition-colors"
                            >
                                Rostro {sortBy === 'Rostro' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </button>
                        </th>
                        <th className="px-4 py-6 text-[9px] font-black uppercase tracking-widest text-center rock-carved-text">
                            <button
                                type="button"
                                onClick={() => toggleSort('Cuerpo', 'desc')}
                                className="inline-flex items-center justify-center gap-1 hover:text-[var(--metal-gold)] transition-colors"
                            >
                                Cuerpo {sortBy === 'Cuerpo' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </button>
                        </th>
                        <th className="px-4 py-6 text-[9px] font-black uppercase tracking-widest text-center rock-carved-text">
                            <button
                                type="button"
                                onClick={() => toggleSort('Actitud', 'desc')}
                                className="inline-flex items-center justify-center gap-1 hover:text-[var(--metal-gold)] transition-colors"
                            >
                                Actitud {sortBy === 'Actitud' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </button>
                        </th>
                        <th className="px-4 py-6 text-[9px] font-black uppercase tracking-widest text-center rock-carved-text">
                            <button
                                type="button"
                                onClick={() => toggleSort('nacionalidad', 'asc')}
                                className="inline-flex items-center justify-center gap-1 hover:text-[var(--metal-gold)] transition-colors"
                            >
                                Ubicación {sortBy === 'nacionalidad' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </button>
                        </th>
                        <th className="px-4 py-6 text-[9px] font-black uppercase tracking-widest text-center rock-carved-text">
                            <button
                                type="button"
                                onClick={() => toggleSort('edad', 'desc')}
                                className="inline-flex items-center justify-center gap-1 hover:text-[var(--metal-gold)] transition-colors"
                            >
                                Edad {sortBy === 'edad' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </button>
                        </th>
                        <th className="px-8 py-6 text-right">
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ordenar por</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value);
                                        setSortDirection('desc');
                                    }}
                                    className="bg-slate-900 border border-[color:color-mix(in_srgb,var(--metal-gold)_30%,transparent)] text-[var(--metal-gold)] text-[10px] font-black uppercase py-1 px-2 rounded-lg outline-none cursor-pointer hover:border-cyan-500 transition-all"
                                >
                                    <option value="promedio">G2 SCORE TOTAL (PROMEDIO)</option>
                                    <optgroup label="Categorías Principales" className="theme-surface-card text-slate-500">
                                        <option value="Rostro">Rostro (Mix)</option>
                                        <option value="Cuerpo">Cuerpo (Mix)</option>
                                        <option value="Actitud">Actitud (Mix)</option>
                                    </optgroup>
                                    <optgroup label="Atributos Específicos" className="theme-surface-card text-slate-500">
                                        {CARACTERISTICAS.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedProfiles.map((p, idx) => (
<tr key={p.firebaseId || p.id} onClick={() => openProfileEditor(p)}
    className={`cursor-pointer border-b border-slate-700/70 last:border-0 transition-all duration-300 group ${idx === 0 ? 'podium-1' : idx === 1 ? 'podium-2' : idx === 2 ? 'podium-3' : 'hover:bg-white/5'}`}>

    <td className="px-8 py-5">
        <span className={`font-black italic rock-carved-text ${idx === 0 ? 'text-gold text-4xl' : idx === 1 ? 'text-silver text-3xl' : idx === 2 ? 'text-bronze text-2xl' : 'text-slate-600 text-lg'}`}>#{idx + 1}</span>
    </td>

    <td className="px-8 py-5">
        <div className="flex items-center gap-4">
            {/* MINIATURA CON NEÓN */}
            <div className="w-14 h-14 rounded-xl border-2 p-0.5 transition-all duration-500"
     style={{
         borderColor: (neonColors[p.profesion?.toUpperCase()] || neonColors["DEFAULT"]).color,
         boxShadow: `0 0 10px ${(neonColors[p.profesion?.toUpperCase()] || neonColors["DEFAULT"]).sombra}`
     }}>
                <img src={getSafeImageSrc(p.fotos?.[0], 'https://via.placeholder.com/400x500')} className="w-full h-full object-cover transition-transform duration-700 opacity-80 group-hover:opacity-100" onError={applyCryingEmojiFallback} />
            </div>
            <div>
                <p className="font-title font-black text-white text-sm tracking-[0.06em] rock-carved-text">{p.nombre}</p>
                <p className="font-title text-[10px] font-medium tracking-[0.06em] rock-carved-text">{p.profesion}</p>
            </div>
        </div>
    </td>

{/* Promedios por Categoría */}
<td className="px-4 py-5 text-center">
    <button
        type="button"
        onClick={(event) => {
            event.stopPropagation();
            setScoreBreakdownModal({ isOpen: true, profile: p, category: 'Rostro' });
        }}
        className="text-xs font-bold text-slate-300 hover:text-emerald-300 transition-colors"
        title={`Ver detalle de batallas en Rostro de ${p.nombre}`}
    >
        {getRostroScore(p).toFixed(0)}
    </button>
</td>
<td className="px-4 py-5 text-center">
    <button
        type="button"
        onClick={(event) => {
            event.stopPropagation();
            setScoreBreakdownModal({ isOpen: true, profile: p, category: 'Cuerpo' });
        }}
        className="text-xs font-bold text-slate-300 hover:text-emerald-300 transition-colors"
        title={`Ver detalle de batallas en Cuerpo de ${p.nombre}`}
    >
        {getCuerpoScore(p).toFixed(0)}
    </button>
</td>
<td className="px-4 py-5 text-center">
    <button
        type="button"
        onClick={(event) => {
            event.stopPropagation();
            setScoreBreakdownModal({ isOpen: true, profile: p, category: 'Actitud' });
        }}
        className="text-xs font-bold text-slate-300 hover:text-emerald-300 transition-colors"
        title={`Ver detalle de batallas en Actitud de ${p.nombre}`}
    >
        {getActitudScore(p).toFixed(0)}
    </button>
</td>

{/* Ubicación (País y Ciudad) */}
<td className="px-4 py-5 text-center">
    <p className="text-[10px] font-bold text-slate-300 uppercase leading-none">{p.nacionalidad}</p>
    <p className="text-[8px] font-black text-[var(--metal-gold)]/70 uppercase tracking-tighter">{p.ciudad}</p>
</td>

{/* Edad */}
<td className="px-4 py-5 text-center font-bold text-[10px] text-slate-400">
    {calcularEdad(p.fechaNacimiento)} AÑOS
</td>

    <td className="px-8 py-5 text-right">
        <div className={`inline-block bg-slate-900 border px-4 py-2 rounded-xl transition-all duration-300 ${idx === 0 ? 'border-[#ffd700]/50 shadow-[0_0_15px_rgba(255,215,0,0.3)]' : idx === 1 ? 'border-[#c0c0c0]/50 shadow-[0_0_15px_rgba(192,192,192,0.3)]' : idx === 2 ? 'border-[#cd7f32]/50 shadow-[0_0_15px_rgba(205,127,50,0.3)]' : 'theme-border-secondary group-hover:border-[color:color-mix(in_srgb,var(--metal-gold)_50%,transparent)]'}`}>
            <span className={`font-black leading-none ${idx === 0 ? 'text-gold' : idx === 1 ? 'text-silver' : idx === 2 ? 'text-bronze' : 'text-[var(--metal-gold)] text-lg'}`}>
                {calcularPromedio(p)}
            </span>
        </div>
    </td>
</tr>
                    ))}
                </tbody>
            </table>

        </div>
    )}

    {scoreBreakdownModal.isOpen && scoreBreakdownModal.profile && scoreBreakdownModal.category && (() => {
        const breakdown = getScoreBreakdownByCategory(scoreBreakdownModal.profile.firebaseId, scoreBreakdownModal.category);
        return (
            <div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setScoreBreakdownModal({ isOpen: false, profile: null, category: null })}
            >
                <div
                    className="w-full max-w-3xl theme-surface-card border theme-border-secondary rounded-2xl p-6"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                            <h3 className="font-title text-xl font-black text-white tracking-wide">
                                {scoreBreakdownModal.profile.nombre} · {scoreBreakdownModal.category}
                            </h3>
                            <p className="text-xs text-slate-300 mt-1">
                                Detalle de enfrentamientos ganados y perdidos.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setScoreBreakdownModal({ isOpen: false, profile: null, category: null })}
                            className="btn-metal btn-metal--silver px-3 py-2 rounded-lg text-[10px] font-black"
                        >
                            Cerrar
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 min-h-44">
                            <h4 className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300 mb-3">Ganó contra</h4>
                            {breakdown.wins.length ? (
                                <ul className="space-y-2">
                                    {breakdown.wins.map((name, idx) => (
                                        <li key={`win-${name}-${idx}`} className="text-sm text-emerald-200 font-semibold">{name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-emerald-200/70">No hay batallas ganadas registradas.</p>
                            )}
                        </div>

                        <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 min-h-44">
                            <h4 className="text-xs font-black uppercase tracking-[0.16em] text-rose-300 mb-3">Perdió contra</h4>
                            {breakdown.losses.length ? (
                                <ul className="space-y-2">
                                    {breakdown.losses.map((name, idx) => (
                                        <li key={`loss-${name}-${idx}`} className="text-sm text-rose-200 font-semibold">{name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-rose-200/70">No hay batallas perdidas registradas.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    })()}

    {/* 4. VISTA CATEGORÍAS (TUS CARPETAS MANUALES) */}
    {activeTab === 'CATEGORIAS' && !selectedCategory && (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Carpetas</h2>
                </div>
                <button onClick={() => { resetCatForm(); setIsCatModalOpen(true); }} className="btn-metal btn-metal--gold px-8 py-3 rounded-xl text-xs">
                    NUEVA CATEGORÍA
                </button>
            </div>
            {categorias.length === 0 ? (
                <div className="py-20 border-2 border-dashed theme-border-secondary rounded-2xl text-center">
                    <p className="text-slate-600 font-black italic uppercase">No hay categorías personalizadas</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
{categorias.map(cat => (
<div key={cat.firebaseId} onClick={() => setSelectedCategory(cat.firebaseId)} className="group relative bg-[linear-gradient(180deg,#0b1222_0%,#050a16_100%)] rounded-xl overflow-hidden border theme-border-secondary cursor-pointer hover:border-[var(--metal-gold)]/70 transition-all duration-500 shadow-[inset_0_1px_0_rgba(148,163,184,0.2),0_18px_30px_rgba(2,6,23,0.55)] aspect-[3/4]">
        {/* BOTONES DE ACCIÓN: EDITAR Y ELIMINAR */}
        <div className="absolute top-5 right-5 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
    onClick={(e) => {
        e.stopPropagation();
        // Preparamos los datos asegurándonos de que las listas existan (si no, ponemos [])
        setCatFormData({
            ...cat,
            reglas: {
                ...cat.reglas,
                nacionalidades: cat.reglas?.nacionalidades || [],
                profesiones: cat.reglas?.profesiones || [],
                ciudades: cat.reglas?.ciudades || []
            }
        });
        setIsCatModalOpen(true); // Abrimos el modal
    }}
    className="w-8 h-8 flex items-center justify-center bg-slate-900/95 hover:bg-[var(--metal-bronze)] text-white rounded-lg border theme-border-secondary transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_16px_rgba(2,6,23,0.45)]"
>
    <LucideIcon name="pencil" size={14} />
</button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm('¿Seguro que querés borrar esta carpeta?')) {
                        deleteCategory(cat.firebaseId);
                    }
                }}
                className="w-8 h-8 flex items-center justify-center bg-slate-900/95 hover:bg-red-600 text-white rounded-lg border theme-border-secondary transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_16px_rgba(2,6,23,0.45)]"
            >
                <LucideIcon name="x" size={14} />
            </button>
        </div>

        {/* Imagen de Portada */}
        <div className="absolute inset-0">
            <img
                src={getSafeImageSrc(cat.coverImg, 'https://via.placeholder.com/400x600?text=Sin+Portada')}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                onError={applyCryingEmojiFallback}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
        </div>

        {/* Contenido (Nombre y Contador) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2 drop-shadow-lg">
                {cat.label}
            </h3>
            <div className="inline-flex items-center gap-2 bg-[var(--metal-bronze)]/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-[color:color-mix(in_srgb,var(--metal-gold)_30%,transparent)]">
                <span className="text-[10px] font-black uppercase text-[var(--metal-gold)] tracking-widest">
                    {perfiles.filter(p => obtenerCategoriasDePerfil(p).includes(cat.firebaseId)).length} Perfiles
                </span>
            </div>
        </div>
    </div>
))}
                </div>
            )}
        </div>
    )}
</div>
                    </main>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
                            <div className="bg-[linear-gradient(180deg,#0b1222_0%,#050a16_100%)] w-full max-w-2xl rounded-3xl overflow-hidden shadow-[inset_0_1px_0_rgba(148,163,184,0.22),0_24px_60px_rgba(2,6,23,0.65)] border theme-border-secondary max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-300">
                               <button
    onClick={() => setIsModalOpen(false)}
    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
>
    <LucideIcon name="x" size={20} className="text-slate-400" />
</button>
                                <form onSubmit={saveProfile} className="flex-1 overflow-y-auto p-12 space-y-12">

                                    <div className="grid grid-cols-1 gap-16">
    <div className="space-y-8">
        {/* CABECERA Y VISTA PREVIA */}
        <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 self-start">

                <div className="w-12 h-12 bg-[var(--metal-bronze)] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-900/50">
                    <LucideIcon name={editingId ? "user" : "user-plus"} />
                </div>
                <h3 className="text-xl font-black italic tracking-tighter text-white">
                    {editingId ? 'Editar Perfil' : 'Información del Perfil'}
                </h3>
                {editingId && (
                    <button
    type="button"
    onClick={() => {
        const existingWindow = galleryWindowRef.current;
        const nuevaVentana = existingWindow && !existingWindow.closed ? existingWindow : window.open('', '_blank');
        galleryWindowRef.current = nuevaVentana;
        renderGalleryWindow({
            targetWindow: nuevaVentana,
            profileName: formData.nombre,
            profession: formData.profesion,
            photos: [
                ...(formData.galeria?.fotos || []).map((item, index) => ({ ...normalizeGalleryItem(item, 'image'), sourceTag: 'fotos', sourceIndex: index })),
                ...(formData.galeria?.videos || []).map((item, index) => ({ ...normalizeGalleryItem(item, 'video'), sourceTag: 'videos', sourceIndex: index }))
            ],
            editingId,
            battlePhotoPrefs: formData.batallaFotosPreferidas
        });
        nuevaVentana.focus();
    }}
    className="btn-metal btn-metal--gold ml-4 px-4 py-2 rounded-xl text-[10px] flex items-center gap-2"
>
    <LucideIcon name="image" size={14} />
    Ver Galería
</button>
                )}
            </div>

            {/* CUADRO VISTA PREVIA NEÓN */}
            <div className="w-48 h-60 rounded-2xl border-2 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.4)] overflow-hidden bg-slate-900 flex items-center justify-center relative group">
                {formData.fotos.length > 0 && formData.fotos[0] !== "" ? (
                    <img src={getSafeImageSrc(formData.fotos[0], CRYING_EMOJI_FALLBACK)} className="w-full h-full object-cover" alt="Preview" onError={applyCryingEmojiFallback} />
                ) : (
                    <div className="text-center p-4">
                        <LucideIcon name="image" size={32} className="mx-auto text-slate-700 mb-2" />
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Vista Previa</p>
                    </div>
                )}
            </div>
            {editingId && urlInput.trim() && (
                <div className="w-48">
                    <p className="mb-2 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--metal-gold)]/80">Preview galería</p>
                    <div className="relative h-32 overflow-hidden rounded-[1.5rem] border border-[color:color-mix(in_srgb,var(--metal-gold)_40%,transparent)] bg-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                        {galleryMediaType === 'video' ? (() => {
                            const embedInfo = getVideoEmbedInfo(urlInput);
                            if (embedInfo) {
                                return (
                                    <div className="w-full h-full bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.28),_rgba(15,23,42,0.96))] flex flex-col items-center justify-center gap-2 text-center px-4">
                                        <div className="w-10 h-10 rounded-full border border-[var(--metal-gold)]/40 bg-slate-950/70 flex items-center justify-center text-[color:color-mix(in_srgb,var(--metal-gold)_72%,white)] text-lg">▶</div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">{embedInfo.provider}</p>
                                    </div>
                                );
                            }
                            return <video src={urlInput} className="w-full h-full object-cover" muted playsInline preload="metadata" />;
                        })() : <img src={getSafeImageSrc(urlInput, CRYING_EMOJI_FALLBACK)} className="w-full h-full object-cover" alt="Preview galería" onError={applyCryingEmojiFallback} />}
                        {(() => {
                            const labelStyle = getGalleryLabelStyle(galleryLabel);
                            return (
                                <div
                                    className="absolute bottom-3 left-1/2 flex min-w-[3.25rem] -translate-x-1/2 items-center justify-center rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.35em] backdrop-blur-md"
                                    style={{
                                        background: labelStyle.bg,
                                        borderColor: labelStyle.border,
                                        color: labelStyle.text,
                                        boxShadow: `0 0 14px ${labelStyle.glow}, 0 0 24px ${labelStyle.glow}`,
                                        textShadow: `0 0 10px ${labelStyle.glow}`
                                    }}
                                >
                                    {galleryLabel}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>

        {/* CAMPOS DE TEXTO */}
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/20 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Datos actuales</p>
                    {profileCompletionRows.completed.length > 0 ? (
                        <ul className="mt-3 space-y-1">
                            {profileCompletionRows.completed.map((row) => (
                                <li key={row.key} className="text-xs text-emerald-100/90">
                                    <span className="font-black">{row.label}:</span> {row.preview}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-3 text-xs text-emerald-100/70">Todavía no hay datos cargados.</p>
                    )}
                </div>
                <div className="rounded-2xl border border-amber-300/30 bg-amber-950/20 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">Datos faltantes por completar</p>
                    {profileCompletionRows.missing.length > 0 ? (
                        <ul className="mt-3 space-y-1">
                            {profileCompletionRows.missing.map((row) => (
                                <li key={row.key} className="text-xs text-amber-100/90">
                                    <span className="font-black">{row.label}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-3 text-xs text-amber-100/70">¡Perfil completo en esta sección!</p>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Nombre Artístico" className="col-span-2 w-full theme-surface-soft border theme-border-secondary p-5 rounded-xl outline-none focus:ring-2 focus:ring-[var(--glow-gold)] text-white font-bold" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />

                <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-black text-slate-500 ml-4 uppercase">URL de la Foto (Avatar)</label>
                    <input
                        placeholder="https://imagen.com/foto.jpg"
                        className="w-full theme-surface-soft border theme-border-secondary p-5 rounded-xl outline-none focus:ring-2 focus:ring-[var(--glow-gold)] text-white font-bold text-xs"
                        value={formData.fotos[0] || ''}
                        onChange={e => setFormData({...formData, fotos: [e.target.value]})}
                    />
                    <input
                        type="file"
                        accept="image/*,.gif"
                        onChange={handleLocalProfilePhotoUpload}
                        className="w-full theme-surface-soft border border-dashed theme-border-secondary p-4 rounded-xl outline-none text-slate-200 font-semibold text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-2 file:text-cyan-200 file:font-black"
                    />
                </div>

                {editingId && (
                    <div className="col-span-2 space-y-2">
                        <label className="text-[9px] font-black text-slate-500 ml-4 uppercase">URL para sumar a la galería</label>
                        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.7fr)_minmax(190px,0.8fr)]">
                            <input
                                placeholder={galleryMediaType === 'video' ? "https://video.com/video.mp4 o https://youtube.com/..." : "https://imagen.com/galeria.jpg"}
                                className="min-w-0 theme-surface-soft border theme-border-secondary p-5 rounded-xl outline-none focus:ring-2 focus:ring-[var(--glow-gold)] text-white font-bold text-xs"
                                value={urlInput}
                                onChange={e => setUrlInput(e.target.value)}
                            />
                            <select
                                value={galleryMediaType}
                                onChange={e => setGalleryMediaType(e.target.value)}
                                className="w-full theme-surface-soft border theme-border-secondary px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-[var(--glow-gold)] text-white font-black text-xs uppercase tracking-[0.25em]"
                            >
                                <option value="image">Imagen</option>
                                <option value="video">Video</option>
                            </select>
                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_minmax(210px,auto)]">
                                <select
                                    value={galleryLabel}
                                    onChange={e => setGalleryLabel(e.target.value)}
                                    className="w-full theme-surface-soft border theme-border-secondary px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-[var(--glow-gold)] text-white font-black text-xs uppercase tracking-[0.25em]"
                                >
                                    {GALLERY_LABELS.map(label => (
                                        <option key={label} value={label}>Etiqueta {label}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => submitGalleryImage({ successMessage: '¡Foto guardada! Sos un genio.' })}
                                    className="btn-metal btn-metal--gold w-full sm:w-auto px-6 py-4 rounded-xl text-[10px] sm:min-w-[210px]"
                                >
                                    Guardar en galería
                                </button>
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*,video/*,.gif"
                            onChange={handleLocalGalleryFileUpload}
                            className="w-full theme-surface-soft border border-dashed theme-border-secondary p-4 rounded-xl outline-none text-slate-200 font-semibold text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-2 file:text-cyan-200 file:font-black"
                        />
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 ml-4 uppercase">Nacimiento</label>
                    <input type="date" className="w-full theme-surface-soft border theme-border-secondary p-5 rounded-xl outline-none text-white font-bold" value={formData.fechaNacimiento} onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 ml-4 uppercase">Estatura (cm)</label>
                    <input placeholder="170" type="number" className="w-full theme-surface-soft border theme-border-secondary p-5 rounded-xl outline-none text-white font-bold" value={formData.estaturaCm} onChange={e => setFormData({...formData, estaturaCm: e.target.value})} />
                </div>
                <input placeholder="Nacionalidad" className="w-full theme-surface-soft border theme-border-secondary p-5 rounded-xl outline-none text-white font-bold" value={formData.nacionalidad} onChange={e => setFormData({...formData, nacionalidad: e.target.value})} />
                <input placeholder="Ciudad" className="w-full theme-surface-soft border theme-border-secondary p-5 rounded-xl outline-none text-white font-bold" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} />

                <div className="col-span-2 space-y-1 group">
                    <label className="text-[9px] font-black text-[var(--metal-gold)]/60 ml-4 uppercase tracking-widest transition-colors group-focus-within:text-[var(--metal-gold)]">
                        Profesión
                    </label>
                    <select
                        required
                        className="w-full theme-surface-soft border theme-border-secondary p-5 rounded-xl outline-none text-white font-bold appearance-none cursor-pointer transition-all duration-300 focus:border-[var(--metal-gold)] focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] focus:bg-slate-900"
                        value={formData.profesion}
                        onChange={e => setFormData({...formData, profesion: e.target.value})}
                    >
                        <option value="" className="theme-surface-card">Seleccionar...</option>
                        <option value="Cantante" className="theme-surface-card">🎤 Cantante</option>
                        <option value="Actriz" className="theme-surface-card">🎬 Actriz</option>
                        <option value="Modelo" className="theme-surface-card">👠 Modelo</option>
                        <option value="NSFW" className="theme-surface-card">🔥 NSFW</option>
                        <option value="Influencer" className="theme-surface-card">📱 Influencer</option>
                        <option value="Periodista" className="theme-surface-card">👓 Periodista</option>
                        <option value="Bailarina" className="theme-surface-card">💃 Bailarina</option>
                        <option value="Atleta" className="theme-surface-card">🏋️‍♀️ Atleta</option>
                        <option value="Otro" className="theme-surface-card">📖 Otro</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--metal-gold)]/50">
                        <LucideIcon name="chevron-down" size={18} />
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
                                    <div className="flex gap-4">
                                        {editingId && (
                                            <button type="button" onClick={deleteProfile} className="btn-metal btn-metal--danger px-10 py-8 rounded-xl text-xs">
                                                <LucideIcon name="trash-2" size={20} />
                                            </button>
                                        )}
                                        <button type="submit" className="btn-metal btn-metal--gold flex-1 py-8 rounded-xl text-xs">
                                            {editingId ? 'Actualizar Registro' : 'Guardar Perfil'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {isDeleteProfileModalOpen && (
                        <div className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-6" onClick={closeDeleteProfileModal}>
                            <div className="w-full max-w-xl theme-surface-card border theme-border-secondary rounded-3xl p-8 space-y-6" onClick={(event) => event.stopPropagation()}>
                                <div className="space-y-3">
                                    <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Acción destructiva</p>
                                    <h3 className="text-2xl font-black italic text-white tracking-tight">¿Eliminar perfil?</h3>
                                    <p className="text-sm text-slate-300">
                                        Esta acción eliminará de forma permanente a <span className="font-black text-white">{contextProfile?.nombre || 'este perfil'}</span> y sus datos en Firebase. No se puede deshacer.
                                    </p>
                                    {profileActionError && (
                                        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-200">
                                            {profileActionError}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeDeleteProfileModal}
                                        className="btn-metal btn-metal--silver px-6 py-3 rounded-xl text-[10px]"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmDeleteFromContext}
                                        className="btn-metal btn-metal--danger px-6 py-3 rounded-xl text-[10px]"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isCatModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
                            <div className="bg-[linear-gradient(180deg,#0b1222_0%,#050a16_100%)] w-full max-w-5xl rounded-3xl overflow-hidden shadow-[inset_0_1px_0_rgba(148,163,184,0.22),0_24px_60px_rgba(2,6,23,0.65)] border theme-border-secondary max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-300">
                                <button
    type="button"
    onClick={() => { resetCatForm(); setIsCatModalOpen(false); }}
    className="p-4 hover:bg-slate-800 rounded-full transition-all"
>
    <LucideIcon name="x" size={24} className="text-slate-400" />
</button>
                                <form onSubmit={saveCategory} className="flex-1 overflow-y-auto p-12 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[var(--metal-bronze)] rounded-2xl flex items-center justify-center text-white">
                                                    <LucideIcon name="scroll" />
                                                </div>
                                                <h3 className="text-xl font-black italic text-white">Nuevo Archivo del Reino</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <input required placeholder="Nombre de la Carpeta" className="w-full theme-surface-soft border theme-border-secondary p-5 rounded-xl outline-none font-bold text-lg text-white" value={catFormData.label} onChange={e => setCatFormData({...catFormData, label: e.target.value})} />
                                                <div className="w-full">
                                                    <div className="space-y-1 w-full">
                                                        <label className="text-[9px] font-black text-slate-500 ml-4 uppercase">URL de Portada</label>
                                                        <input
                                                            placeholder="https://..."
                                                            className="w-full theme-surface-soft border theme-border-secondary p-5 rounded-xl outline-none text-white font-bold text-xs"
                                                            value={catFormData.coverImg}
                                                            onChange={e => setCatFormData({...catFormData, coverImg: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                                <LucideIcon name="shield" size={12} /> Mandatos de Clasificación del Consejo
                                            </h4>

                                            <div className="p-8 bg-slate-950/50 border theme-border-secondary rounded-2xl space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
{/* Filtro Nacionalidades Acumulable */}
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-500 ml-4 uppercase">NACIONALIDADES</label>
                                                        <div className="flex flex-wrap gap-1 mb-2 min-h-[20px]">
                                                            {catFormData.reglas.nacionalidades.map(n => (
                                                                <span key={n} className="bg-[var(--metal-bronze)]/20 text-[var(--metal-gold)] text-[8px] font-black px-2 py-1 rounded-full border border-[color:color-mix(in_srgb,var(--metal-gold)_30%,transparent)] flex items-center gap-1">
                                                                    {n} <button type="button" onClick={() => setCatFormData({...catFormData, reglas: {...catFormData.reglas, nacionalidades: catFormData.reglas.nacionalidades.filter(x => x !== n)}})}>×</button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <select className="w-full theme-surface-card p-3 rounded-xl text-[10px] font-bold border theme-border-secondary text-white outline-none"
                                                            onChange={e => {
                                                                if(e.target.value && !catFormData.reglas.nacionalidades.includes(e.target.value))
                                                                    setCatFormData({...catFormData, reglas: {...catFormData.reglas, nacionalidades: [...catFormData.reglas.nacionalidades, e.target.value]}})
                                                            }}>
                                                            <option value="">Añadir país...</option>
                                                            {uniqueNacionalidades.filter(n => n !== 'Todas').map(n => <option key={n} value={n}>{n}</option>)}
                                                        </select>
                                                    </div>

                                                    {/* Filtro Ciudades Acumulable */}
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-500 ml-4 uppercase">CIUDADES</label>
                                                        <div className="flex flex-wrap gap-1 mb-2 min-h-[20px]">
                                                            {catFormData.reglas.ciudades.map(c => (
                                                                <span key={c} className="bg-[var(--metal-bronze)]/20 text-[var(--metal-gold)] text-[8px] font-black px-2 py-1 rounded-full border border-[color:color-mix(in_srgb,var(--metal-gold)_30%,transparent)] flex items-center gap-1">
                                                                    {c} <button type="button" onClick={() => setCatFormData({...catFormData, reglas: {...catFormData.reglas, ciudades: catFormData.reglas.ciudades.filter(x => x !== c)}})}>×</button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <select className="w-full theme-surface-card p-3 rounded-xl text-[10px] font-bold border theme-border-secondary text-white outline-none"
                                                            onChange={e => {
                                                                if(e.target.value && !catFormData.reglas.ciudades.includes(e.target.value))
                                                                    setCatFormData({...catFormData, reglas: {...catFormData.reglas, ciudades: [...catFormData.reglas.ciudades, e.target.value]}})
                                                            }}>
                                                            <option value="">Añadir ciudad...</option>
                                                            {uniqueCiudades.filter(c => c !== 'Todas').map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    </div>

                                                    {/* Filtro Profesiones Acumulable */}
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-500 ml-4 uppercase">PROFESIONES</label>
                                                        <div className="flex flex-wrap gap-1 mb-2 min-h-[20px]">
                                                            {catFormData.reglas.profesiones.map(p => (
                                                                <span key={p} className="bg-[var(--metal-bronze)]/20 text-[var(--metal-gold)] text-[8px] font-black px-2 py-1 rounded-full border border-[color:color-mix(in_srgb,var(--metal-gold)_30%,transparent)] flex items-center gap-1">
                                                                    {p} <button type="button" onClick={() => setCatFormData({...catFormData, reglas: {...catFormData.reglas, profesiones: catFormData.reglas.profesiones.filter(x => x !== p)}})}>×</button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <select className="w-full theme-surface-card p-3 rounded-xl text-[10px] font-bold border theme-border-secondary text-white outline-none"
                                                            onChange={e => {
                                                                if(e.target.value && !catFormData.reglas.profesiones.includes(e.target.value))
                                                                    setCatFormData({...catFormData, reglas: {...catFormData.reglas, profesiones: [...catFormData.reglas.profesiones, e.target.value]}})
                                                            }}>
                                                            <option value="">Añadir profesión...</option>
                                                            {Object.keys(PROFESIONES_CONFIG).map(p => <option key={p} value={p}>{p}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black text-slate-500 ml-4 uppercase">EDAD MIN</label>
                                                            <input type="number" placeholder="18" className="w-full theme-surface-card p-4 rounded-2xl outline-none text-xs font-bold border theme-border-secondary text-white" value={catFormData.reglas.edadMin} onChange={e => setCatFormData({...catFormData, reglas: {...catFormData.reglas, edadMin: e.target.value}})} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black text-slate-500 ml-4 uppercase">EDAD MAX</label>
                                                            <input type="number" placeholder="30" className="w-full theme-surface-card p-4 rounded-2xl outline-none text-xs font-bold border theme-border-secondary text-white" value={catFormData.reglas.edadMax} onChange={e => setCatFormData({...catFormData, reglas: {...catFormData.reglas, edadMax: e.target.value}})} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 pt-4 border-t theme-border-secondary">
                                                    <label className="text-[9px] font-black text-slate-500 ml-4 uppercase">Condición de Score</label>
                                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                                        <select className="theme-surface-card p-3 rounded-xl text-[10px] font-bold outline-none border theme-border-secondary text-white" value={catFormData.reglas.caracteristica} onChange={e => setCatFormData({...catFormData, reglas: {...catFormData.reglas, caracteristica: e.target.value}})}>
                                                            {CARACTERISTICAS.map(c => <option key={c}>{c}</option>)}
                                                        </select>
                                                        <select className="theme-surface-card p-3 rounded-xl text-[10px] font-bold outline-none border theme-border-secondary text-white" value={catFormData.reglas.operador} onChange={e => setCatFormData({...catFormData, reglas: {...catFormData.reglas, operador: e.target.value}})}>
                                                            <option>Superior a</option>
                                                            <option>Inferior a</option>
                                                        </select>
                                                    </div>
                                                    <input type="number" placeholder="Umbral (0-10)" className="w-full theme-surface-card p-4 rounded-2xl outline-none text-xs font-bold border theme-border-secondary text-[var(--metal-gold)]" value={catFormData.reglas.umbral} onChange={e => setCatFormData({...catFormData, reglas: {...catFormData.reglas, umbral: e.target.value}})} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-metal btn-metal--gold w-full py-8 rounded-xl text-xs">
                                        CREAR CARPETA INTELIGENTE
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
