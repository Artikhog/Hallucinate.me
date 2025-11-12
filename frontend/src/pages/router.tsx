import { createBrowserRouter } from 'react-router-dom';
import { NotFoundPage } from './notFound/NotFoundPage';
import { LoginPage } from './login/LoginPage';
import { LevelsPage } from './levels/LevelsPage';
import { ChatPage } from './chat/ChatPage';
import { HomePage } from './home/HomePage';
import { LeaderBoardPage } from './leaderBoard/LeaderBoardPage';
import Layout from '@/app/layouts/layout';
import { RegisterPage } from "@/pages/login/RegisterPage.tsx";
import { ReportsPage } from './reports/Reports';
import { ProtectedRoute } from '@/features/auth/lib/protected-route';

export const router = createBrowserRouter([
    // {
    //     path: '/',
    //     element: (
    //         <Layout />
    //     ),
    //     children: [
    //         {
    //             index: true,
    //             element: <HomePage />,
    //         },
    //         {
    //             path: 'leaders',
    //             element: <LeaderBoardPage />
    //         },
    //     ]
    // },
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
            // <ProtectedRoute>
                <Layout />
            // </ProtectedRoute>
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
            {
                path: 'levels',
                element: <LevelsPage />,
            },
            {
                path: 'chat',
                element: <ChatPage />,
            },
            {
                path: 'reports',
                element: <ReportsPage />,
            },
        ],
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);