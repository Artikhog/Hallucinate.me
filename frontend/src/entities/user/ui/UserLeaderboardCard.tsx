import type { LeaderboardEntry, UserStats } from "@/shared/api/api"
import { Item, ItemContent, ItemDescription, ItemFooter, ItemMedia, ItemTitle } from "@/shared/ui/shadcn/ui/item";
import type { FC } from "react";

interface IProps {
    user: LeaderboardEntry;
}

export const UserLeaderBoardCard: FC<IProps> = (props) => {
    const {user} = props;

    return <Item>
        <ItemMedia />
        <ItemContent>
            <ItemTitle>{`${user.username} ${user.rank ?? "?"} место в рейтинге`}</ItemTitle>
            <ItemDescription>{"Всего баллов: " + user.score}</ItemDescription>
        </ItemContent>
    </Item>
}