from fastapi import APIRouter, Response, status, Depends, HTTPException
from fastapi.responses import JSONResponse
import logging
from typing import List, Dict
from datetime import datetime
import random
import string

from wristband.fastapi_auth import get_session
from auth.wristband import require_session_auth
from models.wristband.session import MySession
from models.game import Game, GameCreate, GameUpdate, RoundCreate, GamesResponse, Player, Round
from database import doc_store

router = APIRouter(dependencies=[Depends(require_session_auth)])

logger = logging.getLogger(__name__)

COLLECTION_PATH = "games"

def generate_id() -> str:
    """Generate a random ID."""
    timestamp = str(int(datetime.now().timestamp() * 1000))
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"{timestamp}_{random_suffix}"

def calculate_player_totals(game: Game) -> Dict[str, int]:
    """Calculate total scores for all players."""
    totals: Dict[str, int] = {}
    
    # Initialize totals for all players
    for player in game.players:
        totals[player.id] = 0
    
    # Sum up scores from all rounds
    for round in game.rounds:
        for player_id, score in round.scores.items():
            totals[player_id] = totals.get(player_id, 0) + score
    
    return totals

@router.post('', response_model=Game)
async def create_game(game_data: GameCreate, session: MySession = Depends(get_session)) -> Response:
    """Create a new game."""
    try:
        # Create players with IDs
        players = [
            Player(
                id=f"{generate_id()}_{idx}", 
                name=name
            ) 
            for idx, name in enumerate(game_data.players)
        ]
        
        # Create the game
        game = Game(
            id=generate_id(),
            name=game_data.name,
            date=datetime.now().isoformat(),
            players=players,
            rounds=[],
            targetScore=game_data.targetScore,
            isComplete=False,
            userId=session.user_id,
            tenantId=session.tenant_id
        )
        
        # Save to database
        doc_store.add_document(
            COLLECTION_PATH, 
            game.model_dump(),
            tenant_id=session.tenant_id
        )
        
        logger.info(f"Created game {game.id} for user {session.user_id}")
        return JSONResponse(content=game.model_dump(), status_code=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.exception(f"Error creating game: {str(e)}")
        return Response(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.get('', response_model=GamesResponse)
async def get_games(session: MySession = Depends(get_session)) -> Response:
    """Get all games for the current user."""
    try:
        # Query games for this user, ordered by date descending
        games_data = doc_store.query_documents(
            COLLECTION_PATH,
            tenant_id=session.tenant_id,
            where_field="userId",
            where_operator="==",
            where_value=session.user_id,
            order_by_field="date",
            order_direction="DESC"
        )
        
        games = [Game(**game_data) for game_data in games_data]
        
        return JSONResponse(content={"games": [game.model_dump() for game in games]})
        
    except Exception as e:
        logger.exception(f"Error getting games: {str(e)}")
        return Response(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.get('/{game_id}', response_model=Game)
async def get_game(game_id: str, session: MySession = Depends(get_session)) -> Response:
    """Get a specific game by ID."""
    try:
        game_data = doc_store.get_document(
            COLLECTION_PATH, 
            game_id,
            tenant_id=session.tenant_id
        )
        
        if not game_data:
            raise HTTPException(status_code=404, detail="Game not found")
        
        # Verify the game belongs to the user
        if game_data.get("userId") != session.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this game")
        
        game = Game(**game_data)
        return JSONResponse(content=game.model_dump())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error getting game: {str(e)}")
        return Response(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.put('/{game_id}', response_model=Game)
async def update_game(game_id: str, game_update: GameUpdate, session: MySession = Depends(get_session)) -> Response:
    """Update a game."""
    try:
        # Get existing game
        game_data = doc_store.get_document(
            COLLECTION_PATH, 
            game_id,
            tenant_id=session.tenant_id
        )
        
        if not game_data:
            raise HTTPException(status_code=404, detail="Game not found")
        
        # Verify the game belongs to the user
        if game_data.get("userId") != session.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this game")
        
        # Update only provided fields
        update_data = game_update.model_dump(exclude_unset=True)
        
        doc_store.update_document(
            COLLECTION_PATH,
            game_id,
            update_data,
            tenant_id=session.tenant_id
        )
        
        # Get updated game
        updated_game_data = doc_store.get_document(
            COLLECTION_PATH, 
            game_id,
            tenant_id=session.tenant_id
        )
        
        game = Game(**updated_game_data)
        return JSONResponse(content=game.model_dump())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error updating game: {str(e)}")
        return Response(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.delete('/{game_id}')
async def delete_game(game_id: str, session: MySession = Depends(get_session)) -> Response:
    """Delete a game."""
    try:
        # Get existing game to verify ownership
        game_data = doc_store.get_document(
            COLLECTION_PATH, 
            game_id,
            tenant_id=session.tenant_id
        )
        
        if not game_data:
            raise HTTPException(status_code=404, detail="Game not found")
        
        # Verify the game belongs to the user
        if game_data.get("userId") != session.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this game")
        
        doc_store.delete_document(
            COLLECTION_PATH,
            game_id,
            tenant_id=session.tenant_id
        )
        
        return JSONResponse(content={"message": "Game deleted successfully"})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error deleting game: {str(e)}")
        return Response(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.post('/{game_id}/rounds', response_model=Game)
async def add_round(game_id: str, round_data: RoundCreate, session: MySession = Depends(get_session)) -> Response:
    """Add a round to a game."""
    try:
        # Get existing game
        game_data = doc_store.get_document(
            COLLECTION_PATH, 
            game_id,
            tenant_id=session.tenant_id
        )
        
        if not game_data:
            raise HTTPException(status_code=404, detail="Game not found")
        
        # Verify the game belongs to the user
        if game_data.get("userId") != session.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this game")
        
        game = Game(**game_data)
        
        # Create new round
        new_round = Round(
            id=generate_id(),
            scores=round_data.scores
        )
        
        # Add round to game
        game.rounds.append(new_round)
        
        # Check if game is complete
        player_totals = calculate_player_totals(game)
        is_complete = any(total >= game.targetScore for total in player_totals.values())
        game.isComplete = is_complete
        
        # Update in database
        doc_store.update_document(
            COLLECTION_PATH,
            game_id,
            {
                "rounds": [round.model_dump() for round in game.rounds],
                "isComplete": game.isComplete
            },
            tenant_id=session.tenant_id
        )
        
        return JSONResponse(content=game.model_dump())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error adding round: {str(e)}")
        return Response(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.put('/{game_id}/rounds/{round_id}', response_model=Game)
async def edit_round(game_id: str, round_id: str, round_data: RoundCreate, session: MySession = Depends(get_session)) -> Response:
    """Edit a round in a game."""
    try:
        # Get existing game
        game_data = doc_store.get_document(
            COLLECTION_PATH, 
            game_id,
            tenant_id=session.tenant_id
        )
        
        if not game_data:
            raise HTTPException(status_code=404, detail="Game not found")
        
        # Verify the game belongs to the user
        if game_data.get("userId") != session.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this game")
        
        game = Game(**game_data)
        
        # Find and update the round
        round_found = False
        for i, round in enumerate(game.rounds):
            if round.id == round_id:
                game.rounds[i].scores = round_data.scores
                round_found = True
                break
        
        if not round_found:
            raise HTTPException(status_code=404, detail="Round not found")
        
        # Recalculate if game is complete
        player_totals = calculate_player_totals(game)
        is_complete = any(total >= game.targetScore for total in player_totals.values())
        game.isComplete = is_complete
        
        # Update in database
        doc_store.update_document(
            COLLECTION_PATH,
            game_id,
            {
                "rounds": [round.model_dump() for round in game.rounds],
                "isComplete": game.isComplete
            },
            tenant_id=session.tenant_id
        )
        
        return JSONResponse(content=game.model_dump())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error editing round: {str(e)}")
        return Response(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.put('/{game_id}/complete', response_model=Game)
async def complete_game(game_id: str, session: MySession = Depends(get_session)) -> Response:
    """Mark a game as complete."""
    try:
        # Get existing game
        game_data = doc_store.get_document(
            COLLECTION_PATH, 
            game_id,
            tenant_id=session.tenant_id
        )
        
        if not game_data:
            raise HTTPException(status_code=404, detail="Game not found")
        
        # Verify the game belongs to the user
        if game_data.get("userId") != session.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this game")
        
        # Update game to mark as complete
        doc_store.update_document(
            COLLECTION_PATH,
            game_id,
            {"isComplete": True},
            tenant_id=session.tenant_id
        )
        
        # Get updated game
        updated_game_data = doc_store.get_document(
            COLLECTION_PATH, 
            game_id,
            tenant_id=session.tenant_id
        )
        
        game = Game(**updated_game_data)
        logger.info(f"Marked game {game_id} as complete for user {session.user_id}")
        return JSONResponse(content=game.model_dump())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error completing game: {str(e)}")
        return Response(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

