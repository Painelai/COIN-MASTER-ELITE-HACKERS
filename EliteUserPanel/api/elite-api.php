<?php
/**
 * ELITE CORE API - v2.0 (Full SQL Integration)
 * Protocolo Jarvis - Backend Unificado
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configurações do Banco
define('DB_TYPE', 'sqlite'); 
define('SQLITE_FILE', 'elite_core_v2.db');

try {
    $dbPath = __DIR__ . '/' . SQLITE_FILE;
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // 1. Tabela de Usuários
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        pass VARCHAR(255) NOT NULL,
        balance DECIMAL(10,2) DEFAULT 0.0,
        plan VARCHAR(50) DEFAULT 'FREE',
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // 2. Tabela de Configurações Dinâmicas (CMS/Config)
    $pdo->exec("CREATE TABLE IF NOT EXISTS core_storage (
        key_name VARCHAR(100) PRIMARY KEY,
        data_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // 3. Tabela de Logs de Auditoria
    $pdo->exec("CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action VARCHAR(100),
        details TEXT,
        severity VARCHAR(20),
        timestamp INTEGER
    )");

    // Injeção de Usuário Padrão
    $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE email = 'user' LIMIT 1");
    $stmtCheck->execute();
    if (!$stmtCheck->fetch()) {
        $pdo->exec("INSERT OR IGNORE INTO users (email, pass, balance, plan, status) VALUES ('user', 'user', 1250.00, 'VITALÍCIO ELITE', 'ACTIVE')");
    }

} catch (Exception $e) {
    http_response_code(500);
    die(json_encode(['success' => false, 'error' => 'DB_FAIL', 'debug' => $e->getMessage()]));
}

$action = $_GET['action'] ?? '';
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

switch($action) {
    case 'login':
        $email = strtolower(trim($input['email'] ?? ''));
        $pass = $input['pass'] ?? '';
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND pass = ?");
        $stmt->execute([$email, $pass]);
        $user = $stmt->fetch();
        if ($user) {
            echo json_encode([
                'success' => true,
                'data' => [
                    'user' => ['balance' => (float)$user['balance'], 'plan' => $user['plan'], 'email' => $user['email']],
                    'tools' => [['id' => 'bundle', 'name' => 'Elite Pass', 'status' => 'STABLE']]
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Credenciais inválidas.']);
        }
        break;

    case 'get_storage':
        $key = $_GET['key'] ?? '';
        $stmt = $pdo->prepare("SELECT data_value FROM core_storage WHERE key_name = ?");
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        echo json_encode(['success' => true, 'data' => $row ? json_decode($row['data_value']) : null]);
        break;

    case 'save_storage':
        $key = $input['key'] ?? '';
        $data = json_encode($input['data'] ?? []);
        $stmt = $pdo->prepare("INSERT OR REPLACE INTO core_storage (key_name, data_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)");
        $stmt->execute([$key, $data]);
        echo json_encode(['success' => true]);
        break;

    case 'add_log':
        $stmt = $pdo->prepare("INSERT INTO system_logs (action, details, severity, timestamp) VALUES (?, ?, ?, ?)");
        $stmt->execute([$input['action'], $input['details'], $input['severity'], time()]);
        echo json_encode(['success' => true]);
        break;

    case 'get_logs':
        $stmt = $pdo->query("SELECT * FROM system_logs ORDER BY id DESC LIMIT 100");
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        break;

    default:
        echo json_encode(['success' => true, 'status' => 'Elite Core API v2.0 Online']);
}
?>