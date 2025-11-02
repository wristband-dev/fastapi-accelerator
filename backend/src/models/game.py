from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel

class Player(BaseModel):
    id: str
    name: str
    userId: Optional[str] = None  # If present, this is a registered user; if None, it's a custom/guest player

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

class PlayerInput(BaseModel):
    """Input for creating a player - either userId OR customName must be provided"""
    userId: Optional[str] = None  # For registered users
    customName: Optional[str] = None  # For guest/temporary players

class GameCreate(BaseModel):
    name: str
    players: List[PlayerInput]  # List of player inputs (either userId or customName)
    targetScore: int = 500

class GameUpdate(BaseModel):
    name: Optional[str] = None
    isComplete: Optional[bool] = None

class RoundCreate(BaseModel):
    scores: Dict[str, int]

class GamesResponse(BaseModel):
    games: List[Game]

