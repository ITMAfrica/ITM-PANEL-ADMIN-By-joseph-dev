import Image from 'next/image';
import Link from 'next/link';
import { getIllustration2, ILLUSTRATION_2_PRESETS } from '@/lib/itm-illustrations-2';

export default function NotFound() {
  const art = getIllustration2(ILLUSTRATION_2_PRESETS.notFound);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7F9] px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <Image
          src={art.path}
          alt={art.title}
          width={640}
          height={480}
          className="mx-auto h-auto w-full max-w-lg select-none"
          priority
        />
        <h1 className="mt-8 text-2xl font-bold tracking-tight text-[#1D141F]">
          Page introuvable
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#5C6470]">
          Cette adresse n&apos;existe pas ou a été déplacée. Revenez au tableau de bord pour
          continuer.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-[#1D141F] px-6 text-sm font-semibold text-[#E2F343] transition-opacity hover:opacity-90"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
