from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import MetaTrader5 as mt5

app = FastAPI(title="MT5 Service")


class LoginPayload(BaseModel):
    login: int
    password: str
    server: str
    path: str | None = None


class MarketOrderPayload(BaseModel):
    symbol: str
    volume: float
    side: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "mt5"}


@app.post("/session/login")
def session_login(payload: LoginPayload):
    terminal_path = payload.path or os.getenv("MT5_TERMINAL_PATH")
    if terminal_path:
        mt5.initialize(path=terminal_path)
    else:
        mt5.initialize()

    authorized = mt5.login(payload.login, password=payload.password, server=payload.server)
    if not authorized:
        raise HTTPException(status_code=401, detail="MT5 login failed")
    return {"status": "logged_in"}


@app.post("/session/logout")
def session_logout():
    mt5.shutdown()
    return {"status": "logged_out"}


@app.get("/market/tick")
def market_tick(symbol: str):
    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        raise HTTPException(status_code=404, detail="Symbol not found or no tick data")
    # Convert MetaTrader5 Tick to serializable dict
    return {
        "symbol": symbol,
        "bid": tick.bid,
        "ask": tick.ask,
        "last": tick.last,
        "volume": tick.volume,
        "time": tick.time,
        "flags": tick.flags,
    }


@app.post("/orders/market")
def market_order(payload: MarketOrderPayload):
    side = payload.side.lower()
    if side not in ("buy", "sell"):
        raise HTTPException(status_code=400, detail="side must be 'buy' or 'sell'")

    symbol_info = mt5.symbol_info(payload.symbol)
    if symbol_info is None:
        raise HTTPException(status_code=404, detail="Unknown symbol")
    if not symbol_info.visible:
        if not mt5.symbol_select(payload.symbol, True):
            raise HTTPException(status_code=400, detail="Failed to select symbol")

    order_type = mt5.ORDER_TYPE_BUY if side == "buy" else mt5.ORDER_TYPE_SELL
    price = mt5.symbol_info_tick(payload.symbol).ask if side == "buy" else mt5.symbol_info_tick(payload.symbol).bid

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": payload.symbol,
        "volume": payload.volume,
        "type": order_type,
        "price": price,
        "deviation": 20,
        "magic": 123456,
        "comment": "api-market-order",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_FOK,
    }

    result = mt5.order_send(request)
    if result is None or result.retcode != mt5.TRADE_RETCODE_DONE:
        detail = getattr(result, "comment", "order failed")
        raise HTTPException(status_code=400, detail=str(detail))

    return {
        "order": result.order,
        "retcode": result.retcode,
        "deal": result.deal,
        "price": result.price,
        "volume": result.volume,
    }


