import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserLoginOrCreate({
  setEmail,
  setPassword,
	setConfirmPassword,
  failedLogin,
  notMatchingPasswords,
  alreadyExists,
}: {
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
	setConfirmPassword: (confirmPassword: string) => void;
  failedLogin: boolean;
  notMatchingPasswords: boolean;
  alreadyExists: boolean;
}) {

  const handleTabChange = () => {
		setEmail("");
		setPassword("");
		setConfirmPassword("");
	}

  return (
    <div className="flex justify-center mt-5">
      <Tabs onValueChange={handleTabChange} defaultValue="login">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="login">
          <div className="flex justify-center">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                  Enter your email and password below to login to your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="************"
										onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {failedLogin && (
                  <p className="text-red-500 text-center">Invalid email or password.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="create">
          <div className="flex justify-center">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Signup</CardTitle>
                <CardDescription>
                  Enter an email and password to create your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
										onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="************"
										onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="************"
										onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {notMatchingPasswords && (
                  <p className="text-red-500 text-center">Passwords do not match.</p>
                )}
                {alreadyExists && (
                  <p className="text-red-500 text-center">Account already exists with this email.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
