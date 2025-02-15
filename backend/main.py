# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from .database import create_tables, get_db, import_data_from_csv
from .models import DiemThi
from .schemas import DiemThi as DiemThiSchema
from typing import List
import shutil
import os
from fastapi.middleware.cors import CORSMiddleware  # Import CORS
from .schemas import Top10KhoiA 

app = FastAPI()

# CORS (Cross-Origin Resource Sharing)
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://192.168.1.68:8080",  # Thêm origin của frontend (quan trọng)
    "http://localhost:8000",
    "http://127.0.0.1:8000",
     "http://localhost",
    "http://127.0.0.1",

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Hoặc chỉ định các methods cụ thể: ["GET", "POST", "PUT", "DELETE"]
    allow_headers=["*"],  # Hoặc chỉ định các headers cụ thể
)
# Tạo tables khi start app
create_tables()

# API endpoint để upload file CSV
@app.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file format.  Must be CSV.")

    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Xóa dữ liệu cũ trước khi import
    db.query(DiemThi).delete()

    import_data_from_csv(db, file_path)
    db.commit() # Commit ở đây

    return {"filename": file.filename, "message": "Data imported successfully!"}

# API endpoint để lấy tất cả điểm thi
@app.get("/diemthi/", response_model=List[DiemThiSchema])
def read_diem_thi(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    diem_thi = db.query(DiemThi).offset(skip).limit(limit).all()
    return diem_thi

# API endpoint để tra cứu theo SBD
@app.get("/diemthi/{sbd}", response_model=DiemThiSchema)
def read_diem_thi_by_sbd(sbd: str, db: Session = Depends(get_db)):
    diem_thi = db.query(DiemThi).filter(DiemThi.sbd == sbd).first()
    if diem_thi is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy SBD này.")
    return diem_thi

# API endpoint để lấy danh sách theo mức điểm (>=8, 6-8, 4-6, <4)
@app.get("/diemthi/filter/{mon_hoc}/{muc_diem}")
def filter_diem_thi(mon_hoc: str, muc_diem: str, db: Session = Depends(get_db)):
    if muc_diem == ">=8":
        diem_thi = db.query(DiemThi.sbd).filter(getattr(DiemThi, mon_hoc) >= 8).all()
    elif muc_diem == "6-8":
        diem_thi = db.query(DiemThi.sbd).filter(getattr(DiemThi, mon_hoc) >= 6, getattr(DiemThi, mon_hoc) < 8).all()
    elif muc_diem == "4-6":
        diem_thi = db.query(DiemThi.sbd).filter(getattr(DiemThi, mon_hoc) >= 4, getattr(DiemThi, mon_hoc) < 6).all()
    elif muc_diem == "<4":
        diem_thi = db.query(DiemThi.sbd).filter(getattr(DiemThi, mon_hoc) < 4).all()
    else:
        raise HTTPException(status_code=400, detail="Mức điểm không hợp lệ")
    return [item[0] for item in diem_thi]


# API endpoint thống kê số lượng theo mức điểm
@app.get("/thongke/{mon_hoc}")
def thong_ke_diem(mon_hoc: str, db: Session = Depends(get_db)):
    gte_8 = db.query(DiemThi).filter(getattr(DiemThi, mon_hoc) >= 8).count()
    between_6_8 = db.query(DiemThi).filter(getattr(DiemThi, mon_hoc) >= 6, getattr(DiemThi, mon_hoc) < 8).count()
    between_4_6 = db.query(DiemThi).filter(getattr(DiemThi, mon_hoc) >= 4, getattr(DiemThi, mon_hoc) < 6).count()
    lt_4 = db.query(DiemThi).filter(getattr(DiemThi, mon_hoc) < 4).count()

    # Kiểm tra nếu tất cả các giá trị đều bằng 0 (có thể là do dữ liệu không có)
    if all(value == 0 for value in [gte_8, between_6_8, between_4_6, lt_4]):
         return {}  # Trả về object rỗng

    return {
        ">=8": gte_8,
        "6-8": between_6_8,
        "4-6": between_4_6,
        "<4": lt_4,
    }
# API endpoint lấy top 10 theo khối A
@app.get("/top10/khoiA", response_model=List[Top10KhoiA]) # Dùng response_model mới
def top10_khoi_a(db: Session = Depends(get_db)):
    top_students = db.query(DiemThi.sbd, DiemThi.toan, DiemThi.vat_li, DiemThi.hoa_hoc,
                            (DiemThi.toan + DiemThi.vat_li + DiemThi.hoa_hoc).label('tong_diem'))\
                   .order_by((DiemThi.toan + DiemThi.vat_li + DiemThi.hoa_hoc).desc())\
                   .limit(10)\
                   .all()
    return top_students