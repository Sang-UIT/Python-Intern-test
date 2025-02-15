# backend/models.py
from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class DiemThi(Base):
    __tablename__ = "diem_thi"

    id = Column(Integer, primary_key=True, index=True)
    sbd = Column(String, unique=True, index=True)
    toan = Column(Float)
    ngu_van = Column(Float)
    ngoai_ngu = Column(Float)
    vat_li = Column(Float)
    hoa_hoc = Column(Float)
    sinh_hoc = Column(Float)
    lich_su = Column(Float)
    dia_li = Column(Float)
    gdcd = Column(Float)
    ma_ngoai_ngu = Column(String)