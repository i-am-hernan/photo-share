import Image from 'next/image';

export default function Banner(props: any) {
  return (
    <div className="bg-background w-full h-full items-center justify-center">
      <div className="w-full h-full">
        <Image
          src="/img/banner.webp"
          alt="Floral decoration left"
          sizes="100vw, 33vw"
          className="object-contain"
          priority
          width={1000}
          height={1000}
        />
      </div>
    </div>
  );
} 