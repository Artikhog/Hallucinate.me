from db_helper import db, maybe_print

if __name__ == "__main__":
    maybe_print("✅ All collections successfully cleared")
    db.clear_all()
