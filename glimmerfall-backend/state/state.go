package state

import (
	"errors"
	"fmt"
)

type Card struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Type      string `json:"type"`
	Cost      int    `json:"cost"`
	Power     int    `json:"power"`
	Health    int    `json:"health"`
	IsGlimmer bool   `json:"isGlimmer"` // True if played face-down as a Glimmer Node
}

type Nexus struct {
	Health int `json:"health"`
}

type Player struct {
	ID             string `json:"id"`
	Nexus          Nexus  `json:"nexus"`
	Hand           []Card `json:"hand"`
	Battlefield    []Card `json:"battlefield"`
	GlimmerNodes   []Card `json:"glimmerNodes"` // Cards played face-down
	UnspentGlimmer int    `json:"unspentGlimmer"`
}

type Game struct {
	Players     map[string]*Player `json:"players"`
	CurrentTurn string             `json:"currentTurn"`
}

// ActionIntents
type ActionIntent struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

func NewGame(p1ID, p2ID string) *Game {
	return &Game{
		Players: map[string]*Player{
			p1ID: {ID: p1ID, Nexus: Nexus{Health: 20}},
			p2ID: {ID: p2ID, Nexus: Nexus{Health: 20}},
		},
		CurrentTurn: p1ID,
	}
}

func (g *Game) PlayGlimmerNode(playerID string, cardIndex int) error {
	p, ok := g.Players[playerID]
	if !ok {
		return errors.New("player not found")
	}
	if g.CurrentTurn != playerID {
		return errors.New("not your turn")
	}
	if cardIndex < 0 || cardIndex >= len(p.Hand) {
		return errors.New("invalid card index")
	}

	card := p.Hand[cardIndex]
	card.IsGlimmer = true
	// Remove from hand
	p.Hand = append(p.Hand[:cardIndex], p.Hand[cardIndex+1:]...)
	// Add to glimmer nodes
	p.GlimmerNodes = append(p.GlimmerNodes, card)
	
	// Assuming playing a Glimmer Node gives you 1 unspent glimmer immediately for this turn
	p.UnspentGlimmer++
	
	return nil
}

func (g *Game) EndTurn() {
	currentPlayer := g.Players[g.CurrentTurn]
	
	// Overload logic: calculate end-of-turn damage if unspent Glimmer exceeds 3
	if currentPlayer.UnspentGlimmer > 3 {
		damage := currentPlayer.UnspentGlimmer - 3
		currentPlayer.Nexus.Health -= damage
	}

	// Reset unspent glimmer
	currentPlayer.UnspentGlimmer = 0

	// Switch turns
	var nextPlayerID string
	for id := range g.Players {
		if id != g.CurrentTurn {
			nextPlayerID = id
			break
		}
	}
	g.CurrentTurn = nextPlayerID
	
	// Start next player's turn: refresh glimmer based on nodes
	nextPlayer := g.Players[nextPlayerID]
	nextPlayer.UnspentGlimmer = len(nextPlayer.GlimmerNodes)
}

func (g *Game) ResolveCombat(attackerID string, attackerIndex int, defenderIndex int) error {
	// Simplified combat logic for unit test
	p1, ok1 := g.Players[attackerID]
	if !ok1 {
		return errors.New("attacker player not found")
	}

	var defenderID string
	for id := range g.Players {
		if id != attackerID {
			defenderID = id
		}
	}
	p2 := g.Players[defenderID]

	if attackerIndex < 0 || attackerIndex >= len(p1.Battlefield) {
		return errors.New("invalid attacker index")
	}

	attacker := &p1.Battlefield[attackerIndex]

	if defenderIndex == -1 {
		// Attack Nexus directly
		p2.Nexus.Health -= attacker.Power
		return nil
	}

	if defenderIndex < 0 || defenderIndex >= len(p2.Battlefield) {
		return errors.New("invalid defender index")
	}
	defender := &p2.Battlefield[defenderIndex]

	// Bleed-through damage
	if attacker.Power > defender.Health {
		bleed := attacker.Power - defender.Health
		p2.Nexus.Health -= bleed
		defender.Health = 0
	} else {
		defender.Health -= attacker.Power
	}

	attacker.Health -= defender.Power
	return nil
}
