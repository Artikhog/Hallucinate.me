from db_helper import DatabaseHelper

if __name__ == "__main__":
    # connects to TESTING db, to connect to prod db just call DatabaseHelper()
    db = DatabaseHelper("hallucinate_me_test")
    db.clear_all()
    assert db.add_user("login1", "123")
    # this test doesn't work locally duty to lack of indexes
    # assert not db.add_user("login1", "23")
    assert db.authenticate_user("login1", "123")
    assert not db.authenticate_user("login1", "12r3")

    assert db.add_user("login2", "1234")
    assert db.add_user("login3", "12345")
    assert not db.authenticate_user("login2", "123")

    level_id = db.create_level({"base_score": 100})

    session_id = db.start_history("login1", level_id)
    db.update_history(session_id, "short chat", "USER")
    result = db.get_user_chat_history(session_id)
    del result["updated_at"]
    assert result == {
        "login": "login1",
        "data": [{"text": "short chat", "type": "USER"}],
        "level_id": level_id,
        "is_valid": False,
    }

    assert db.get_user_chat_histories("login1") == [
        [{"text": "short chat", "type": "USER"}]
    ]
    db.update_history(session_id, "long chat", "LLM")
    result = db.get_user_chat_history(session_id)
    del result["updated_at"]
    assert result == {
        "login": "login1",
        "data": [
            {"text": "short chat", "type": "USER"},
            {"text": "long chat", "type": "LLM"},
        ],
        "level_id": level_id,
        "is_valid": False,
    }
    assert db.get_user_chat_histories("login1") == [
        [{"text": "short chat", "type": "USER"}, {"text": "long chat", "type": "LLM"}]
    ]

    level_id_2 = db.create_level({"base_score": 300})
    session_id2 = db.start_history("login1", level_id_2)
    db.update_history(session_id2, "new chat", "ASSISTENT")
    assert db.get_user_chat_histories("login1") == [
        [{"text": "new chat", "type": "ASSISTENT"}],
        [{"text": "short chat", "type": "USER"}, {"text": "long chat", "type": "LLM"}],
    ]

    assert db.get_all_users() == ["login1", "login2", "login3"]
    db.delete_user("login3")
    assert db.get_all_users() == ["login1", "login2"]
    assert db.get_all_scores() == [
        {"login": "login1", "points": 0},
        {"login": "login2", "points": 0},
    ]

    assert db.get_score("login1") == 0
    assert db.add_score("login1", session_id)
    assert db.add_score("login1", session_id2)
    assert db.get_score("login1") == 100 + 300
    assert db.get_score("login2") == 0

    assert db.get_all_scores() == [
        {"login": "login1", "points": 100 + 300},
        {"login": "login2", "points": 0},
    ]

    assert db.get_all_levels() == [
        {"id": level_id, "base_score": 100},
        {"id": level_id_2, "base_score": 300},
    ]
