package main

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config estructura para la configuración global
type Config struct {
	// Servidor
	GatewayHost string
	GatewayPort int

	// Redis
	RedisURL     string
	RedisHost    string
	RedisPort    int
	RedisDB      int
	EventChannel string

	// AI Worker
	AIWorkerURL string

	// Logging
	LogLevel string

	// WebSocket
	WSReadBufferSize  int
	WSWriteBufferSize int
}

// LoadConfig carga la configuración desde variables de entorno
func LoadConfig() *Config {
	// Intentar cargar .env (opcional)
	_ = godotenv.Load()

	return &Config{
		// Servidor
		GatewayHost: getEnv("GATEWAY_HOST", "0.0.0.0"),
		GatewayPort: getEnvInt("GATEWAY_PORT", 8000),

		// Redis
		RedisURL:     getEnv("REDIS_URL", "redis://redis:6379"),
		RedisHost:    getEnv("REDIS_HOST", "redis"),
		RedisPort:    getEnvInt("REDIS_PORT", 6379),
		RedisDB:      getEnvInt("REDIS_DB", 0),
		EventChannel: getEnv("REDIS_EVENTS_CHANNEL", "agency_events"),

		// AI Worker
		AIWorkerURL: getEnv("AI_WORKER_URL", "http://ai-worker:8001"),

		// Logging
		LogLevel: getEnv("LOG_LEVEL", "info"),

		// WebSocket
		WSReadBufferSize:  getEnvInt("WS_READ_BUFFER", 1024),
		WSWriteBufferSize: getEnvInt("WS_WRITE_BUFFER", 1024),
	}
}

// getEnv obtiene una variable de entorno con valor por defecto
func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}

// getEnvInt obtiene una variable de entorno como integer
func getEnvInt(key string, defaultVal int) int {
	valStr := getEnv(key, "")
	if val, err := strconv.Atoi(valStr); err == nil {
		return val
	}
	return defaultVal
}

// LogConfig imprime la configuración cargada
func (c *Config) LogConfig() {
	log.Printf("╔══════════════════════════════════════════╗")
	log.Printf("║      GATEWAY CONFIGURATION LOADED       ║")
	log.Printf("╠══════════════════════════════════════════╣")
	log.Printf("║ Host: %s:%d", c.GatewayHost, c.GatewayPort)
	log.Printf("║ Redis: %s", c.RedisURL)
	log.Printf("║ AI Worker: %s", c.AIWorkerURL)
	log.Printf("║ Log Level: %s", c.LogLevel)
	log.Printf("╚══════════════════════════════════════════╝")
}
