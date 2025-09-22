"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middleware
app.use(express_1.default.json());
// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'sporthub_admin',
    password: process.env.DB_PASS || '1234',
    database: process.env.DB_NAME || 'sporthubBD',
    port: 5432
};
// Rutas básicas
app.get('/', (req, res) => {
    res.json({
        message: 'SportHub Backend API',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        database: dbConfig,
        timestamp: new Date().toISOString()
    });
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Backend servidor ejecutándose en puerto ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`📊 Database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map