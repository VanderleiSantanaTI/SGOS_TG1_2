"""
Utilitários para tratamento de timezone local
"""

from datetime import datetime
import pytz
from typing import Optional, Union
from sqlalchemy import DateTime
from sqlalchemy.sql import func

def get_brasil_timezone():
    """Retorna o timezone do Brasil"""
    return pytz.timezone('America/Sao_Paulo')

def get_current_brasil_time():
    """Retorna o horário atual no timezone do Brasil"""
    tz_brasil = get_brasil_timezone()
    return datetime.now(tz_brasil)

def convert_utc_to_brasil(utc_datetime: Union[datetime, str]) -> Optional[datetime]:
    """
    Converte datetime UTC para timezone do Brasil
    
    Args:
        utc_datetime: Datetime UTC ou string ISO
        
    Returns:
        Datetime no timezone do Brasil ou None se erro
    """
    try:
        if isinstance(utc_datetime, str):
            # Remover 'Z' e adicionar '+00:00' se necessário
            if utc_datetime.endswith('Z'):
                utc_datetime = utc_datetime.replace('Z', '+00:00')
            dt_utc = datetime.fromisoformat(utc_datetime)
        else:
            dt_utc = utc_datetime
            
        # Se não tem timezone, assumir UTC
        if dt_utc.tzinfo is None:
            dt_utc = pytz.UTC.localize(dt_utc)
            
        tz_brasil = get_brasil_timezone()
        return dt_utc.astimezone(tz_brasil)
        
    except Exception as e:
        print(f"Erro ao converter timezone: {e}")
        return None

def format_datetime_brasil(dt: Union[datetime, str], format_str: str = '%d/%m/%Y %H:%M:%S') -> str:
    """
    Formata datetime para string no timezone do Brasil
    
    Args:
        dt: Datetime ou string ISO
        format_str: String de formatação
        
    Returns:
        String formatada no horário do Brasil
    """
    dt_brasil = convert_utc_to_brasil(dt)
    if dt_brasil:
        return dt_brasil.strftime(format_str)
    return "Data inválida"

def format_datetime_brasil_with_timezone(dt: Union[datetime, str]) -> str:
    """
    Formata datetime para string no timezone do Brasil incluindo fuso horário
    
    Args:
        dt: Datetime ou string ISO
        
    Returns:
        String formatada com fuso horário
    """
    dt_brasil = convert_utc_to_brasil(dt)
    if dt_brasil:
        return dt_brasil.strftime('%d/%m/%Y %H:%M:%S (%Z)')
    return "Data inválida"

def brasil_now():
    """
    Retorna função para obter horário atual no timezone do Brasil
    Útil para usar como default em modelos SQLAlchemy
    """
    def _brasil_now():
        return get_current_brasil_time()
    return _brasil_now

def brasil_datetime_column():
    """
    Retorna coluna DateTime configurada para timezone do Brasil
    """
    return DateTime(timezone=True, default=brasil_now())

def get_timezone_info():
    """
    Retorna informações sobre o timezone atual
    """
    tz_brasil = get_brasil_timezone()
    now_utc = datetime.now(pytz.UTC)
    now_brasil = now_utc.astimezone(tz_brasil)
    
    return {
        'utc_now': now_utc,
        'brasil_now': now_brasil,
        'brasil_offset': now_brasil.utcoffset(),
        'is_dst': bool(now_brasil.dst()),
        'timezone_name': 'America/Sao_Paulo'
    }
