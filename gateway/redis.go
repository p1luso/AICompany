package main

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

// RedisManager maneja la conexión y suscripciones a Redis
type RedisManager struct {
	client *redis.Client
	ctx    context.Context
}

// AgentEvent estructura para los eventos de agentes
type AgentEvent struct {
	Agent     string                 `json:"agent"`
	Action    string                 `json:"action"`
	Message   string                 `json:"message"`
	Timestamp string                 `json:"timestamp"`
	TaskID    string                 `json:"task_id,omitempty"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

// NewRedisManager crea una nueva instancia del gestor de Redis
func NewRedisManager(redisURL string) (*RedisManager, error) {
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Printf("❌ Error parseando Redis URL: %v", err)
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	client := redis.NewClient(opt)

	// Test conexión
	if err := client.Ping(ctx).Err(); err != nil {
		log.Printf("❌ Error conectando a Redis: %v", err)
		return nil, err
	}

	log.Println("✅ Conectado a Redis exitosamente")

	return &RedisManager{
		client: client,
		ctx:    context.Background(),
	}, nil
}

// SubscribeToEvents se suscribe al canal de eventos y llama callback
func (rm *RedisManager) SubscribeToEvents(
	channel string,
	callback func(event *AgentEvent) error,
) error {
	pubsub := rm.client.Subscribe(rm.ctx, channel)
	defer pubsub.Close()

	log.Printf("📻 Suscrito al canal Redis: %s", channel)

	// Canal para recibir mensajes
	ch := pubsub.Channel()

	for msg := range ch {
		// Parsear el JSON del evento
		var event AgentEvent
		if err := json.Unmarshal([]byte(msg.Payload), &event); err != nil {
			log.Printf("⚠️  Error parseando evento: %v", err)
			continue
		}

		// Ejecutar callback
		if err := callback(&event); err != nil {
			log.Printf("⚠️  Error en callback: %v", err)
		}
	}

	return nil
}

// PublishEvent publica un evento a Redis (para testing)
func (rm *RedisManager) PublishEvent(channel string, event *AgentEvent) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}

	if err := rm.client.Publish(rm.ctx, channel, string(data)).Err(); err != nil {
		log.Printf("❌ Error publicando evento: %v", err)
		return err
	}

	return nil
}

// ─── Task Persistence ──────────────────────────────────────

// SaveTask guarda una tarea en Redis con TTL de 24h
func (rm *RedisManager) SaveTask(taskID string, data []byte) error {
	key := "task:" + taskID
	return rm.client.Set(rm.ctx, key, string(data), 24*time.Hour).Err()
}

// GetTask obtiene una tarea de Redis por ID
func (rm *RedisManager) GetTask(taskID string) (string, error) {
	key := "task:" + taskID
	return rm.client.Get(rm.ctx, key).Result()
}

// ListTasks retorna todas las tareas almacenadas en Redis
func (rm *RedisManager) ListTasks() ([]string, error) {
	keys, err := rm.client.Keys(rm.ctx, "task:*").Result()
	if err != nil {
		return nil, err
	}

	if len(keys) == 0 {
		return []string{}, nil
	}

	vals, err := rm.client.MGet(rm.ctx, keys...).Result()
	if err != nil {
		return nil, err
	}

	results := make([]string, 0, len(vals))
	for _, v := range vals {
		if s, ok := v.(string); ok {
			results = append(results, s)
		}
	}
	return results, nil
}

// UpdateTaskStatus actualiza el status de una tarea en Redis
func (rm *RedisManager) UpdateTaskStatus(taskID string, status string) error {
	raw, err := rm.GetTask(taskID)
	if err != nil {
		return err
	}

	var task map[string]interface{}
	if err := json.Unmarshal([]byte(raw), &task); err != nil {
		return err
	}

	task["status"] = status
	data, err := json.Marshal(task)
	if err != nil {
		return err
	}

	return rm.SaveTask(taskID, data)
}

// Close cierra la conexión a Redis
func (rm *RedisManager) Close() error {
	return rm.client.Close()
}

// HealthCheck verifica la conexión a Redis
func (rm *RedisManager) HealthCheck() bool {
	ctx, cancel := context.WithTimeout(rm.ctx, 5*time.Second)
	defer cancel()

	return rm.client.Ping(ctx).Err() == nil
}
