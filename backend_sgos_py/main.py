from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from database import engine
from models import Base
from routers import auth, usuarios, veiculos, ordens_servico, servicos_realizados, pecas_utilizadas, encerrar_os, retirada_viatura
from config import settings
from middleware import log_api_middleware

# Criar tabelas no banco de dados
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    print("✅ Banco de dados inicializado!")
    yield
    # Shutdown
    print("🔄 Aplicação finalizada!")

# Criar aplicação FastAPI
app = FastAPI(
    title="SGOS - Sistema de Gerenciamento de Ordem de Serviço",
    description="API RESTful para gerenciamento de ordens de serviço de veículos",
    version="1.0.0",
    lifespan=lifespan
)

# Adicionar middleware de logging da API
app.middleware("http")(log_api_middleware)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(usuarios.router, prefix="/api/v1")
app.include_router(veiculos.router, prefix="/api/v1")
app.include_router(ordens_servico.router, prefix="/api/v1")
app.include_router(servicos_realizados.router, prefix="/api/v1")
app.include_router(pecas_utilizadas.router, prefix="/api/v1")
app.include_router(encerrar_os.router, prefix="/api/v1")
app.include_router(retirada_viatura.router, prefix="/api/v1")

@app.get("/")
async def root():
    """Endpoint raiz da API"""
    return {
        "status": "success",
        "message": "SGOS - Sistema de Gerenciamento de Ordem de Serviço",
        "timestamp": "2024-01-01T00:00:00",
        "data": {
            "version": "1.0.0",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }

@app.get("/health")
async def health_check():
    """Endpoint para verificar a saúde da aplicação"""
    return {
        "status": "success",
        "message": "API funcionando normalmente",
        "timestamp": "2024-01-01T00:00:00"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
