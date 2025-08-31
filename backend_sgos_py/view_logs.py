#!/usr/bin/env python3
"""
Script para visualizar logs da API e erros de forma detalhada
"""

import sqlite3
from datetime import datetime, timedelta
import argparse

def view_recent_logs(hours=24, limit=20):
    """Visualiza logs recentes das últimas N horas"""
    
    print(f"📊 LOGS DAS ÚLTIMAS {hours} HORAS")
    print("=" * 60)
    
    try:
        conn = sqlite3.connect("sgos.db")
        cursor = conn.cursor()
        
        # Calcular timestamp de N horas atrás
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        # Logs da API
        print("\n🔄 LOGS DA API:")
        print("-" * 40)
        
        cursor.execute("""
            SELECT endpoint, metodo, status_code, app_status, tempo_resposta, created_at, ip_address
            FROM log_api 
            WHERE created_at >= ?
            ORDER BY created_at DESC 
            LIMIT ?
        """, (cutoff_time.isoformat(), limit))
        
        logs_api = cursor.fetchall()
        
        if not logs_api:
            print("   Nenhum log da API encontrado no período.")
        else:
            print(f"   📋 Últimos {len(logs_api)} logs da API:")
            print("   " + "-" * 90)
            print(f"   {'Endpoint':<25} {'Método':<6} {'HTTP':<6} {'App':<6} {'Tempo':<6} {'IP':<12} {'Data/Hora'}")
            print("   " + "-" * 100)
            
            for log in logs_api:
                endpoint, metodo, status, app_status, tempo, created_at, ip = log
                endpoint_display = endpoint[:49] + "..." if len(endpoint) > 50 else endpoint
                app_status_display = app_status if app_status else "N/A"
                print(f"   {endpoint_display:<50} {metodo:<6} {status:<6} {app_status_display:<6} {tempo:<6}ms {ip:<12} {created_at}")
        
        # Logs de erro
        print("\n🚨 LOGS DE ERRO:")
        print("-" * 40)
        
        cursor.execute("""
            SELECT endpoint, metodo, erro, created_at, ip_address
            FROM log_erro 
            WHERE created_at >= ?
            ORDER BY created_at DESC 
            LIMIT ?
        """, (cutoff_time.isoformat(), limit))
        
        logs_erro = cursor.fetchall()
        
        if not logs_erro:
            print("   ✅ Nenhum erro registrado no período.")
        else:
            print(f"   📋 Últimos {len(logs_erro)} logs de erro:")
            print("   " + "-" * 100)
            print(f"   {'Endpoint':<25} {'Método':<6} {'Erro':<50} {'IP':<12} {'Data/Hora'}")
            print("   " + "-" * 100)
            
            for log in logs_erro:
                endpoint, metodo, erro, created_at, ip = log
                endpoint_display = endpoint[:49] + "..." if len(endpoint) > 50 else endpoint
                erro_display = erro[:49] + "..." if len(erro) > 50 else erro
                print(f"   {endpoint_display:<50} {metodo:<6} {erro_display:<50} {ip:<12} {created_at}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro ao visualizar logs: {e}")

