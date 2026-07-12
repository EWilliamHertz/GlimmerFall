package state

import (
	"testing"
)

func TestPlayGlimmerNode(t *testing.T) {
	g := NewGame("p1", "p2")
	g.Players["p1"].Hand = append(g.Players["p1"].Hand, Card{ID: 1, Name: "Test", Power: 1, Health: 1})

	err := g.PlayGlimmerNode("p1", 0)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(g.Players["p1"].GlimmerNodes) != 1 {
		t.Errorf("expected 1 Glimmer Node, got %d", len(g.Players["p1"].GlimmerNodes))
	}
}

func TestOverloadDamage(t *testing.T) {
	g := NewGame("p1", "p2")
	g.Players["p1"].UnspentGlimmer = 5
	g.EndTurn()

	if g.Players["p1"].Nexus.Health != 18 {
		t.Errorf("expected Nexus health to be 18 due to Overload (2 damage), got %d", g.Players["p1"].Nexus.Health)
	}
}

func TestCombatBleedThrough(t *testing.T) {
	g := NewGame("p1", "p2")
	g.Players["p1"].Battlefield = append(g.Players["p1"].Battlefield, Card{Power: 5, Health: 5})
	g.Players["p2"].Battlefield = append(g.Players["p2"].Battlefield, Card{Power: 2, Health: 2})

	err := g.ResolveCombat("p1", 0, 0)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if g.Players["p2"].Nexus.Health != 17 {
		t.Errorf("expected Nexus health to be 17 (3 bleed-through damage), got %d", g.Players["p2"].Nexus.Health)
	}

	if g.Players["p1"].Battlefield[0].Health != 3 {
		t.Errorf("expected attacker health to be 3, got %d", g.Players["p1"].Battlefield[0].Health)
	}
}
