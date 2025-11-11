import type { UserStats } from "@/shared/api/api"
import { Item, ItemContent, ItemDescription, ItemFooter, ItemMedia, ItemTitle } from "@/shared/ui/shadcn/ui/item";
import type { FC } from "react";

interface IProps {
    user: UserStats;
}

export const UserLeaderBoard: FC<IProps> = (props) => {
    const {user} = props;

    return <Item>
        <ItemMedia />
        <ItemContent>
            <ItemTitle>{`Имя пользователя ${user.global_rank} место в рейтинге`}</ItemTitle>
            <ItemDescription>{"Всего баллов: " + user.total_score}</ItemDescription>
            <ItemFooter>Всего сыграно раундов {user.sessions_played} успешных раундов {user.successful_reports}</ItemFooter>
        </ItemContent>
        {/* <ItemActions><Button>Начать</Button></ItemActions> */}
    </Item>
}