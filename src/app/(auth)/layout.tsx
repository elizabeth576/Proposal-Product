export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-xl">
            P
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">ProposalGen</h1>
          <p className="mt-1 text-sm text-slate-500">Professional Proposal Generator</p>
        </div>
        {children}
      </div>
    </div>
  );
}
