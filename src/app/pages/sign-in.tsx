import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <SignIn path="/sign-in" routing="path" signInUrl="/sign-up" />
    </div>
  );
}
