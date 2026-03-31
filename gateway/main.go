package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

// TaskRequest estructura para solicitudes de tareas
type TaskRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    string `json:"priority,omitempty"`
	Deadline    string `json:"deadline,omitempty"`
}

// WebSocketManager gestiona las conexiones WebSocket
type WebSocketManager struct {
	clients map[interface{}]bool
	mu      sync.RWMutex
}

var (
	redisManager *RedisManager
	wsManager    *WebSocketManager
	config       *Config
)

func init() {
	wsManager = &WebSocketManager{
		clients: make(map[interface{}]bool),
	}
}

func main() {
	// Cargar configuración
	config = LoadConfig()
	config.LogConfig()

	// Inicializar Redis
	var err error
	redisManager, err = NewRedisManager(config.RedisURL)
	if err != nil {
		log.Fatalf("❌ No se pudo conectar a Redis: %v", err)
	}
	defer redisManager.Close()

	// Crear aplicación Fiber
	app := fiber.New(fiber.Config{
		Prefork:       false,
		CaseSensitive: true,
	})

	// Middlewares
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH",
		AllowHeaders: "Origin,Content-Type,Accept",
	}))
	app.Use(logger.New())

	// Rutas
	setupRoutes(app)

	// Iniciar suscripción a eventos en goroutine
	go subscribeToRedisEvents()

	// Iniciar servidor
	addr := fmt.Sprintf("%s:%d", config.GatewayHost, config.GatewayPort)
	log.Printf("🚀 Gateway iniciando en %s", addr)

	if err := app.Listen(addr); err != nil {
		log.Fatalf("❌ Error iniciando servidor: %v", err)
	}
}

// setupRoutes configura todas las rutas
func setupRoutes(app *fiber.App) {
	// Health check
	app.Get("/health", healthCheck)

	// Raíz
	app.Get("/", getRoot)

	// API Task - Proxy a AI Worker
	app.Post("/api/task", createTask)
	app.Get("/api/task/:id", getTask)
	app.Get("/api/tasks", listTasks)

	// WebSocket
	app.Get("/ws", websocketHandler)

	// Test de eventos
	app.Post("/api/test-event", testEvent)
}

// healthCheck verifica el estado del gateway
func healthCheck(c *fiber.Ctx) error {
	redisConnected := redisManager.HealthCheck()

	return c.JSON(fiber.Map{
		"status":           "healthy",
		"timestamp":        time.Now().Format(time.RFC3339),
		"redis_connected":  redisConnected,
		"websocket_clients": len(wsManager.clients),
	})
}

// getRoot retorna info del servicio
func getRoot(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"name":    "Agency Gateway",
		"version": "0.1.0",
		"status":  "running",
		"endpoints": fiber.Map{
			"health":      "/health",
			"create_task": "POST /api/task",
			"get_task":    "GET /api/task/:id",
			"list_tasks":  "GET /api/tasks",
			"websocket":   "WebSocket /ws",
			"test_event":  "POST /api/test-event",
		},
	})
}

// createTask proxy a AI Worker
func createTask(c *fiber.Ctx) error {
	var req TaskRequest

	// Parsear request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validar campos requeridos
	if req.Title == "" || req.Description == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Title and description are required",
		})
	}

	// Crear JSON para enviar a AI Worker
	taskData, _ := json.Marshal(req)

	// Hacer request a AI Worker
	resp, err := http.Post(
		config.AIWorkerURL+"/api/task",
		"application/json",
		bytes.NewBuffer(taskData),
	)
	if err != nil {
		log.Printf("❌ Error conectando a AI Worker: %v", err)
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "AI Worker unavailable",
		})
	}
	defer resp.Body.Close()

	// Leer respuesta del AI Worker
	body, _ := io.ReadAll(resp.Body)

	// Parsear respuesta
	var aiWorkerResp map[string]interface{}
	json.Unmarshal(body, &aiWorkerResp)

	log.Printf("✅ Tarea enviada a AI Worker: task_id=%v", aiWorkerResp["task_id"])

	return c.Status(resp.StatusCode).JSON(aiWorkerResp)
}

// getTask obtiene estado de una tarea del AI Worker
func getTask(c *fiber.Ctx) error {
	taskID := c.Params("id")

	// Request a AI Worker
	resp, err := http.Get(config.AIWorkerURL + "/api/task/" + taskID)
	if err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "AI Worker unavailable",
		})
	}
	defer resp.Body.Close()

	// Leer respuesta
	body, _ := io.ReadAll(resp.Body)

	// Parsear JSON
	var result map[string]interface{}
	json.Unmarshal(body, &result)

	return c.Status(resp.StatusCode).JSON(result)
}

// listTasks lista todas las tareas
func listTasks(c *fiber.Ctx) error {
	resp, err := http.Get(config.AIWorkerURL + "/api/tasks")
	if err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "AI Worker unavailable",
		})
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result map[string]interface{}
	json.Unmarshal(body, &result)

	return c.Status(resp.StatusCode).JSON(result)
}

// websocketHandler maneja conexiones WebSocket
func websocketHandler(c *fiber.Ctx) error {
	// WebSocket requiere actualización a Fiber v3 o configuración especial con fasthttp
	// Por ahora, retornamos un error indicando que WebSocket no está disponible en esta versión
	log.Printf("⚠️  WebSocket requiere configuración especial con fasthttp")
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "WebSocket requiere actualización a Fiber v3 o configuración especial",
	})
}

// subscribeToRedisEvents suscribe a eventos y hace broadcast
func subscribeToRedisEvents() {
	log.Println("📻 Iniciando suscripción a Redis...")

	err := redisManager.SubscribeToEvents(config.EventChannel, func(event *AgentEvent) error {
		log.Printf("📤 Evento recibido: %s - %s", event.Agent, event.Action)

		// Broadcast a todos los clientes WebSocket
		broadcastEvent(event)

		return nil
	})

	if err != nil {
		log.Printf("❌ Error en suscripción: %v", err)
	}
}

// broadcastEvent envía un evento a todos los clientes WebSocket conectados
// Actualmente deshabilitado hasta que se implemente soporte WebSocket con fasthttp
func broadcastEvent(event *AgentEvent) {
	// WebSocket broadcast será implementado cuando se use Fiber v3 o fasthttp-websocket
	log.Printf("📡 Evento recibido (broadcast deshabilitado): %s - %s", event.Agent, event.Action)
}

// testEvent endpoint para test manual de eventos
func testEvent(c *fiber.Ctx) error {
	var event AgentEvent

	if err := c.BodyParser(&event); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request",
		})
	}

	// Enviar a Redis
	if err := redisManager.PublishEvent(config.EventChannel, &event); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to publish event",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"event":   event,
	})
}
