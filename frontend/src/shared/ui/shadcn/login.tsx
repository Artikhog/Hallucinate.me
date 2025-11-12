import {Button} from "@/shared/ui/shadcn/ui/button"
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/shared/ui/shadcn/ui/card"
import {Input} from "@/shared/ui/shadcn/ui/input"
import {Label} from "@/shared/ui/shadcn/ui/label"
import type {LoginCredentials} from "@/features/auth/api/auth-api.ts";
import {useAuthStore} from "@/features/auth/model/auth-context.ts";

export function Login() {

    async function handle(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); // чтобы не перезагружалась страница

        const formData = new FormData(e.currentTarget);
        const username = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            await useAuthStore().login({username, password} as LoginCredentials)
            window.location.href = '/'
        } catch (err: any) {
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
                                type="email"
                                placeholder="green@itmo.ru"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Пароль</Label>

                            </div>
                            <Input id="password" type="password" required />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full">
                    Login
                </Button>
            </CardFooter>
        </Card>
    )
}