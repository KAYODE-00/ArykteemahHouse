import Link from 'next/link';
import { Product } from '@/types/product';
import ProductImage from './ProductImage';

interface HeroProps {
  featured: Product[];
}

export default function Hero({ featured }: HeroProps) {
  const [primary, secondary] = featured;

  return (
    <section className="relative overflow-hidden bg-[#F7F5F0] border-b border-[#e7e3d8]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-24 lg:px-8">
        {/* Copy */}
        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium tracking-wide text-[#2F4538]">
            Arykteemah House
          </p>
          <h1
            className="mt-4 font-[family-name:var(--font-fraunces)] text-5xl leading-[1.05] text-[#1B1B18] sm:text-6xl"
          >
            Everyday pieces,
            <br />
            made to be worn often.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#4B4A45]">
            Comfortable staples and small accessories, picked for how they
            hold up after the tenth wash, not just the first photo.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="#collection"
              className="rounded-md bg-[#1B1B18] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2F4538]"
            >
              Shop the collection
            </Link>
            <Link
              href="/?category=shirts"
              className="rounded-md border border-[#1B1B18]/20 px-7 py-3.5 text-sm font-semibold text-[#1B1B18] transition-colors hover:border-[#1B1B18]"
            >
              Browse shirts
            </Link>
          </div>
        </div>

        {/* Image collage */}
        <div className="relative hidden min-h-[420px] lg:block">
          {primary && (
            <div className="absolute right-8 top-0 h-[380px] w-[300px] -rotate-2 overflow-hidden rounded-lg border-4 border-white shadow-xl">
              <ProductImage
                src={primary.image}
                alt={primary.name}
                width={300}
                height={380}
                className="h-full w-full object-cover"
                fallbackText={primary.name}
              />
            </div>
          )}
          {secondary && (
            <div className="absolute left-0 bottom-0 h-[260px] w-[220px] rotate-3 overflow-hidden rounded-lg border-4 border-white shadow-xl">
              <ProductImage
                src={secondary.image}
                alt={secondary.name}
                width={220}
                height={260}
                className="h-full w-full object-cover"
                fallbackText={secondary.name}
              />
            </div>
          )}
        </div>

        {/* Mobile single image */}
        {primary && (
          <div className="relative h-64 w-full overflow-hidden rounded-lg lg:hidden">
            <ProductImage
              src={primary.image}
              alt={primary.name}
              width={600}
              height={400}
              className="h-full w-full object-cover"
              fallbackText={primary.name}
            />
          </div>
        )}
      </div>
    </section>
  );
}
