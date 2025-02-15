# backend/schemas.py

from pydantic import BaseModel
from typing import Optional

class DiemThiBase(BaseModel):
    sbd: str
    toan: Optional[float] = None
    ngu_van: Optional[float] = None
    ngoai_ngu: Optional[float] = None
    vat_li: Optional[float] = None
    hoa_hoc: Optional[float] = None
    sinh_hoc: Optional[float] = None
    lich_su: Optional[float] = None
    dia_li: Optional[float] = None
    gdcd: Optional[float] = None
    ma_ngoai_ngu: Optional[str] = None


class DiemThiCreate(DiemThiBase):
    pass  # Kế thừa từ DiemThiBase


class DiemThi(DiemThiBase):
    id: int

    class Config:
        orm_mode = True

class Top10KhoiA(BaseModel):
    sbd: str
    toan: float
    vat_li: float
    hoa_hoc: float
    tong_diem: float

    class Config:
        orm_mode = True