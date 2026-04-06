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
	"github.com/gofiber/websocket/v2"
)

// TaskRequest estructura para solicitudes de tareas
type TaskRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    string `json:"priority,omitempty"`
	Deadline    string `json:"deadline,omitempty"`
}

// ─── WebSocket Hub ──────────────────────────────────────────
// Hub centralizado que mantiene todas las conexiones WS activas
// y hace broadcast de eventos Redis → todos los clientes.

type WSClient struct {
	conn *websocket.Conn
	send chan []byte
}

type WSHub struct {
	clients    map[*WSClient]bool
	broadcast  chan []byte
	register   chan *WSClient
	unregister chan *WSClient
	mu         sync.RWMutex
}

func newWSHub() *WSHub {
	return &WSHub{
		clients:    make(map[*WSClient]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *WSClient),
		unregister: make(chan *WSClient),
	}
}

// run es el loop principal del hub — se ejecuta en su propia goroutine.
func (h *WSHub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			count := len(h.clients)
			h.mu.Unlock()
			log.Printf("🔌 WebSocket cliente conectado (total: %d)", count)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			count := len(h.clients)
			h.mu.Unlock()
			log.Printf("🔌 WebSocket cliente desconectado (total: %d)", count)

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					// Buffer lleno — descartar cliente
					h.mu.RUnlock()
					h.mu.Lock()
					delete(h.clients, client)
					close(client.send)
					h.mu.Unlock()
					h.mu.RLock()
				}
			}
			h.mu.RUnlock()
		}
	}
}

// clientCount retorna la cantidad de clientes conectados.
func (h *WSHub) clientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// ─── Variables globales ─────────────────────────────────────

var (
	redisManager *RedisManager
	hub          *WSHub
	config       *Config
)

// ─── Main ───────────────────────────────────────────────────

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

	// Inicializar WebSocket Hub
	hub = newWSHub()
	go hub.run()

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

	// Iniciar suscripción a eventos Redis en goroutine
	go subscribeToRedisEvents()

	// Iniciar servidor
	addr := fmt.Sprintf("%s:%d", config.GatewayHost, config.GatewayPort)
	log.Printf("🚀 Gateway iniciando en %s", addr)

	if err := app.Listen(addr); err != nil {
		log.Fatalf("❌ Error iniciando servidor: %v", err)
	}
}

// ─── Routes ─────────────────────────────────────────────────

func setupRoutes(app *fiber.App) {
	app.Get("/health", healthCheck)
	app.Get("/", getRoot)

	// API Task — Proxy a AI Worker
	app.Post("/api/task", createTask)
	app.Get("/api/task/:id", getTask)
	app.Get("/api/tasks", listTasks)

	// WebSocket — upgrade middleware + handler
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	app.Get("/ws", websocket.New(wsHandler))

	// Test de eventos
	app.Post("/api/test-event", testEvent)
}

// ─── WebSocket handler ──────────────────────────────────────

func wsHandler(c *websocket.Conn) {
	// Crear cliente
	client := &WSClient{
		conn: c,
		send: make(chan []byte, 256),
	}

	// Registrar en el hub
	hub.register <- client

	// Goroutine de escritura: hub.broadcast → WS conn
	go func() {
		defer func() {
			c.Close()
		}()
		for msg := range client.send {
			if err := c.WriteMessage(websocket.TextMessage, msg); err != nil {
				break
			}
		}
	}()

	// Loop de lectura: mantiene la conexión viva y detecta cierre
	defer func() {
		hub.unregister <- client
		c.Close()
	}()

	for {
		// Leer mensajes del cliente (ping/pong, o simplemente detectar cierre)
		_, _, err := c.ReadMessage()
		if err != nil {
			break
		}
	}
}

// ─── Redis → WebSocket broadcast ────────────────────────────

func subscribeToRedisEvents() {
	log.Println("📻 Iniciando suscripción a Redis...")

	err := redisManager.SubscribeToEvents(config.EventChannel, func(event *AgentEvent) error {
		log.Printf("📤 Evento recibido de Redis: %s - %s", event.Agent, event.Action)

		// Serializar evento a JSON
		data, err := json.Marshal(event)
		if err != nil {
			log.Printf("⚠️  Error serializando evento: %v", err)
			return err
		}

		// Broadcast a todos los clientes WebSocket
		hub.broadcast <- data

		log.Printf("📡 Broadcast enviado a %d clientes WebSocket", hub.clientCount())
		return nil
	})

	if err != nil {
		log.Printf("❌ Error en suscripción Redis: %v", err)
	}
}

// ─── HTTP Handlers ──────────────────────────────────────────

func healthCheck(c *fiber.Ctx) error {
	redisConnected := redisManager.HealthCheck()
	return c.JSON(fiber.Map{
		"status":            "healthy",
		"timestamp":         time.Now().Format(time.RFC3339),
		"redis_connected":   redisConnected,
		"websocket_clients": hub.clientCount(),
	})
}

func getRoot(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"name":    "Agency Gateway",
		"version": "0.2.0",
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

func createTask(c *fiber.Ctx) error {
	var req TaskRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Title == "" || req.Description == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Title and description are required",
		})
	}

	taskData, _ := json.Marshal(req)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(
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

	body, _ := io.ReadAll(resp.Body)
	var aiWorkerResp map[string]interface{}
	json.Unmarshal(body, &aiWorkerResp)

	log.Printf("✅ Tarea enviada a AI Worker: task_id=%v", aiWorkerResp["task_id"])
	return c.Status(resp.StatusCode).JSON(aiWorkerResp)
}

func getTask(c *fiber.Ctx) error {
	taskID := c.Params("id")
	resp, err := http.Get(config.AIWorkerURL + "/api/task/" + taskID)
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

func testEvent(c *fiber.Ctx) error {
	var event AgentEvent
	if err := c.BodyParser(&event); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request",
		})
	}

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
