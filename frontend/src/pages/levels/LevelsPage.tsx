import { LevelCard } from "@/entities/level/ui/LevelCard";
import { useGetLevelsQuery } from "@/shared/api/queries/getLevelsQuery";
import { useStartLevelMutation } from "@/shared/api/queries/startLevelMutation";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { useNavigate } from "react-router-dom";

// const LEVELS_DATA: Level[] = [
//   {
//     id: "1",
//     name: "История Древнего Рима",
//     description:
//       "Империя, которая изменила мир. От основания до падения Западной Римской империи",
//     base_score: 100,
//   },
//   {
//     id: "2",
//     name: "Мировая Литература",
//     description: "Шедевры литературного искусства от классики до современности",
//     base_score: 150,
//   },
//   {
//     id: "3",
//     name: "Языки Программирования",
//     description:
//       "Синтаксис, парадигмы и особенности популярных языков программирования",
//     base_score: 200,
//   },
//   {
//     id: "4",
//     name: "Квантовая Физика",
//     description:
//       "Законы микромира: от квантовой механики до квантовой информатики",
//     base_score: 300,
//   },
//   {
//     id: "5",
//     name: "Искусственный Интеллект",
//     description: "Нейросети, машинное обучение и современные подходы к ИИ",
//     base_score: 250,
//   },
//   {
//     id: "6",
//     name: "Биология Клетки",
//     description:
//       "Строение и функции клеточных компонентов, молекулярные процессы",
//     base_score: 180,
//   },
//   {
//     id: "7",
//     name: "Финансовые Рынки",
//     description: "Трейдинг, инвестиции и анализ финансовых инструментов",
//     base_score: 220,
//   },
//   {
//     id: "8",
//     name: "Архитектура Компьютеров",
//     description: "Принципы работы процессоров, память и компьютерные системы",
//     base_score: 170,
//   },
//   {
//     id: "9",
//     name: "Кулинарное Искусство",
//     description: "Техники приготовления, национальные кухни и гастрономия",
//     base_score: 120,
//   },
//   {
//     id: "10",
//     name: "Астрономия и Космос",
//     description:
//       "Планеты, звезды, галактики и исследование космического пространства",
//     base_score: 280,
//   },
// ];
export const LevelsPage = () => {
  const navigate = useNavigate();
  const { data: levels } = useGetLevelsQuery();
  const { mutate: startLevel } = useStartLevelMutation({
    onSuccess: (data) => {
      navigate(`/chat?id=${data.id}`);
    },
  });
  const onStartLevel = (levelId: string) => {
    startLevel(levelId);
  };
  return (
    <div className="grid grid-cols-2">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-full">
            <Loader2 className="size-4 animate-spin" />
          </div>
        }
      >
        {levels?.map((level) => (
          <LevelCard key={level.id} level={level} onStart={onStartLevel} />
        ))}
      </Suspense>
    </div>
  );
};
