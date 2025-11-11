from pydantic import BaseModel


class Level(BaseModel):
    id: str
    name: str
    description: str
    base_score: int