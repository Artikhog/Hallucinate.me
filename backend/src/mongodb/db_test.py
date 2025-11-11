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

    assert db.get_score("login1") == 0
    assert db.update_score("login1", 10)
    assert db.get_score("login1") == 10
    assert db.add_score("login1", 20)
    assert db.get_score("login1") == 30
    assert db.get_score("login2") == 0
    assert db.add_score("login2", 10)
    assert db.get_score("login2") == 10

    assert db.get_all_scores() == [
        {"login": "login1", "points": 30},
        {"login": "login2", "points": 10},
        {"login": "login3", "points": 0},
    ]

    assert db.add_score("login3", 300)
    assert db.get_all_scores() == [
        {"login": "login3", "points": 300},
        {"login": "login1", "points": 30},
        {"login": "login2", "points": 10},
    ]

    id = db.add_history("login1", "short chat")
    assert db.get_user_chat_history(id) == "short chat"
    assert db.get_user_chat_histories("login1") == ["short chat"]
    db.update_history(id, "long chat")
    assert db.get_user_chat_history(id) == "long chat"
    assert db.get_user_chat_histories("login1") == ["long chat"]
    db.add_history("login1", "new chat")
    assert db.get_user_chat_histories("login1") == ["new chat", "long chat"]

    assert db.get_all_users() == ["login1", "login2", "login3"]
    db.delete_user("login3")
    assert db.get_all_users() == ["login1", "login2"]
    assert db.get_all_scores() == [
        {"login": "login1", "points": 30},
        {"login": "login2", "points": 10},
    ]
