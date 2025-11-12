import { LevelCard } from "@/entities/level/ui/LevelCard";
import type { Level } from "@/shared/api/api"
import { apiClient } from "@/shared/api/base";
import { useEffect, useState } from "react";

export const LevelsPage = () => {
    const [levels, setLevels] = useState<Level[]>([]);

    useEffect(() => {
        apiClient.levels.getLevelsLevelsGet().then(response => response.data).then(getLevels => setLevels(getLevels));
    }, [])

    return <div className="grid grid-cols-2">{
        levels.map((levelData) => <LevelCard level={levelData} key={levelData.id} />)}</div>
}