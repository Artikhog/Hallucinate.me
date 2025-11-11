import { createBrowserRouter, Navigate } from 'react-router-dom';
import { NotFoundPage } from './notFound/NotFoundPage';
import { LoginPage } from './login/LoginPage';
import { RoundsPage } from './rounds/RoundsPage';
import { ChatPage } from './chat/ChatPage';
import { HomePage } from './home/HomePage';
import { LeaderBoardPage } from './leaderBoard/LeaderBoardPage';
import Layout from '@/app/layouts/layout';

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
        element: <Layout />,
        children: [
            {
                path: 'login',
                element: <LoginPage />,
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
                path: 'rounds',
                element: <RoundsPage />,
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