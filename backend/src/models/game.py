from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel

class Player(BaseModel):
    id: str
    name: str

class Round(BaseModel):
    id: str
    scores: Dict[str, int]  # playerId -> score

class Game(BaseModel):
    id: Optional[str] = None
    name: str
    date: str
    players: List[Player]
    rounds: List[Round]
    targetScore: int
    isComplete: bool
    userId: str  # The user who created the game
    tenantId: str  # For multi-tenancy support

class GameCreate(BaseModel):
    name: str
    players: List[str]  # List of player names
    targetScore: int = 500

class GameUpdate(BaseModel):
    name: Optional[str] = None
    isComplete: Optional[bool] = None

class RoundCreate(BaseModel):
    scores: Dict[str, int]

class GamesResponse(BaseModel):
    games: List[Game]

