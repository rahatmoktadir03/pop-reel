import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import UploadForm from "../components/UploadForm";

export default async function UploadPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-black px-4 pt-6 pb-24 md:pb-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-black">Upload Video</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Share your moment with the world
        </p>
      </div>
      <UploadForm />
    </div>
  );
}
