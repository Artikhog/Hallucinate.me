from db_helper import db

LEVELS = [
    {
        "name": "История Древнего Рима",
        "description": "Обсуждение исторических фактов о Древнем Риме",
        "base_score": 100,
        "article_link": "https://ru.wikipedia.org/wiki/%D0%98%D1%81%D1%82%D0%BE%D1%80%D0%B8%D1%8F_%D0%94%D1%80%D0%B5%D0%B2%D0%BD%D0%B5%D0%B3%D0%BE_%D0%A0%D0%B8%D0%BC%D0%B0",
        "article_name": "История Древнего Рима",
    },
    {
        "name": "Функциональное программирование",
        "description": "Проведите дискуссию с ИИ по поводу лямбда-исчисления и настоящих ФП языков, подловите бездушную машину на незнании монад и функций высшего порядка",
        "base_score": 100,
        "article_link": "https://ru.wikipedia.org/wiki/%D0%A4%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%BE%D0%BD%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%B5_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5",
        "article_name": "Функциональное программирование",
    },
    {
        "name": "Программная инженерия",
        "description": "Обсудите принципы разработки ПО, методологии и лучшие практики. Попробуйте поймать ИИ на неверной трактовке Agile-манифеста или концепций SOLID принципов.",
        "base_score": 100,
        "article_link": "https://ru.wikipedia.org/wiki/%D0%9F%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%BD%D0%B0%D1%8F_%D0%B8%D0%BD%D0%B6%D0%B5%D0%BD%D0%B5%D1%80%D0%B8%D1%8F",
        "article_name": "Программная инженерия",
    },
    {
        "name": "Верификация программ",
        "description": "Поговорите о формальных методах проверки корректности программ. ИИ может перепутать статический и динамический анализ или сделать неверное утверждение о model checking.",
        "base_score": 100,
        "article_link": "https://ru.wikipedia.org/wiki/%D0%92%D0%B5%D1%80%D0%B8%D1%84%D0%B8%D0%BA%D0%B0%D1%86%D0%B8%D1%8F_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%BD%D0%BE%D0%B3%D0%BE_%D0%BE%D0%B1%D0%B5%D1%81%D0%BF%D0%B5%D1%87%D0%B5%D0%BD%D0%B8%D1%8F",
        "article_name": "Верификация программного обеспечения",
    },
    {
        "name": "Rust",
        "description": "Обсудите систему владения, времена жизни и особенности языка Rust. ИИ может некорректно объяснить работу borrow checker или перепутать синтаксис трейтов.",
        "base_score": 200,
        "article_link": "https://ru.wikipedia.org/wiki/Rust_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)",
        "article_name": "Rust (язык программирования)",
    },
    {
        "name": "Пикми-палки (Pikmin Bloom)",
        "description": "Поговорите о мобильной игре Pikmin Bloom от Niantic. ИИ может ошибиться в механике выращивания пикми, перепутать типы декора или неверно описать взаимодействие с цветами.",
        "base_score": 200,
        "article_link": "https://ru.wikipedia.org/wiki/Pikmin_Bloom",
        "article_name": "Pikmin Bloom",
    },
    {
        "name": "Javascript",
        "description": "Обсудите особенности языка, event loop, замыкания и современные стандарты ES6+. Попробуйте поймать ИИ на неверном объяснении работы hoisting'а или путанице между == и ===.",
        "base_score": 140,
        "article_link": "https://ru.wikipedia.org/wiki/JavaScript",
        "article_name": "JavaScript",
    },
    {
        "name": "Золотой век русской литературы",
        "description": "Поговорите о творчестве Пушкина, Гоголя, Лермонтова и других классиков. ИИ может перепутать сюжеты произведений, даты создания или приписать автору не его цитаты.",
        "base_score": 110,
        "article_link": "https://ru.wikipedia.org/wiki/%D0%97%D0%BE%D0%BB%D0%BE%D1%82%D0%BE%D0%B9_%D0%B2%D0%B5%D0%BA_%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%BE%D0%B9_%D0%BB%D0%B8%D1%82%D0%B5%D1%80%D0%B0%D1%82%D1%83%D1%80%D1%8B",
        "article_name": "Золотой век русской литературы",
    },
    {
        "name": "Торт Наполеон",
        "description": "Обсудите историю происхождения, традиционный рецепт и вариации этого десерта. ИИ может выдумать несуществующие исторические факты о связи с императором или перепутать слои в классическом рецепте.",
        "base_score": 85,
        "article_link": "https://ru.wikipedia.org/wiki/%D0%9D%D0%B0%D0%BF%D0%BE%D0%BB%D0%B5%D0%BE%D0%BD_(%D1%82%D0%BE%D1%80%D1%82)",
        "article_name": "Наполеон (торт)",
    },
]

if __name__ == "__main__":
    for level in LEVELS:
        db.create_level(level)
