import Image from "next/image";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <Image
        src="https://akv-hyjnesha.com/images/Logo/470894537_17891580084134476_2369760557983885793_n.jpg"
        alt="AKV Hyjnesha"
        width={64}
        height={64}
        className="rounded-full border border-border mb-6 opacity-60"
      />
      <h1 className="font-playfair text-2xl font-semibold text-foreground mb-2">
        Du bist offline · Je jeni offline
      </h1>
      <p className="text-muted text-sm max-w-xs">
        Bitte prüfe deine Internetverbindung und versuche es erneut.
        <br />
        Ju lutemi kontrolloni lidhjen tuaj me internetin.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-4 py-2 border border-border text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        Erneut versuchen · Provo përsëri
      </button>
    </div>
  );
}
