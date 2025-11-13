import type { LeaderboardEntry } from "@/shared/api/api"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/shared/ui/shadcn/ui/item";
import { Award, Crown, Medal } from "lucide-react";
import type { FC } from "react";

interface IProps {
    place: number;
    user: LeaderboardEntry;
}

export const UserLeaderBoardCard: FC<IProps> = (props) => {
    const {place, user} = props;

    return <Item>
        <ItemMedia />
        <ItemContent>
            <ItemTitle>{place === 1 && <Crown  className="text-amber-300"/>}{place === 2 && <Medal className="text-indigo-600" />}{place === 3 && <Award className="text-amber-600"/>} {`${user.username} ${place} место в рейтинге`}</ItemTitle>
            <ItemDescription>{"Всего баллов: " + user.score}</ItemDescription>
        </ItemContent>
    </Item>
}