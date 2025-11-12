import {Button} from "@/shared/ui/shadcn/ui/button"
import {Card, CardContent, CardHeader, CardTitle,} from "@/shared/ui/shadcn/ui/card"
import {Input} from "@/shared/ui/shadcn/ui/input"
import {Label} from "@/shared/ui/shadcn/ui/label"
import {useAuthStore} from "@/features/auth/model/auth-context.ts";
import {useRef} from "react";
import type { UserLogin } from "@/shared/api/api"

export function Login() {

    const authStore = useAuthStore();
    const passwordRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);

    async function handle(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const username = usernameRef.current?.value;
        const password = passwordRef.current?.value;

        if (!username || !password) {
            alert('Please fill in all fields')
            return;
        }

        try {
            await authStore.login({username, password} as UserLogin)
            window.location.href = '/'
        } catch (err: any) {
            console.log(err);
            alert('Login error. Try again')
        }
    }


    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Вход</CardTitle>
                <a
                    href="/auth/register"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                    Регистрация
                </a>
            </CardHeader>
            <CardContent>
                <form onSubmit={handle}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Электропочта</Label>
                            <Input
                                id="email"
                                placeholder="olegShipulin"
                                required
                                ref={usernameRef}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Пароль</Label>

                            </div>
                            <Input id="password" type="password" required ref={passwordRef} />
                        </div>

                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}