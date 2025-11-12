import {Card, CardContent, CardHeader, CardTitle} from "@/shared/ui/shadcn/ui/card"
import {Input} from "@/shared/ui/shadcn/ui/input"
import {Label} from "@/shared/ui/shadcn/ui/label"
import {Button} from "@/shared/ui/shadcn/ui/button"
import {useAuthStore} from "@/features/auth/model/auth-context.ts";
import {useRef} from "react";
import type { UserRegister } from "@/shared/api/api";

export function Registration() {

    const authStore = useAuthStore();

    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const passwordAgainRef = useRef<HTMLInputElement>(null);

    async function handle(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const username = usernameRef.current?.value;
        const password = passwordRef.current?.value;
        const password_again = passwordAgainRef.current?.value;

        if (!username || !password || !password_again) {
            alert('Please fill in all fields')
            return;
        }

        if (password !== password_again) {
            alert('Password error')
            return;
        }

        try {
            await authStore.register({username, password} as UserRegister)
            window.location.href = '/'
        } catch (err: any) {
            alert('Register error. Try again')
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Регистрация</CardTitle>
                <a
                    href="/auth/login"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                    Вход
                </a>
            </CardHeader>
            <CardContent>
                <form onSubmit={handle}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Электропочта</Label>
                            <Input
                                id="username"
                                placeholder="a.lysenko"
                                required
                                ref={usernameRef}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Пароль</Label>
                            </div>
                            <Input id="password" type="password" required ref={passwordRef}/>
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password_again">Подтверждение</Label>
                            </div>
                            <Input id="password_again" type="password" required ref={passwordAgainRef}/>
                        </div>
                        <Button type="submit" className="w-full">
                            Register
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
