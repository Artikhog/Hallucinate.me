from db_helper import db

LEVELS = [
    {
        "name": "История Древнего Рима",
        "description": "Обсуждение исторических фактов о Древнем Риме",
        "base_score": 100,
        "article_link": "https://ru.wikipedia.org/wiki/%D0%98%D1%81%D1%82%D0%BE%D1%80%D0%B8%D1%8F_%D0%94%D1%80%D0%B5%D0%B2%D0%BD%D0%B5%D0%B3%D0%BE_%D0%A0%D0%B8%D0%BC%D0%B0",
        "article_name": "История Древнего Рима",
    }
]

if __name__ == "__main__":
    for level in LEVELS:
        db.create_level(level)
