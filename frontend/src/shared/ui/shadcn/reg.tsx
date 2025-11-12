import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/shared/ui/shadcn/ui/card"
import {Input} from "@/shared/ui/shadcn/ui/input"
import {Label} from "@/shared/ui/shadcn/ui/label"
import {Button} from "@/shared/ui/shadcn/ui/button"
import {type RegisterData} from "@/features/auth/api/auth-api.ts";
import {useAuthStore} from "@/features/auth/model/auth-context.ts";

export function Registration() {

    async function handle(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const username = formData.get("email") as string;
        const password = formData.get("password") as string;
        const password_again = formData.get("password_again") as string;

        if (password !== password_again) {
            alert('Пароли не совпадают')
            return;
        }

        try {
            await useAuthStore().register({username, password} as RegisterData)
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

                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password_again">Подтверждение</Label>
                            </div>
                            <Input id="password_again" type="password" required />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full">
                    Register
                </Button>
            </CardFooter>
        </Card>
    )
}
