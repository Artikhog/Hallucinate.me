import type { Level } from "@/shared/api/api";
import { Button } from "@/shared/ui/shadcn/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@/shared/ui/shadcn/ui/item";
import type { FC } from "react";

interface IProps {
  level: Level;
  onStart: (levelId: string) => void;
}

export const LevelCard: FC<IProps> = (props) => {
  const { level, onStart } = props;

  return (
    <Item>
      <ItemMedia />
      <ItemContent>
        <ItemTitle>{level.name}</ItemTitle>
        <ItemDescription>{level.description}</ItemDescription>
        <ItemFooter>очки за выполнение {level.base_score}</ItemFooter>
      </ItemContent>
      <ItemActions>
        <Button onClick={() => onStart(level.id)}>Начать</Button>
      </ItemActions>
    </Item>
  );
};
