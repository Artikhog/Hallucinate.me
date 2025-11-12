import {createBrowserRouter} from 'react-router-dom';
import {NotFoundPage} from './notFound/NotFoundPage';
import {LoginPage} from './login/LoginPage';
import {LevelsPage} from './levels/LevelsPage';
import {ChatPage} from './chat/ChatPage';
import {HomePage} from './home/HomePage';
import {LeaderBoardPage} from './leaderBoard/LeaderBoardPage';
import Layout from '@/app/layouts/layout';
import {RegisterPage} from "@/pages/login/RegisterPage.tsx";

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <Layout />
        ),
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: 'leaders',
                element: <LeaderBoardPage />
            },
        ]
    },
    {
        path: '/auth',
        children: [
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'register',
                element: <RegisterPage />,
            },
        ],
    },
    {
        path: '/',
        element: (
            // TODO расскоментировать как добавится авторизация по jwt 
            //   <ProtectedRoute>
            <Layout/>
            //   </ProtectedRoute>
        ),
        children: [
            {
                path: 'levels',
                element: <LevelsPage />,
            },
            {
                path: 'chat',
                element: <ChatPage />,
            },
        ],
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);