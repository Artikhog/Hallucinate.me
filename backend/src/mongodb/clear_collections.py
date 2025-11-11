from db_helper import DatabaseHelper, maybe_print

if __name__ == "__main__":
    maybe_print("✅ All collections successfully cleared")
    db = DatabaseHelper()
    db.clear_all()
