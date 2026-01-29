module.exports = [
"[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-dev-runtime", () => require("react/jsx-dev-runtime"));

module.exports = mod;
}),
"[externals]/react [external] (react, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react", () => require("react"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/react/jsx-runtime [external] (react/jsx-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-runtime", () => require("react/jsx-runtime"));

module.exports = mod;
}),
"[externals]/react-dom [external] (react-dom, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react-dom", () => require("react-dom"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Development/code/phase-5/nextgenfoodcourt/client/src/contexts/AuthContext.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
(()=>{
    const e = new Error("Cannot find module 'js-cookie'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module 'axios'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Development/code/phase-5/nextgenfoodcourt/client/node_modules/next/router.js [ssr] (ecmascript)");
;
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["createContext"])({});
const useAuth = ()=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useContext"])(AuthContext);
const AuthProvider = ({ children })=>{
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [token, setToken] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [initialized, setInitialized] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    // Initialize auth state
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const storedToken = Cookies.get('token');
        const storedUser = Cookies.get('user');
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                // Set axios default headers
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Clear invalid cookies
                Cookies.remove('token');
                Cookies.remove('user');
            }
        }
        setLoading(false);
        setInitialized(true);
    }, []);
    const login = async (email, password)=>{
        try {
            const sampleUsers = {
                'john@example.com': {
                    password: 'password123',
                    name: 'John Doe',
                    role: 'customer',
                    id: 1
                },
                'jane@example.com': {
                    password: 'password123',
                    name: 'Jane Smith',
                    role: 'customer',
                    id: 2
                },
                'customer@foodcourt.com': {
                    password: 'food123',
                    name: 'Demo Customer',
                    role: 'customer',
                    id: 3
                },
                'owner@burgerparadise.com': {
                    password: 'owner123',
                    name: 'Burger Paradise Owner',
                    role: 'owner',
                    id: 4
                },
                'pizza@mozzie.com': {
                    password: 'pizza123',
                    name: 'Mozzie Pizzeria',
                    role: 'owner',
                    id: 5
                },
                'owner@foodcourt.com': {
                    password: 'owner123',
                    name: 'Demo Restaurant Owner',
                    role: 'owner',
                    id: 6
                }
            };
            // Check if it's a sample user
            if (sampleUsers[email] && sampleUsers[email].password === password) {
                const sampleUser = sampleUsers[email];
                const fakeToken = `sample_token_${Date.now()}`;
                // Set cookies
                Cookies.set('token', fakeToken, {
                    expires: 7
                });
                Cookies.set('user', JSON.stringify(sampleUser), {
                    expires: 7
                });
                // Set state
                setToken(fakeToken);
                setUser(sampleUser);
                // Set axios header
                axios.defaults.headers.common['Authorization'] = `Bearer ${fakeToken}`;
                return {
                    success: true,
                    user: sampleUser
                };
            }
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });
            const { access_token, user } = response.data;
            // Set cookies
            Cookies.set('token', access_token, {
                expires: 7
            });
            Cookies.set('user', JSON.stringify(user), {
                expires: 7
            });
            // Set state
            setToken(access_token);
            setUser(user);
            // Set axios headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            return {
                success: true,
                user
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed. Use sample credentials.'
            };
        }
    };
    const register = async (name, email, password, role)=>{
        try {
            const demoUser = {
                id: Date.now(),
                name,
                email,
                role,
                created_at: new Date().toISOString()
            };
            Cookies.set('token', `demo_token_${Date.now()}`, {
                expires: 7
            });
            Cookies.set('user', JSON.stringify(demoUser), {
                expires: 7
            });
            setUser(demoUser);
            return {
                success: true,
                user: demoUser
            };
        // const response = await axios.post('http://localhost:5000/api/auth/register', {
        //   name,
        //   email,
        //   password,
        //   role
        // });
        // return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed'
            };
        }
    };
    const logout = ()=>{
        Cookies.remove('token');
        Cookies.remove('user');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        router.push('/login');
    };
    const isAuthenticated = ()=>{
        return !!user && !!token;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            token,
            login,
            register,
            logout,
            loading,
            initialized,
            isAuthenticated
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/contexts/AuthContext.js",
        lineNumber: 140,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/_app.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>App
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
(()=>{
    const e = new Error("Cannot find module 'bootstrap/dist/css/bootstrap.min.css'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$src$2f$contexts$2f$AuthContext$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Development/code/phase-5/nextgenfoodcourt/client/src/contexts/AuthContext.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$next$2d$themes__$5b$external$5d$__$28$next$2d$themes$2c$__esm_import$2c$__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2d$themes$29$__ = __turbopack_context__.i("[externals]/next-themes [external] (next-themes, esm_import, [project]/Development/code/phase-5/nextgenfoodcourt/client/node_modules/next-themes)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$next$2d$themes__$5b$external$5d$__$28$next$2d$themes$2c$__esm_import$2c$__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2d$themes$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$next$2d$themes__$5b$external$5d$__$28$next$2d$themes$2c$__esm_import$2c$__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2d$themes$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
function App({ Component, pageProps }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$next$2d$themes__$5b$external$5d$__$28$next$2d$themes$2c$__esm_import$2c$__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$node_modules$2f$next$2d$themes$29$__["ThemeProvider"], {
        attribute: "class",
        defaultTheme: "system",
        enableSystem: true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Development$2f$code$2f$phase$2d$5$2f$nextgenfoodcourt$2f$client$2f$src$2f$contexts$2f$AuthContext$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["AuthProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Component, {
                ...pageProps
            }, void 0, false, {
                fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/_app.js",
                lineNumber: 11,
                columnNumber: 7
            }, this)
        }, void 0, false, {
            fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/_app.js",
            lineNumber: 10,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Development/code/phase-5/nextgenfoodcourt/client/src/pages/_app.js",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f6ed3348._.js.map