def view_error_details(error_id=None):
    """Visualiza detalhes de um erro específico"""
    
    if not error_id:
        print("❌ ID do erro não fornecido!")
        return
    
    print(f"🔍 DETALHES DO ERRO #{error_id}")
    print("=" * 50)
    
    try:
        conn = sqlite3.connect("sgos.db")
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT endpoint, metodo, erro, stack_trace, created_at, ip_address, usuario_id
            FROM log_erro 
            WHERE id = ?
        """, (error_id,))
        
        error = cursor.fetchone()
        
        if not error:
            print(f"❌ Erro #{error_id} não encontrado!")
            return
        
        endpoint, metodo, erro, stack_trace, created_at, ip_address, usuario_id = error
        
        print(f"📍 Endpoint: {endpoint}")
        print(f"🔧 Método: {metodo}")
        print(f"⏰ Data/Hora: {created_at}")
        print(f"🌐 IP: {ip_address}")
        print(f"👤 Usuário ID: {usuario_id or 'N/A'}")
        print(f"\n❌ Erro:")
        print(f"   {erro}")
        
        if stack_trace:
            print(f"\n📋 Stack Trace:")
            print(f"   {stack_trace}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro ao visualizar detalhes: {e}")

def view_statistics():
    """Visualiza estatísticas dos logs"""
    
    print("📈 ESTATÍSTICAS DOS LOGS")
    print("=" * 50)
    
    try:
        conn = sqlite3.connect("sgos.db")
        cursor = conn.cursor()
        
        # Estatísticas gerais
        cursor.execute("SELECT COUNT(*) FROM log_api")
        total_api_logs = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM log_erro")
        total_error_logs = cursor.fetchone()[0]
        
        print(f"📊 Total de logs da API: {total_api_logs}")
        print(f"🚨 Total de logs de erro: {total_error_logs}")
        
        if total_api_logs > 0:
            error_rate = (total_error_logs / total_api_logs) * 100
            print(f"📉 Taxa de erro: {error_rate:.2f}%")
        
        # Status codes mais comuns
        print(f"\n🔢 Status Codes mais comuns:")
        cursor.execute("""
            SELECT status_code, COUNT(*) as total
            FROM log_api 
            GROUP BY status_code 
            ORDER BY total DESC 
            LIMIT 10
        """)
        
        status_codes = cursor.fetchall()
        for status, total in status_codes:
            print(f"   {status}: {total} requisições")
        
        # Endpoints mais acessados
        print(f"\n🌐 Endpoints mais acessados:")
        cursor.execute("""
            SELECT endpoint, COUNT(*) as total
            FROM log_api 
            GROUP BY endpoint 
            ORDER BY total DESC 
            LIMIT 10
        """)
        
        endpoints = cursor.fetchall()
        for endpoint, total in endpoints:
            endpoint_display = endpoint[:40] + "..." if len(endpoint) > 40 else endpoint
            print(f"   {endpoint_display:<40} | {total} acessos")
        
        # Endpoints com mais erros
        if total_error_logs > 0:
            print(f"\n🚨 Endpoints com mais erros:")
            cursor.execute("""
                SELECT endpoint, COUNT(*) as total_erros
                FROM log_erro 
                GROUP BY endpoint 
                ORDER BY total_erros DESC 
                LIMIT 10
            """)
            
            error_endpoints = cursor.fetchall()
            for endpoint, total_erros in error_endpoints:
                endpoint_display = endpoint[:40] + "..." if len(endpoint) > 40 else endpoint
                print(f"   {endpoint_display:<40} | {total_erros} erros")
        
        # Performance (tempo médio de resposta)
        cursor.execute("""
            SELECT AVG(tempo_resposta) as tempo_medio,
                   MIN(tempo_resposta) as tempo_min,
                   MAX(tempo_resposta) as tempo_max
            FROM log_api
        """)
        
        tempo_medio, tempo_min, tempo_max = cursor.fetchone()
        
        if tempo_medio:
            print(f"\n⚡ Performance:")
            print(f"   Tempo médio de resposta: {tempo_medio:.1f}ms")
            print(f"   Tempo mínimo: {tempo_min}ms")
            print(f"   Tempo máximo: {tempo_max}ms")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro ao visualizar estatísticas: {e}")

def main():
    """Função principal"""
    
    parser = argparse.ArgumentParser(description="Visualizador de logs da API")
    parser.add_argument("--recent", "-r", type=int, default=24, 
                       help="Visualizar logs das últimas N horas (padrão: 24)")
    parser.add_argument("--limit", "-l", type=int, default=20,
                       help="Limite de logs a mostrar (padrão: 20)")
    parser.add_argument("--error", "-e", type=int,
                       help="Visualizar detalhes de um erro específico por ID")
    parser.add_argument("--stats", "-s", action="store_true",
                       help="Visualizar estatísticas dos logs")
    
    args = parser.parse_args()
    
    if args.error:
        view_error_details(args.error)
    elif args.stats:
        view_statistics()
    else:
        view_recent_logs(args.recent, args.limit)

if __name__ == "__main__":
    main()
