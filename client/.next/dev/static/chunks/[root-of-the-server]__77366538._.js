(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Hero
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Development/code/phase-5/nextgenfoodcourt/client/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$compiler$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Development/code/phase-5/nextgenfoodcourt/client/node_modules/react/compiler-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Development/code/phase-5/nextgenfoodcourt/client/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Development/code/phase-5/nextgenfoodcourt/client/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Development/code/phase-5/nextgenfoodcourt/client/node_modules/next/image.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Development/code/phase-5/nextgenfoodcourt/client/node_modules/next-themes/dist/index.mjs [client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module 'lucide-react'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const foodImages = [
    '/food-1.jpg',
    '/food-2.jpg',
    '/food-3.jpg',
    '/food-4.jpg'
];
function Hero() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$compiler$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["c"])(54);
    if ($[0] !== "4c6e7adbacc344cc184d68affbfc5a294e761507f41a5e386ff5e3e200fea4b6") {
        for(let $i = 0; $i < 54; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "4c6e7adbacc344cc184d68affbfc5a294e761507f41a5e386ff5e3e200fea4b6";
    }
    const [currentImageIndex, setCurrentImageIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isAutoPlay, setIsAutoPlay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { theme, setTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useTheme"])();
    let t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = ({
            "Hero[useEffect()]": ()=>{
                setMounted(true);
            }
        })["Hero[useEffect()]"];
        t1 = [];
        $[1] = t0;
        $[2] = t1;
    } else {
        t0 = $[1];
        t1 = $[2];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])(t0, t1);
    let t2;
    let t3;
    if ($[3] !== isAutoPlay) {
        t2 = ({
            "Hero[useEffect()]": ()=>{
                if (!isAutoPlay) {
                    return;
                }
                const interval = setInterval({
                    "Hero[useEffect() > setInterval()]": ()=>{
                        setCurrentImageIndex(_HeroUseEffectSetIntervalSetCurrentImageIndex);
                    }
                }["Hero[useEffect() > setInterval()]"], 5000);
                return ()=>clearInterval(interval);
            }
        })["Hero[useEffect()]"];
        t3 = [
            isAutoPlay
        ];
        $[3] = isAutoPlay;
        $[4] = t2;
        $[5] = t3;
    } else {
        t2 = $[4];
        t3 = $[5];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])(t2, t3);
    let t4;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = ({
            "Hero[goToImage]": (index)=>{
                setCurrentImageIndex(index);
                setIsAutoPlay(false);
            }
        })["Hero[goToImage]"];
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    const goToImage = t4;
    let t5;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = ({
            "Hero[nextImage]": ()=>{
                setCurrentImageIndex(_HeroNextImageSetCurrentImageIndex);
                setIsAutoPlay(false);
            }
        })["Hero[nextImage]"];
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    const nextImage = t5;
    let t6;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = ({
            "Hero[prevImage]": ()=>{
                setCurrentImageIndex(_HeroPrevImageSetCurrentImageIndex);
                setIsAutoPlay(false);
            }
        })["Hero[prevImage]"];
        $[8] = t6;
    } else {
        t6 = $[8];
    }
    const prevImage = t6;
    if (!mounted) {
        return null;
    }
    let t7;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-shrink-0",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/",
                className: "text-2xl font-bold text-primary",
                children: "Nextgen Food Court"
            }, void 0, false, {
                fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                lineNumber: 110,
                columnNumber: 41
            }, this)
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 110,
            columnNumber: 10
        }, this);
        $[9] = t7;
    } else {
        t7 = $[9];
    }
    let t8;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "hidden md:flex items-center gap-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/outlets",
                    className: "text-foreground hover:text-primary transition-colors",
                    children: "Outlets"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 117,
                    columnNumber: 61
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/menu",
                    className: "text-foreground hover:text-primary transition-colors",
                    children: "Menu"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 117,
                    columnNumber: 162
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/special-orders",
                    className: "text-foreground hover:text-primary transition-colors",
                    children: "Special Orders"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 117,
                    columnNumber: 257
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 117,
            columnNumber: 10
        }, this);
        $[10] = t8;
    } else {
        t8 = $[10];
    }
    let t9;
    if ($[11] !== setTheme || $[12] !== theme) {
        t9 = ({
            "Hero[<button>.onClick]": ()=>setTheme(theme === "dark" ? "light" : "dark")
        })["Hero[<button>.onClick]"];
        $[11] = setTheme;
        $[12] = theme;
        $[13] = t9;
    } else {
        t9 = $[13];
    }
    let t10;
    if ($[14] !== theme) {
        t10 = theme === "dark" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Sun, {
            className: "w-5 h-5 text-foreground"
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 135,
            columnNumber: 30
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Moon, {
            className: "w-5 h-5 text-foreground"
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 135,
            columnNumber: 76
        }, this);
        $[14] = theme;
        $[15] = t10;
    } else {
        t10 = $[15];
    }
    let t11;
    if ($[16] !== t10 || $[17] !== t9) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: t9,
            className: "p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors",
            "aria-label": "Toggle theme",
            children: t10
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 143,
            columnNumber: 11
        }, this);
        $[16] = t10;
        $[17] = t9;
        $[18] = t11;
    } else {
        t11 = $[18];
    }
    let t12;
    if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "hidden sm:flex items-center gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/login",
                    className: "px-4 py-2 text-foreground hover:text-primary transition-colors",
                    children: "Login"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 152,
                    columnNumber: 62
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/signup",
                    className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors",
                    children: "Sign Up"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 152,
                    columnNumber: 169
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 152,
            columnNumber: 11
        }, this);
        $[19] = t12;
    } else {
        t12 = $[19];
    }
    let t13;
    if ($[20] !== t11) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            className: "sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between h-16",
                    children: [
                        t7,
                        t8,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4",
                            children: [
                                t11,
                                t12
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                            lineNumber: 159,
                            columnNumber: 271
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 159,
                    columnNumber: 207
                }, this)
            }, void 0, false, {
                fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                lineNumber: 159,
                columnNumber: 151
            }, this)
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 159,
            columnNumber: 11
        }, this);
        $[20] = t11;
        $[21] = t13;
    } else {
        t13 = $[21];
    }
    let t14;
    if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4",
                    children: "Taste Africa, Savor Excellence"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 167,
                    columnNumber: 16
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-lg md:text-xl text-muted-foreground mb-4",
                    children: "Experience authentic African cuisines from 20+ premium outlets serving Ethiopian, Nigerian, Congolese, Kenyan and more."
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 167,
                    columnNumber: 131
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 167,
            columnNumber: 11
        }, this);
        $[22] = t14;
    } else {
        t14 = $[22];
    }
    let t15;
    if ($[23] === Symbol.for("react.memo_cache_sentinel")) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-2 h-2 bg-primary rounded-full"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 174,
                    columnNumber: 52
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "20+ outlets with diverse cuisines"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 174,
                    columnNumber: 103
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 174,
            columnNumber: 11
        }, this);
        $[23] = t15;
    } else {
        t15 = $[23];
    }
    let t16;
    if ($[24] === Symbol.for("react.memo_cache_sentinel")) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-2 h-2 bg-primary rounded-full"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 181,
                    columnNumber: 52
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "Fast delivery and table booking"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 181,
                    columnNumber: 103
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 181,
            columnNumber: 11
        }, this);
        $[24] = t16;
    } else {
        t16 = $[24];
    }
    let t17;
    if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-3 text-muted-foreground",
            children: [
                t15,
                t16,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-2 h-2 bg-primary rounded-full"
                        }, void 0, false, {
                            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                            lineNumber: 188,
                            columnNumber: 111
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Special orders and catering available"
                        }, void 0, false, {
                            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                            lineNumber: 188,
                            columnNumber: 162
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 188,
                    columnNumber: 70
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 188,
            columnNumber: 11
        }, this);
        $[25] = t17;
    } else {
        t17 = $[25];
    }
    let t18;
    if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: _HeroButtonOnClick,
            className: "flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ShoppingCart, {
                    className: "w-5 h-5"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 195,
                    columnNumber: 207
                }, this),
                "Add to Cart"
            ]
        }, void 0, true, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 195,
            columnNumber: 11
        }, this);
        $[26] = t18;
    } else {
        t18 = $[26];
    }
    let t19;
    if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col justify-center space-y-6 order-2 lg:order-1",
            children: [
                t14,
                t17,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col sm:flex-row gap-4 pt-6",
                    children: [
                        t18,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: _HeroButtonOnClick2,
                            className: "flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Calendar, {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                                    lineNumber: 202,
                                    columnNumber: 354
                                }, this),
                                "Book a Table"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                            lineNumber: 202,
                            columnNumber: 155
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 202,
                    columnNumber: 96
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 202,
            columnNumber: 11
        }, this);
        $[27] = t19;
    } else {
        t19 = $[27];
    }
    const t20 = foodImages[currentImageIndex] || "/placeholder.svg";
    const t21 = `Food carousel image ${currentImageIndex + 1}`;
    let t22;
    if ($[28] !== t20 || $[29] !== t21) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
            src: t20,
            alt: t21,
            fill: true,
            className: "object-cover transition-opacity duration-500",
            priority: true
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 211,
            columnNumber: 11
        }, this);
        $[28] = t20;
        $[29] = t21;
        $[30] = t22;
    } else {
        t22 = $[30];
    }
    let t23;
    if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 220,
            columnNumber: 11
        }, this);
        $[31] = t23;
    } else {
        t23 = $[31];
    }
    let t24;
    if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
        t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: prevImage,
            className: "absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-all",
            "aria-label": "Previous image",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: "w-6 h-6 text-white",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M15 19l-7-7 7-7"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 227,
                    columnNumber: 294
                }, this)
            }, void 0, false, {
                fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                lineNumber: 227,
                columnNumber: 204
            }, this)
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 227,
            columnNumber: 11
        }, this);
        $[32] = t24;
    } else {
        t24 = $[32];
    }
    let t25;
    if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
        t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: nextImage,
            className: "absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-all",
            "aria-label": "Next image",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: "w-6 h-6 text-white",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M9 5l7 7-7 7"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 234,
                    columnNumber: 291
                }, this)
            }, void 0, false, {
                fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                lineNumber: 234,
                columnNumber: 201
            }, this)
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 234,
            columnNumber: 11
        }, this);
        $[33] = t25;
    } else {
        t25 = $[33];
    }
    let t26;
    if ($[34] !== currentImageIndex) {
        t26 = foodImages.map({
            "Hero[foodImages.map()]": (_, index_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: {
                        "Hero[foodImages.map() > <button>.onClick]": ()=>goToImage(index_0)
                    }["Hero[foodImages.map() > <button>.onClick]"],
                    className: `h-3 rounded-full transition-all ${index_0 === currentImageIndex ? "w-8 bg-white" : "w-3 bg-white/50 hover:bg-white/75"}`,
                    "aria-label": `Go to image ${index_0 + 1}`
                }, index_0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 242,
                    columnNumber: 49
                }, this)
        }["Hero[foodImages.map()]"]);
        $[34] = currentImageIndex;
        $[35] = t26;
    } else {
        t26 = $[35];
    }
    let t27;
    if ($[36] !== t26) {
        t27 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2",
            children: t26
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 253,
            columnNumber: 11
        }, this);
        $[36] = t26;
        $[37] = t27;
    } else {
        t27 = $[37];
    }
    let t28;
    if ($[38] !== t22 || $[39] !== t27) {
        t28 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative h-96 md:h-[500px] lg:h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl",
            children: [
                t22,
                t23,
                t24,
                t25,
                t27
            ]
        }, void 0, true, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 261,
            columnNumber: 11
        }, this);
        $[38] = t22;
        $[39] = t27;
        $[40] = t28;
    } else {
        t28 = $[40];
    }
    const t29 = `w-2 h-2 rounded-full ${isAutoPlay ? "bg-primary animate-pulse" : "bg-muted"}`;
    let t30;
    if ($[41] !== t29) {
        t30 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t29
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 271,
            columnNumber: 11
        }, this);
        $[41] = t29;
        $[42] = t30;
    } else {
        t30 = $[42];
    }
    const t31 = isAutoPlay ? "Auto-playing" : "Paused";
    let t32;
    if ($[43] !== t31) {
        t32 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: t31
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 280,
            columnNumber: 11
        }, this);
        $[43] = t31;
        $[44] = t32;
    } else {
        t32 = $[44];
    }
    let t33;
    if ($[45] !== t30 || $[46] !== t32) {
        t33 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-4 flex items-center gap-2 text-sm text-muted-foreground",
            children: [
                t30,
                t32
            ]
        }, void 0, true, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 288,
            columnNumber: 11
        }, this);
        $[45] = t30;
        $[46] = t32;
        $[47] = t33;
    } else {
        t33 = $[47];
    }
    let t34;
    if ($[48] !== t28 || $[49] !== t33) {
        t34 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "relative w-full overflow-hidden",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center",
                    children: [
                        t19,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "order-1 lg:order-2",
                            children: [
                                t28,
                                t33
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                            lineNumber: 297,
                            columnNumber: 218
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                    lineNumber: 297,
                    columnNumber: 135
                }, this)
            }, void 0, false, {
                fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
                lineNumber: 297,
                columnNumber: 64
            }, this)
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 297,
            columnNumber: 11
        }, this);
        $[48] = t28;
        $[49] = t33;
        $[50] = t34;
    } else {
        t34 = $[50];
    }
    let t35;
    if ($[51] !== t13 || $[52] !== t34) {
        t35 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-background",
            children: [
                t13,
                t34
            ]
        }, void 0, true, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx",
            lineNumber: 306,
            columnNumber: 11
        }, this);
        $[51] = t13;
        $[52] = t34;
        $[53] = t35;
    } else {
        t35 = $[53];
    }
    return t35;
}
_s(Hero, "K37PzfrwcAgw0EgyMqdfe8gw0X0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = Hero;
async function _HeroButtonOnClick2() {
    ;
    try {
        const response_0 = await fetch("/api/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "book-table",
                timestamp: new Date()
            })
        });
        const result_0 = await response_0.json();
        console.log("Booking response:", result_0);
    } catch (t0) {
        const error_0 = t0;
        console.error("Booking error:", error_0);
    }
}
async function _HeroButtonOnClick() {
    ;
    try {
        const response = await fetch("/api/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "add-to-cart",
                timestamp: new Date()
            })
        });
        const result = await response.json();
        console.log("Cart response:", result);
    } catch (t0) {
        const error = t0;
        console.error("Cart error:", error);
    }
}
function _HeroPrevImageSetCurrentImageIndex(prev_1) {
    return (prev_1 - 1 + foodImages.length) % foodImages.length;
}
function _HeroNextImageSetCurrentImageIndex(prev_0) {
    return (prev_0 + 1) % foodImages.length;
}
function _HeroUseEffectSetIntervalSetCurrentImageIndex(prev) {
    return (prev + 1) % foodImages.length;
}
var _c;
__turbopack_context__.k.register(_c, "Hero");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/index.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Development/code/phase-5/nextgenfoodcourt/client/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$compiler$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Development/code/phase-5/nextgenfoodcourt/client/node_modules/react/compiler-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$src$2f$components$2f$hero$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Development/code/phase-5/nextgenfoodcourt/client/src/components/hero.jsx [client] (ecmascript)");
;
;
;
function Home() {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$compiler$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["c"])(2);
    if ($[0] !== "7c451de0bf6992c7038aa8ac34095582eb065bfb920fed6be420793f40f7489d") {
        for(let $i = 0; $i < 2; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7c451de0bf6992c7038aa8ac34095582eb065bfb920fed6be420793f40f7489d";
    }
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                    children: "Nextgen Food Court"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/index.js",
                    lineNumber: 13,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                    name: "description",
                    content: "Experience authentic African cuisines"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/index.js",
                    lineNumber: 13,
                    columnNumber: 45
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/index.js",
                    lineNumber: 13,
                    columnNumber: 120
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                    rel: "icon",
                    href: "/favicon.ico"
                }, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/index.js",
                    lineNumber: 13,
                    columnNumber: 190
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$src$2f$components$2f$hero$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/index.js",
                    lineNumber: 13,
                    columnNumber: 229
                }, this)
            ]
        }, void 0, true);
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    return t0;
}
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/index.js [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/index\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__77366538._.js.map