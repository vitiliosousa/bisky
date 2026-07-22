import Link from "next/link";

export function BiskyLogo({
  className = "h-10",
  href,
}: {
  className?: string;
  href?: string;
}) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logobisky.svg"
      alt="Bisky"
      className={`w-auto ${className}`}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-block shrink-0">
        {img}
      </Link>
    );
  }

  return img;
}
