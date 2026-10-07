import { Metadata } from "next";
import LookbookCard from "@/components/lookbook/LookbookCard";
// import { supabase } from "@/lib/supabase"; // Assuming Supabase might be set up

export const metadata: Metadata = {
  title: "My Nếp Việt Lookbook",
  description: "Check out my traditional Vietnamese style on Nếp Việt!",
};

export default async function SharePage({ params }: { params: { slug: string } }) {
  // Mock fetch or actual fetch depending on setup
  // const { data, error } = await supabase.from("lookbooks").select("*").eq("slug", params.slug).single();
  
  const data = null; // Mocking data absence for now since Supabase isn't explicitly configured in instructions
  
  if (!data) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h1 className="font-heading text-2xl text-nep-red mb-2">Lookbook không tồn tại</h1>
          <p className="text-gray-600 mb-6">Có thể đường dẫn đã hết hạn hoặc không đúng.</p>
          <a href="/" className="px-6 py-2 bg-nep-red text-white rounded-full font-medium inline-block">
            Tạo Lookbook mới
          </a>
        </div>
      </main>
    );
  }

  // If found, render LookbookCard
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <LookbookCard result={data} />
      <div className="mt-8">
        <a href="/" className="text-sm font-medium text-nep-indigo hover:underline">
          Tạo Lookbook của riêng bạn →
        </a>
      </div>
    </main>
  );
}
