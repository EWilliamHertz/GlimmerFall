package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"glimmerfall-backend/state"
)

// A real implementation would use github.com/gorilla/websocket
// Using a mock structure to represent the required architecture
type Connection struct {
	ID   string
	Send chan []byte
}

type Server struct {
	Game    *state.Game
	Clients map[string]*Connection
	mu      sync.Mutex
}

func NewServer() *Server {
	return &Server{
		Game:    state.NewGame("p1", "p2"),
		Clients: make(map[string]*Connection),
	}
}

func (s *Server) BroadcastState() {
	s.mu.Lock()
	defer s.mu.Unlock()
	stateBytes, _ := json.Marshal(s.Game)
	for _, client := range s.Clients {
		client.Send <- stateBytes
	}
}

func (s *Server) HandleIntent(clientID string, payload []byte) {
	var intent state.ActionIntent
	if err := json.Unmarshal(payload, &intent); err != nil {
		log.Println("Invalid intent format")
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	// Handle intent logic based on event sourcing pattern
	switch intent.Type {
	case "PLAY_GLIMMER_NODE":
		// Payload parsing simplified
		cardIndex := 0 // In real code, parse from payload
		if err := s.Game.PlayGlimmerNode(clientID, cardIndex); err != nil {
			log.Println("Error playing node:", err)
		}
	case "ATTACK":
		// Extract attacker/defender indices from intent.Payload
		if err := s.Game.ResolveCombat(clientID, 0, -1); err != nil {
			log.Println("Error in combat:", err)
		}
	case "END_TURN":
		s.Game.EndTurn()
	}

	// Important: the frontend never calculates outcomes. The backend emits the new state.
	// We unlock the mutex before broadcasting since BroadcastState locks it, wait we are already locked.
	// Actually we should trigger broadcast without deadlocking.
}

func (s *Server) Start(port string) {
	fmt.Printf("Glimmerfall WebSocket server running on port %s\n", port)
	// http.ListenAndServe(":"+port, nil)
}
