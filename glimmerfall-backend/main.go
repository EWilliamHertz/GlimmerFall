package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
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
	// Simple logic: Fetch 10 random cards based on weighted rarities
	// For now, since the cards table might be empty, we just do a simple pull or mock
	rows, err := db.Query("SELECT name, image_url, rarity FROM cards ORDER BY RANDOM() LIMIT 10")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate booster"})
		return
	}
	defer rows.Close()

	var cards []map[string]interface{}
	for rows.Next() {
		var name, imageUrl, rarity sql.NullString
		if err := rows.Scan(&name, &imageUrl, &rarity); err == nil {
			cards = append(cards, map[string]interface{}{
				"name":      name.String,
				"image_url": imageUrl.String,
				"rarity":    rarity.String,
			})
		}
	}

	if len(cards) == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "Card database is empty. Waiting for card ingestion.", "cards": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cards": cards})
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
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Glimmerfall API server running on port %s\n", port)
	r.Run(":" + port)
}
