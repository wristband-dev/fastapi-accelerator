from fastapi import APIRouter

from .auth_routes import router as auth_router
from .nickname_routes import router as nickname_router
from .session_routes import router as session_router
from .user_routes import router as user_router
from .users_routes import router as users_router
from .tenant_routes import router as tenant_router
from .idp_routes import router as idp_router
from .secret_routes import router as secret_router

router = APIRouter()
router.include_router(auth_router, prefix='/api/auth')
router.include_router(nickname_router, prefix='/api/nickname')
router.include_router(session_router, prefix='/api/session')
router.include_router(user_router, prefix='/api/user')
router.include_router(users_router, prefix='/api/users')
router.include_router(tenant_router, prefix='/api/tenant')
router.include_router(idp_router, prefix='/api/idp')
router.include_router(secret_router, prefix='/api/secrets')
