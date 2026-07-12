package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	_ "github.com/lib/pq"
)

var db *sql.DB

func initDB() {
	var err error
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Println("WARNING: DATABASE_URL is not set")
	}
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error connecting to database: %v\n", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatalf("Error pinging database: %v\n", err)
	}
	log.Println("Successfully connected to NeonDB!")
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for dev alpha
	},
}

type Client struct {
	conn *websocket.Conn
	send chan []byte
}

var (
	clients   = make(map[*Client]bool)
	broadcast = make(chan []byte)
)

func handleConnections(c *gin.Context) {
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket Upgrade Error:", err)
		return
	}
	defer ws.Close()

	client := &Client{conn: ws, send: make(chan []byte, 256)}
	clients[client] = true

	for {
		_, msg, err := ws.ReadMessage()
		if err != nil {
			delete(clients, client)
			break
		}
		// Send message to broadcast channel
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		msg := <-broadcast
		// Send it out to every client that is currently connected
		for client := range clients {
			err := client.conn.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				client.conn.Close()
				delete(clients, client)
			}
		}
	}
}

type WaitlistRequest struct {
	Email string `json:"email" binding:"required,email"`
}

func registerWaitlist(c *gin.Context) {
	var req WaitlistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email address"})
		return
	}

	_, err := db.Exec("INSERT INTO waitlist (email) VALUES ($1) ON CONFLICT (email) DO NOTHING", req.Email)
	if err != nil {
		log.Println("DB Insert Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Uplink Established! You are on the waitlist."})
}

// Generate Booster Pack
func generateBooster(c *gin.Context) {
	rows, err := db.Query("SELECT name, card_type, cost, power, health, description, rarity, set_name, collector_number FROM cards ORDER BY RANDOM() LIMIT 10")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate booster"})
		return
	}
	defer rows.Close()

	var cards []map[string]interface{}
	for rows.Next() {
		var name, cardType, description, rarity, setName sql.NullString
		var cost sql.NullInt64
		var power, health, collectorNumber sql.NullInt64

		if err := rows.Scan(&name, &cardType, &cost, &power, &health, &description, &rarity, &setName, &collectorNumber); err == nil {
			card := map[string]interface{}{
				"name":        name.String,
				"card_type":   cardType.String,
				"cost":        cost.Int64,
				"description": description.String,
				"rarity":      rarity.String,
			}
			if power.Valid {
				card["power"] = power.Int64
			}
			if health.Valid {
				card["health"] = health.Int64
			}
			if setName.Valid {
				card["set_name"] = setName.String
			}
			if collectorNumber.Valid {
				card["collector_number"] = collectorNumber.Int64
			}
			cards = append(cards, card)
		}
	}

	c.JSON(http.StatusOK, gin.H{"cards": cards})
}

// Fetch all cards
func getAllCards(c *gin.Context) {
	rows, err := db.Query("SELECT name, card_type, cost, power, health, description, rarity, set_name, collector_number FROM cards ORDER BY name ASC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cards"})
		return
	}
	defer rows.Close()

	var cards []map[string]interface{}
	for rows.Next() {
		var name, cardType, description, rarity, setName sql.NullString
		var cost sql.NullInt64
		var power, health, collectorNumber sql.NullInt64

		if err := rows.Scan(&name, &cardType, &cost, &power, &health, &description, &rarity, &setName, &collectorNumber); err == nil {
			card := map[string]interface{}{
				"name":        name.String,
				"card_type":   cardType.String,
				"cost":        cost.Int64,
				"description": description.String,
				"rarity":      rarity.String,
			}
			if power.Valid {
				card["power"] = power.Int64
			}
			if health.Valid {
				card["health"] = health.Int64
			}
			if setName.Valid {
				card["set_name"] = setName.String
			}
			if collectorNumber.Valid {
				card["collector_number"] = collectorNumber.Int64
			}
			cards = append(cards, card)
		}
	}

	c.JSON(http.StatusOK, gin.H{"cards": cards})
}

type DeckCard struct {
	CardName string `json:"card_name"`
	Count    int    `json:"count"`
}

type DeckRequest struct {
	Username string     `json:"username" binding:"required"`
	DeckName string     `json:"deck_name" binding:"required"`
	Cards    []DeckCard `json:"cards" binding:"required"`
}

func saveDeck(c *gin.Context) {
	var req DeckRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	// Delete existing deck with the same name for this user (upsert logic)
	_, err = tx.Exec("DELETE FROM decks WHERE username = $1 AND deck_name = $2", req.Username, req.DeckName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear existing deck"})
		return
	}

	var deckID int
	err = tx.QueryRow("INSERT INTO decks (username, deck_name) VALUES ($1, $2) RETURNING id", req.Username, req.DeckName).Scan(&deckID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create deck"})
		return
	}

	for _, card := range req.Cards {
		_, err = tx.Exec("INSERT INTO deck_cards (deck_id, card_name, count) VALUES ($1, $2, $3)", deckID, card.CardName, card.Count)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save cards"})
			return
		}
	}

	err = tx.Commit()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deck saved successfully!"})
}

func getDecks(c *gin.Context) {
	username := c.Query("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username required"})
		return
	}

	rows, err := db.Query(`
        SELECT d.deck_name, dc.card_name, dc.count 
        FROM decks d 
        LEFT JOIN deck_cards dc ON d.id = dc.deck_id 
        WHERE d.username = $1`, username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch decks"})
		return
	}
	defer rows.Close()

	decksMap := make(map[string][]map[string]interface{})
	for rows.Next() {
		var deckName string
		var cardName sql.NullString
		var count sql.NullInt64

		if err := rows.Scan(&deckName, &cardName, &count); err == nil {
			if cardName.Valid {
				decksMap[deckName] = append(decksMap[deckName], map[string]interface{}{
					"card_name": cardName.String,
					"count":     count.Int64,
				})
			} else {
				if _, exists := decksMap[deckName]; !exists {
					decksMap[deckName] = []map[string]interface{}{}
				}
			}
		}
	}

	var result []map[string]interface{}
	for name, cards := range decksMap {
		result = append(result, map[string]interface{}{
			"deck_name": name,
			"cards":     cards,
		})
	}

	c.JSON(http.StatusOK, gin.H{"decks": result})
}

func main() {
	initDB()

	r := gin.Default()

	// Configure CORS for local development
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST"}
	config.AllowHeaders = []string{"Origin", "Content-Type"}
	r.Use(cors.New(config))

	api := r.Group("/api")
	{
		api.POST("/waitlist", registerWaitlist)
		api.GET("/booster", generateBooster)
		api.GET("/cards", getAllCards)
		api.POST("/decks", saveDeck)
		api.GET("/decks", getDecks)
	}
	
	// WebSocket endpoint
	r.GET("/ws", handleConnections)
	go handleMessages()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Glimmerfall API server running on port %s\n", port)
	r.Run(":" + port)
}
