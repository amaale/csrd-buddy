// src/app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
      <h1 className="text-4xl font-bold text-green-700">
        🌿 Benvenuto su CSRD Buddy!
      </h1>
      <a
        href="/login"
        className="px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Accedi
      </a>
    </main>
  )
}
