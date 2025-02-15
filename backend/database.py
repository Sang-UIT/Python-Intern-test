# backend/database.py
import sqlite3
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, DiemThi
import csv
from typing import List
from .schemas import DiemThiCreate
import os # Thêm import os

DATABASE_URL = "sqlite:///./diem_thi_thpt.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)
    load_initial_data() # Gọi hàm load data khi tạo bảng

def import_data_from_csv(db, file_path: str):
    with open(file_path, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=',')
        for row in reader:
            for key, value in row.items():
                if value is None or value == '':
                    row[key] = None
            diem_thi_data = DiemThiCreate(**row)
            diem_thi = DiemThi(**diem_thi_data.dict())

            db.add(diem_thi)
        db.commit()

def load_initial_data():
    db = SessionLocal()
    # Kiểm tra xem đã có dữ liệu trong bảng chưa
    if db.query(DiemThi).first() is None:
        # Đường dẫn tương đối đến file CSV
        file_path = os.path.join("data", "diem_thi_thpt_2024.csv")

        # Kiểm tra file có tồn tại không
        if os.path.exists(file_path):
            print(f"Loading initial data from: {file_path}")
            import_data_from_csv(db, file_path)
        else:
            print(f"Initial data file not found: {file_path}")
    else:
        print("Data already exists in the database. Skipping initial load.")
    db.close()