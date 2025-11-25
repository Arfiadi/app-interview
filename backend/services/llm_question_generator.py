from backend.services.openrouter_client import ask_openrouter
import json
import os
import re
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL = os.getenv("LLM_MODEL", "openai/gpt-oss-20b:free")

# Path ke Template
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_PATH = os.path.join(BASE_DIR, "data", "prompt_templates", "generate_questions.txt")

def load_template():
    """
    Membaca file template prompt.
    Jika gagal, mengembalikan template default yang aman.
    """
    try:
        if os.path.exists(TEMPLATE_PATH):
            with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
                return f.read()
        else:
            logger.warning(f"Template file not found at: {TEMPLATE_PATH}")
    except Exception as e:
        logger.error(f"Error reading template: {e}")
    
    # Default Fallback Template
    return """
    Bertindaklah sebagai Hiring Manager Profesional.
    Buatlah {n} pertanyaan wawancara untuk posisi {role} (Level: {exp}) di industri {industry}.
    
    PENTING:
    Output HANYA berupa JSON Array of Strings.
    Contoh: ["Pertanyaan 1", "Pertanyaan 2"]
    """

def clean_json_string(s: str) -> str:
    """
    Membersihkan string dari format Markdown code block ```json ... ```
    yang sering ditambahkan oleh LLM.
    """
    if not s: return ""
    # Coba regex untuk menangkap konten di dalam blok kode json
    pattern = r"```json\s*(.*?)\s*```"
    match = re.search(pattern, s, re.DOTALL)
    if match:
        return match.group(1)
    # Fallback: hapus backticks saja
    return s.replace("```", "").strip()

def generate_questions(role, exp, industry, n=5):
    """
    Fungsi utama untuk menghasilkan pertanyaan wawancara.
    Mencoba menggunakan LLM, jika gagal beralih ke Mock Mode.
    """
    logger.info(f"Generating {n} questions for {role} ({exp}) - Mode: Auto")
    
    try:
        template = load_template()
        # Mengisi placeholder dalam template
        prompt = template.format(n=n, role=role, exp=exp, industry=industry)
        
        # Panggil AI
        resp = ask_openrouter(MODEL, [{"role": "user", "content": prompt}], temperature=0.7)
        
        if resp:
            clean_resp = clean_json_string(resp)
            try:
                parsed = json.loads(clean_resp)
                if isinstance(parsed, list):
                    # Pastikan jumlah pertanyaan sesuai permintaan (slice array)
                    # dan konversi semua elemen menjadi string
                    return [str(q) for q in parsed[:n]]
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse JSON from AI. Raw response: {resp[:100]}...")
                
    except Exception as e:
        logger.warning(f"AI Generation Failed ({e}). Switching to Mock Mode.")
    
    # --- FALLBACK: MOCK MODE ---
    logger.info("Using Mock Questions (Structured)")
    return get_mock_questions(role, n)

def get_mock_questions(role, n):
    """
    Pertanyaan simulasi yang cerdas dan TERURUT (Opening -> Technical -> Behavioral -> Closing).
    Digunakan jika LLM gagal atau limit habis.
    """
    role_lower = role.lower()
    
    # 1. Opening
    opening_qs = [
        f"Ceritakan tentang diri Anda dan mengapa Anda tertarik melamar posisi {role} ini?",
        "Apa pencapaian profesional terbesar Anda sejauh ini?"
    ]
    
    # 2. Technical (Dynamic based on role keywords)
    technical_qs = []
    if "product" in role_lower:
        technical_qs = [
            "Bagaimana Anda memprioritaskan fitur produk ketika sumber daya terbatas?",
            "Sebutkan tools analitik yang biasa Anda gunakan dan bagaimana dampaknya pada keputusan Anda."
        ]
    elif any(x in role_lower for x in ["engineer", "developer", "data", "programmer"]):
        technical_qs = [
            "Jelaskan tantangan teknis tersulit yang pernah Anda hadapi dan bagaimana solusinya.",
            "Bagaimana Anda memastikan kualitas kode dan skalabilitas dalam proyek Anda?"
        ]
    elif "marketing" in role_lower:
        technical_qs = [
            "Bagaimana Anda mengukur keberhasilan sebuah kampanye (ROI)?",
            "Strategi apa yang Anda gunakan untuk meningkatkan brand awareness di pasar yang kompetitif?"
        ]
    else:
        # Generic Technical
        technical_qs = [
            f"Skill spesifik apa yang Anda miliki yang paling relevan untuk posisi {role}?",
            "Ceritakan pengalaman Anda menggunakan tools industri standar dalam pekerjaan Anda."
        ]

    # 3. Behavioral
    behavioral_qs = [
        "Ceritakan masa di mana Anda harus bekerja dengan rekan kerja yang sulit. Bagaimana Anda menanganinya?",
        "Gambarkan situasi di mana Anda gagal mencapai target. Apa yang Anda pelajari?"
    ]
    
    # 4. Closing
    closing_qs = [
        "Apa motivasi jangka panjang Anda dalam karier ini?",
        "Apakah ada pertanyaan yang ingin Anda ajukan kepada kami?"
    ]

    # --- LOGIKA PENYUSUNAN URUTAN ---
    final_qs = []
    
    # Slot 1: Opening
    final_qs.append(opening_qs[0])
    
    # Slot Tengah: Technical & Behavioral (Butuh n - 2 slot)
    slots_needed = max(0, n - 2)
    
    if slots_needed > 0:
        # Prioritas: 60% Technical, 40% Behavioral
        tech_count = max(1, int(slots_needed * 0.6))
        beh_count = slots_needed - tech_count
        
        # Ambil pertanyaan (cycling jika kurang)
        for i in range(tech_count):
            final_qs.append(technical_qs[i % len(technical_qs)])
            
        for i in range(beh_count):
            final_qs.append(behavioral_qs[i % len(behavioral_qs)])
            
    # Slot Akhir: Closing (jika n >= 2)
    if n >= 2:
        final_qs.append(closing_qs[0])
        
    # Safety net: Potong atau tambah jika masih tidak pas
    return final_qs[:n]