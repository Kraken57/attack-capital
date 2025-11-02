import { DialInterface } from "./_components/dial-interface";
import { CallHistory } from "./_components/call-history";

export default function HomePage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">AMD Call System</h1>
      <div className="grid gap-8">
        <DialInterface />
        <CallHistory />
      </div>
    </main>
  );
}
